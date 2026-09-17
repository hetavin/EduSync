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
import pymysql

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
        duplicates = []
        invalid = []

        # Values already used inside this file, so two rows sharing an
        # email or phone number don't collide on the unique indexes
        seen_enrollment = set()
        seen_email = set()
        seen_phone = set()

        for _, row in df.iterrows():

            student = extract_student_data(row)

            enrollment_no = student["enrollment_no"]

            if not enrollment_no:
                continue

            # phone_number is UNIQUE, so blanks must be NULL
            email = student["email"] or None
            phone_number = student["phone_number"] or None

            # email is NOT NULL and UNIQUE, so a row without one
            # can never be stored
            if not email:
                skipped += 1
                invalid.append(enrollment_no)
                continue

            if (
                enrollment_no in seen_enrollment
                or email in seen_email
                or (phone_number and phone_number in seen_phone)
            ):
                skipped += 1
                duplicates.append(enrollment_no)
                continue

            cursor.execute(
                """
                SELECT enrollment_no FROM students
                WHERE enrollment_no=%s
                   OR email=%s
                   OR (%s IS NOT NULL AND phone_number=%s)
                """,
                (
                    enrollment_no,
                    email,
                    phone_number, phone_number
                )
            )

            if cursor.fetchone():
                skipped += 1
                duplicates.append(enrollment_no)
                continue

            try:
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
                        enrollment_no,
                        student["name"],
                        email,
                        phone_number,
                        student["batch"],
                        student["class"],
                        student["department"]
                    )
                )

            except pymysql.err.IntegrityError:
                # Anything the checks above missed: skip the row
                # instead of losing the whole import
                skipped += 1
                duplicates.append(enrollment_no)
                continue

            seen_enrollment.add(enrollment_no)
            seen_email.add(email)

            if phone_number:
                seen_phone.add(phone_number)

            inserted += 1

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "inserted": inserted,
            "skipped": skipped,
            "duplicates": duplicates,
            "invalid": invalid,
            "message": f"{inserted} students imported successfully"
                       + (f", {skipped} rows skipped" if skipped else "")
        })

    except Exception as e:

        try:
            conn.rollback()
            cursor.close()
            conn.close()

        except Exception:
            pass

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

# Dashboard Stats
@admin_bp.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS cnt FROM students")
    total_students = cursor.fetchone()['cnt']

    cursor.execute("SELECT COUNT(*) AS cnt FROM faculty WHERE type='mentor'")
    total_mentors = cursor.fetchone()['cnt']

    cursor.execute("SELECT COUNT(*) AS cnt FROM faculty WHERE type='faculty'")
    total_faculties = cursor.fetchone()['cnt']

    cursor.close()
    conn.close()

    return jsonify({
        "total_students": total_students,
        "total_mentors": total_mentors,
        "total_faculties": total_faculties
    })