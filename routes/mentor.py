from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from models.read_excel import extract_student_data
from models.detect_face import extract_faces
from models.generate_embeddings import generate_embeddings
from connect import db_connection
import base64
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
        SELECT f.class_name
        FROM users u
        JOIN faculty f ON u.email = f.email
        WHERE u.id = %s
    """, (session["user_id"],))

    mentor = cursor.fetchone()
    
    if not mentor:
        cursor.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Mentor not found"
        }), 404

    mentor_class = mentor["class_name"]

     # Get only students of mentor's class
    cursor.execute("""
    SELECT
        s.enrollment_no,
        s.name,
        s.email,
        s.phone_number,
        s.batch,
        s.class,
        s.department
    FROM students s
    WHERE s.class = %s
    AND NOT EXISTS (
        SELECT 1
        FROM student_face sf
        WHERE sf.enrollment_no = s.enrollment_no
    )
    ORDER BY s.enrollment_no ASC
""", (mentor_class,))

    students = cursor.fetchall()
    
     # Get all students
    cursor.execute(
        "SELECT * FROM students"
    )
    Allstudent = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "count": len(students),
        "totalcount": len(Allstudent),
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
        
        
@mentor_bp.route(
    "/mentor/registerFace",
    methods=["POST"]
)
def register_face():

    try:

        enrollment_no = request.form.get(
            "enrollment_no"
        )

        files = request.files.getlist(
            "images"
        )

        if not enrollment_no:

            return jsonify({
                "success": False,
                "message": "Enrollment number required"
            }), 400

        if len(files) == 0:

            return jsonify({
                "success": False,
                "message": "Please upload images"
            }), 400

        conn = db_connection()
        cursor = conn.cursor()

        saved_faces = 0

        for file in files:

            detected_faces = extract_faces(
                file.stream
            )

            for face_bytes in detected_faces:

                cursor.execute("""
                    INSERT INTO student_face
                    (
                        enrollment_no,
                        face_image,
                        embedding_status
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        'PENDING'
                    )
                """, (
                    enrollment_no,
                    face_bytes
                ))

                saved_faces += 1

        conn.commit()
        
        from threading import Thread

        Thread(
            target=generate_embeddings,
            args=(enrollment_no,),
            daemon=True
        ).start()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"{saved_faces} faces saved successfully"
        })

    except Exception as e:

        print("Register Face Error:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
        

@mentor_bp.route(
    "/mentor/checkEmbeddingStatus/<enrollment>"
)
def check_embedding_status(enrollment):

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) total,
            SUM(
                embedding_status='SUCCESS'
            ) success_count,
            SUM(
                embedding_status='FAILED'
            ) failed_count
        FROM student_face
        WHERE enrollment_no=%s
    """, (
        enrollment,
    ))

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result[2] > 0:

        return jsonify({
            "status": "FAILED"
        })

    if result[1] == result[0]:

        return jsonify({
            "status": "SUCCESS"
        })

    return jsonify({
        "status": "PENDING"
    })
        

@mentor_bp.route("/mentor/getRegisteredFaces")
def get_registered_faces():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    try:

        conn = db_connection()
        cursor = conn.cursor()

        # Get mentor class
        cursor.execute("""
            SELECT f.class_name
            FROM users u
            JOIN faculty f
                ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        mentor = cursor.fetchone()

        if not mentor:
            return jsonify({
                "success": False,
                "message": "Mentor not found"
            }), 404

        mentor_class = mentor["class_name"]

        # Registered students of mentor class only
        cursor.execute("""
            SELECT
                s.enrollment_no,
                s.name,
                s.class,
                COUNT(sf.id) AS imageCount,
                MIN(sf.created_at) AS registeredDate
            FROM students s
            INNER JOIN student_face sf
                ON s.enrollment_no = sf.enrollment_no
            WHERE s.class = %s
            GROUP BY
                s.enrollment_no,
                s.name,
                s.class
            ORDER BY s.enrollment_no ASC
        """, (mentor_class,))

        students = cursor.fetchall()

        result = []

        for student in students:

            cursor.execute("""
                SELECT face_image
                FROM student_face
                WHERE enrollment_no = %s
            """, (student["enrollment_no"],))

            images = cursor.fetchall()

            image_list = []

            for img in images:

                image_base64 = base64.b64encode(
                    img["face_image"]
                ).decode("utf-8")

                image_list.append({
                    "data": f"data:image/jpeg;base64,{image_base64}"
                })

            result.append({
                "enrollment": student["enrollment_no"],
                "name": student["name"],
                "class": student["class"],
                "imageCount": student["imageCount"],
                "registeredDate":
                    student["registeredDate"].strftime("%d-%m-%Y")
                    if student["registeredDate"]
                    else "",
                "images": image_list
            })

        return jsonify({
            "success": True,
            "students": result
        })

    except Exception as e:

        print("Get Faces Error:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        conn.close()
        
        
@mentor_bp.route(
    "/mentor/deleteFaceRegistration",
    methods=["POST"]
)
def delete_face_registration():

    try:

        data = request.get_json()

        enrollment_no = data.get(
            "enrollment_no"
        )

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM student_face
            WHERE enrollment_no = %s
        """, (enrollment_no,))

        deleted = cursor.rowcount

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"{deleted} face images deleted"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500



# ===== ATTENDANCE APIs =====

@mentor_bp.route("/api/mentor/attendance/daily")
def get_daily_attendance():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    date = request.args.get("date")
    batch = request.args.get("batch", "")
    search = request.args.get("search", "")

    if not date:
        return jsonify({"success": False, "message": "Date required"}), 400

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get mentor class
        cursor.execute("""
            SELECT f.class_name
            FROM users u
            JOIN faculty f ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        mentor = cursor.fetchone()
        if not mentor:
            return jsonify({"success": False, "message": "Mentor not found"}), 404

        mentor_class = mentor["class_name"]

        # Query students from mentor's class only
        query = """
            SELECT 
                s.enrollment_no,
                s.name,
                s.batch,
                s.class,
                MAX(CASE WHEN a.time_slot = 'slot1' THEN a.status END) as slot1,
                MAX(CASE WHEN a.time_slot = 'slot2' THEN a.status END) as slot2,
                MAX(CASE WHEN a.time_slot = 'slot3' THEN a.status END) as slot3,
                MAX(CASE WHEN a.time_slot = 'slot4' THEN a.status END) as slot4,
                MAX(CASE WHEN a.time_slot = 'slot5' THEN a.status END) as slot5,
                MAX(CASE WHEN a.time_slot = 'slot6' THEN a.status END) as slot6,
                MAX(CASE WHEN a.time_slot = 'lab1' THEN a.status END) as lab1,
                MAX(CASE WHEN a.time_slot = 'lab2' THEN a.status END) as lab2,
                MAX(CASE WHEN a.time_slot = 'lab3' THEN a.status END) as lab3
            FROM students s
            LEFT JOIN attendance a ON s.enrollment_no = a.enrollment_no AND a.date = %s
            WHERE s.class = %s
        """

        params = [date, mentor_class]
        
        if batch:
            query += " AND s.batch = %s"
            params.append(batch)
        if search:
            query += " AND (s.enrollment_no LIKE %s OR s.name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " GROUP BY s.enrollment_no, s.name, s.batch, s.class ORDER BY s.enrollment_no"

        cursor.execute(query, tuple(params))
        students = cursor.fetchall()

        # Get filters for mentor's class
        cursor.execute("SELECT DISTINCT batch FROM students WHERE batch IS NOT NULL AND class = %s ORDER BY batch", (mentor_class,))
        batches = [row['batch'] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT class FROM students WHERE class IS NOT NULL AND class = %s ORDER BY class", (mentor_class,))
        classes = [row['class'] for row in cursor.fetchall()]

        return jsonify({
            "success": True,
            "students": students,
            "batches": batches,
            "classes": classes
        })

    except Exception as e:
        print(f"Daily Attendance Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@mentor_bp.route("/api/mentor/attendance/monthly")
def get_monthly_attendance():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    year = request.args.get("year", "2025")

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get mentor class
        cursor.execute("""
            SELECT f.class_name
            FROM users u
            JOIN faculty f ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        mentor = cursor.fetchone()
        if not mentor:
            return jsonify({"success": False, "message": "Mentor not found"}), 404

        mentor_class = mentor["class_name"]

        query = """
SELECT
    s.enrollment_no,
    s.name,
    s.batch,
    s.class,

    ROUND(SUM(CASE WHEN MONTH(a.date)=1  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS jan,
    ROUND(SUM(CASE WHEN MONTH(a.date)=2  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS feb,
    ROUND(SUM(CASE WHEN MONTH(a.date)=3  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS mar,
    ROUND(SUM(CASE WHEN MONTH(a.date)=4  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS apr,
    ROUND(SUM(CASE WHEN MONTH(a.date)=5  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS may,
    ROUND(SUM(CASE WHEN MONTH(a.date)=6  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS jun,
    ROUND(SUM(CASE WHEN MONTH(a.date)=7  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS jul,
    ROUND(SUM(CASE WHEN MONTH(a.date)=8  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS aug,
    ROUND(SUM(CASE WHEN MONTH(a.date)=9  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS sep,
    ROUND(SUM(CASE WHEN MONTH(a.date)=10 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS oct,
    ROUND(SUM(CASE WHEN MONTH(a.date)=11 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS nov,
    ROUND(SUM(CASE WHEN MONTH(a.date)=12 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) AS `dec`,

    ROUND(
        (
            SUM(CASE WHEN MONTH(a.date)=1  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=2  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=3  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=4  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=5  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=6  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=7  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=8  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=9  AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=10 AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=11 AND a.status='present' THEN 1 ELSE 0 END)*100/120 +
            SUM(CASE WHEN MONTH(a.date)=12 AND a.status='present' THEN 1 ELSE 0 END)*100/120
        ) / 12,
    2) AS avg_attendance

FROM students s

LEFT JOIN attendance a
    ON s.enrollment_no = a.enrollment_no
    AND YEAR(a.date) = %s

WHERE s.class = %s

GROUP BY
    s.enrollment_no,
    s.name,
    s.batch,
    s.class

ORDER BY s.enrollment_no
"""

        cursor.execute(query, (year, mentor_class))
        students = cursor.fetchall()

        return jsonify({
            "success": True,
            "students": students
        })

    except Exception as e:
        print(f"Monthly Attendance Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@mentor_bp.route("/api/mentor/attendance/student-detail")
def get_student_detail_attendance():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    enrollment = request.args.get("enrollment")
    month = request.args.get("month")
    year = request.args.get("year")

    if not all([enrollment, month, year]):
        return jsonify({"success": False, "message": "Missing parameters"}), 400

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Verify mentor has access to this student
        cursor.execute("""
            SELECT f.class_name
            FROM users u
            JOIN faculty f ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        mentor = cursor.fetchone()
        if not mentor:
            return jsonify({"success": False, "message": "Mentor not found"}), 404

        # Get student info and verify belongs to mentor's class
        cursor.execute("""
            SELECT enrollment_no, name, batch, class, department
            FROM students
            WHERE enrollment_no = %s AND class = %s
        """, (enrollment, mentor["class_name"]))

        student = cursor.fetchone()
        if not student:
            return jsonify({"success": False, "message": "Student not found or not in your class"}), 404

        # Get attendance for the month
        cursor.execute("""
            SELECT 
                DATE(date) as date,
                MAX(CASE WHEN time_slot = 'slot1' THEN status END) as slot1,
                MAX(CASE WHEN time_slot = 'slot2' THEN status END) as slot2,
                MAX(CASE WHEN time_slot = 'slot3' THEN status END) as slot3,
                MAX(CASE WHEN time_slot = 'slot4' THEN status END) as slot4,
                MAX(CASE WHEN time_slot = 'slot5' THEN status END) as slot5,
                MAX(CASE WHEN time_slot = 'slot6' THEN status END) as slot6,
                MAX(CASE WHEN time_slot = 'lab1' THEN status END) as lab1,
                MAX(CASE WHEN time_slot = 'lab2' THEN status END) as lab2,
                MAX(CASE WHEN time_slot = 'lab3' THEN status END) as lab3
            FROM attendance
            WHERE enrollment_no = %s 
                AND MONTH(date) = %s 
                AND YEAR(date) = %s
            GROUP BY DATE(date)
            ORDER BY date
        """, (enrollment, month, year))

        attendance = cursor.fetchall()

        return jsonify({
            "success": True,
            "student": student,
            "attendance": attendance
        })

    except Exception as e:
        print(f"Student Detail Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
