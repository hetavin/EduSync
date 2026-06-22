from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from models.read_excel import extract_student_data
from connect import db_connection
import pandas as pd

mentor_bp = Blueprint("mentor", __name__)

@mentor_bp.route("/mentor")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "mentor":
        return redirect(url_for("auth.home"))

    return render_template("mentor.html")

@mentor_bp.route("/profile")
def profile():

    user_id = session["user_id"]

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT f.name
        FROM users u
        JOIN faculty f ON u.email = f.email
        WHERE u.id = %s
    """, (user_id,))

    profile = cursor.fetchone()

    return jsonify(profile)

from flask import jsonify

@mentor_bp.route("/displayStudents")
def displayStudents():

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            enrollment_no,
            name,
            email,
            phone_number,
            batch,
            class,
            department
        FROM students
        ORDER BY enrollment_no ASC

    """)

    students = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "count": len(students),
        "students": students
    })
    

@mentor_bp.route('/api/mentor/updateClass', methods=['POST'])
def update_class():

    if 'user_id' not in session:
        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    file = request.files.get('file')

    if not file:
        return jsonify({
            "success": False,
            "message": "No file uploaded"
        }), 400

    try:

        df = pd.read_excel(file, header=None)

        enrollments = []

        for _, row in df.iterrows():

            student = extract_student_data(row)

            if student["enrollment_no"]:
                enrollments.append(student["enrollment_no"])

        if not enrollments:
            return jsonify({
                "success": False,
                "message": "No enrollment numbers found"
            }), 400

        conn = db_connection()
        cursor = conn.cursor()

        # Get mentor class using logged-in user's email
        cursor.execute("""
            SELECT f.class_name
            FROM users u
            JOIN faculty f ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        mentor = cursor.fetchone()

        if not mentor:
            return jsonify({
                "success": False,
                "message": "Mentor not found"
            }), 404

        mentor_class = mentor["class_name"]

        placeholders = ",".join(["%s"] * len(enrollments))

        query = f"""
            UPDATE students
            SET class = %s
            WHERE enrollment_no IN ({placeholders})
        """

        cursor.execute(
            query,
            [mentor_class] + enrollments
        )

        updated = cursor.rowcount

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"{updated} students updated successfully",
            "updated": updated
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500