from flask import Blueprint, render_template, session, redirect, url_for, request, jsonify
from threading import Thread
from connect import db_connection
from service.mail_service import send_faculty_credentials
from models.read_excel import extract_student_data
import random
import string
import os
import re
import pandas as pd

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "admin":
        return redirect(url_for("auth.home"))

    return render_template("admin.html")

# START STUDENT TAB

@admin_bp.route('/api/students', methods=['POST'])
def students():

    file = request.files.get('file')

    if not file:
        return jsonify({
            "success": False,
            "message": "No file uploaded"
        }), 400

    try:

        ext = os.path.splitext(file.filename)[1].lower()

        if ext == '.csv':
            df = pd.read_csv(file, header=None)

        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file, header=None)

        else:
            return jsonify({
                "success": False,
                "message": "Only CSV and Excel files are allowed"
            }), 400

        conn = db_connection()
        cursor = conn.cursor()

        inserted = 0
        skipped = 0

        for _, row in df.iterrows():

            student = extract_student_data(row)

            enrollment_no = student["enrollment_no"]

            if not enrollment_no:
                continue

            cursor.execute(
                "SELECT * FROM students WHERE enrollment_no=%s",
                (enrollment_no,)
            )

            if cursor.fetchone():
                skipped += 1
                continue

            cursor.execute(
                """
                INSERT INTO students
                (
                    enrollment_no,
                    name,
                    email,
                    phone_number,
                    batch,
                    class,
                    department
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    student["enrollment_no"],
                    student["name"],
                    student["email"],
                    student["phone_number"],
                    student["batch"],
                    student["class"],
                    student["department"]
                )
            )

            inserted += 1

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "inserted": inserted,
            "skipped": skipped,
            "message": f"{inserted} students imported successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
        
        
@admin_bp.route('/api/students', methods=['GET'])
def get_students():

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

    return jsonify(students)
    
# END STUDENT TAB

# START ALL FACULTY/MENOR TAB

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
    

# END FACULTY/MENTOR TAB