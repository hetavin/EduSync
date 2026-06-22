from flask import Blueprint, render_template, session, redirect, url_for, jsonify
from connect import db_connection

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
            class
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
    