from flask import Blueprint, render_template, session, redirect, url_for, request, jsonify
from threading import Thread
from connect import db_connection
from service.mail_service import send_faculty_credentials
import random
import string

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin")
def dashboard():

    if session.get("role") != "admin":
        return redirect(url_for("auth.home"))

    return render_template("dashboard.html")
import random
import string

@admin_bp.route('/api/faculty', methods=['POST'])
def add_faculty():

    data = request.get_json()

    conn = db_connection()
    cursor = conn.cursor()

    try:
        # Check existing email
        cursor.execute(
            "SELECT 1 FROM faculty WHERE email=%s",
            (data['email'],)
        )

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Faculty Already Exists"
            }), 400

        # Generate Faculty ID
        faculty_id = f"FAC{random.randint(1000,9999)}"

        # Generate Password
        password = ''.join(
            random.choices(
                string.ascii_letters + string.digits,
                k=8
            )
        )

        # Insert User
        cursor.execute("""
            INSERT INTO users
            (enrollment, email, password, role)
            VALUES (%s,%s,%s,%s)
        """, (
            faculty_id,
            data['email'],
            password,
            data['type']
        ))

        # Insert Faculty
        cursor.execute("""
            INSERT INTO faculty
            (type, name, email, profession, class_name)
            VALUES (%s,%s,%s,%s,%s)
        """, (
            data['type'],
            data['name'],
            data['email'],
            data['profession'],
            data.get('class', '')
        ))

        conn.commit()

        # Send email in background
        Thread(
            target=send_faculty_credentials,
            args=(
                data['email'],
                faculty_id,
                password,
                data['type']
            ),
            daemon=True
        ).start()

        return jsonify({
            "success": True,
            "message": "Faculty Added Successfully",
            "faculty_id": faculty_id,
            "password": password
        })

    except Exception as e:
        conn.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()
        
        
# Get Faculty
@admin_bp.route('/api/faculty', methods=['GET'])
def get_faculty():

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM faculty
        ORDER BY id DESC
    """)

    faculty = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(faculty)

# Delete Faculty
@admin_bp.route('/api/faculty/<int:id>', methods=['DELETE'])
def delete_faculty(id):

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM faculty WHERE id=%s",
        (id,)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success":True,
        "message":"Deleted Successfully"
    })