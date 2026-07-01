from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from connect import db_connection
from datetime import datetime
from PIL import Image
from io import BytesIO
from models.detect_face import detect_faces_from_tiles
from models.generate_embeddings import detections_to_embeddings


teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/teacher")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "faculty":
        return redirect(url_for("auth.home"))

    return render_template("teacher.html", name=session.get("name", "Teacher"))

@teacher_bp.route("/api/teacher/profile")
def get_teacher_profile():
    try:
        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT f.name
            FROM users u
            INNER JOIN faculty f ON u.email = f.email
            WHERE u.id = %s
        """, (session["user_id"],))

        result = cursor.fetchone()
        
        # return jsonify(result)
        # return jsonify({
        #     "success": True,
        #     "name": result[0]
        # })
        
        if not result:
            print("NO RESULT FOUND")
            return jsonify({
                "success": False,
                "message": "Profile not found"
            }), 404

        print("RESULT FOUND")
        return jsonify({
            "success": True,
            "name": result["name"]
        })
        
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500        

@teacher_bp.route("/api/teacher/batch-classes")
def get_batch_classes():

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT
            batch,
            class
        FROM students
        WHERE batch IS NOT NULL
        AND class IS NOT NULL
        ORDER BY batch, class
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


@teacher_bp.route(
    "/teacher/processAttendance",
    methods=["POST"]
)
def process_attendance():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    faculty_id = session["user_id"]

    batch = request.form.get("batch")
    class_name = request.form.get("class")
    attendance_date = request.form.get("date")
    slot = request.form.get("slot")

    images = request.files.getlist("images")

    if not batch:
        return jsonify({
            "success": False,
            "message": "Batch required"
        }), 400

    if not class_name:
        return jsonify({
            "success": False,
            "message": "Class required"
        }), 400

    if not attendance_date:
        return jsonify({
            "success": False,
            "message": "Date required"
        }), 400

    if not slot:
        return jsonify({
            "success": False,
            "message": "Slot required"
        }), 400

    if not images:
        return jsonify({
            "success": False,
            "message": "Upload image"
        }), 400

    conn = None
    cursor = None
    
    try:

        present_students = set()

        total_faces = 0

        for image_file in images:

            image = Image.open(
                BytesIO(
                    image_file.read()
                )
            ).convert("RGB")

            detections = detect_faces_from_tiles(
                image
            )

            total_faces += len(
                detections
            )

            result = detections_to_embeddings(
                image,
                detections
            )

            present_students.update(
                result["present_students"]
            )

        conn = db_connection()

        cursor = conn.cursor()

        # cursor.execute("""
        #     DELETE FROM attendance
        #     WHERE batch=%s
        #     AND class=%s
        #     AND date=%s
        #     AND time_slot=%s
        # """, (
        #     batch,
        #     class_name,
        #     attendance_date,
        #     slot
        # ))

        for enrollment_no in present_students:

            cursor.execute("""
                INSERT IGNORE INTO attendance(
                    enrollment_no,
                    faculty_id,
                    batch,
                    class,
                    date,
                    time_slot,
                    status
                )
                VALUES(
                    %s,%s,%s,%s,%s,%s,
                    'present'
                )
            """, (
                enrollment_no,
                faculty_id,
                batch,
                class_name,
                attendance_date,
                slot
            ))

        conn.commit()

        return jsonify({

            "success": True,

            "message":
            "Attendance processed successfully",

            "total_faces_detected":
            total_faces,

            "present_count":
            len(present_students),

            "present_students":
            sorted(
                list(present_students)
            )
        })

    except Exception as e:

        if conn:
            conn.rollback()

        import traceback
        print("\n=== Attendance Processing Error ===")
        print(f"Error: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        print("==================================\n")

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()
            
@teacher_bp.route("/api/teacher/getattendance")
def get_attendance():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    batch = request.args.get("batch", "")
    class_name = request.args.get("class", "")

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                a.enrollment_no,
                s.name,
                s.email,
                s.phone_number,
                a.batch,
                a.class,
                COUNT(DISTINCT a.date) AS total_classes,
                SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) AS present_count
            FROM attendance a
            LEFT JOIN students s ON a.enrollment_no = s.enrollment_no
            WHERE a.enrollment_no IS NOT NULL
        """

        params = []
        if batch:
            query += " AND a.batch = %s"
            params.append(batch)
        if class_name:
            query += " AND a.class = %s"
            params.append(class_name)

        query += """
            GROUP BY a.enrollment_no, s.name, s.email, s.phone_number, a.batch, a.class
            ORDER BY s.name
        """

        if params:
            cursor.execute(query, tuple(params))
        else:
            cursor.execute(query)

        students = cursor.fetchall()

        # Calculate attendance percentage and absent count
        for student in students:
            total = student["total_classes"] or 0
            present = student["present_count"] or 0
            absent = total - present

            if total > 0:
                percentage = (present / 156) * 100
            else:
                percentage = 0

            student["attendance_percentage"] = round(percentage, 2)
            student["absent_count"] = absent

        # Get filter options from attendance table
        cursor.execute("""
            SELECT DISTINCT batch FROM attendance 
            WHERE batch IS NOT NULL 
            ORDER BY batch
        """)
        batches = [row['batch'] for row in cursor.fetchall()]

        cursor.execute("""
            SELECT DISTINCT class FROM attendance 
            WHERE class IS NOT NULL 
            ORDER BY class
        """)
        classes = [row['class'] for row in cursor.fetchall()]

        return jsonify({
            "success": True,
            "students": students,
            "batches": batches,
            "classes": classes
        })

    except Exception as e:
        print(f"\n=== Get Attendance Error ===")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("===========================\n")
        
        return jsonify({
            "success": False, 
            "message": f"Error: {str(e)}"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@teacher_bp.route("/api/teacher/attendance/daily")
def get_daily_attendance():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    date = request.args.get("date", "")
    batch = request.args.get("batch", "")
    class_name = request.args.get("class", "")
    search = request.args.get("search", "")

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

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
            WHERE 1=1
        """

        params = [date]
        
        if batch:
            query += " AND s.batch = %s"
            params.append(batch)
        if class_name:
            query += " AND s.class = %s"
            params.append(class_name)
        if search:
            query += " AND (s.enrollment_no LIKE %s OR s.name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " GROUP BY s.enrollment_no, s.name, s.batch, s.class ORDER BY s.enrollment_no"

        cursor.execute(query, tuple(params))
        students = cursor.fetchall()

        cursor.execute("SELECT DISTINCT batch FROM students WHERE batch IS NOT NULL ORDER BY batch")
        batches = [row['batch'] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT class FROM students WHERE class IS NOT NULL ORDER BY class")
        classes = [row['class'] for row in cursor.fetchall()]

        return jsonify({
            "success": True,
            "students": students,
            "batches": batches,
            "classes": classes
        })

    except Exception as e:
        print(f"Daily Attendance Error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@teacher_bp.route("/api/teacher/attendance/monthly")
def get_monthly_attendance():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    year = request.args.get("year", "2025")

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

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
                        ROUND(SUM(CASE WHEN MONTH(a.date)=1  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=2  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=3  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=4  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=5  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=6  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=7  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=8  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=9  AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=10 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=11 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2) +
                        ROUND(SUM(CASE WHEN MONTH(a.date)=12 AND a.status='present' THEN 1 ELSE 0 END)*100/120,2)
                    ) / 12,
                2) AS avg_attendance

            FROM students s

            LEFT JOIN attendance a
            ON s.enrollment_no = a.enrollment_no
            AND YEAR(a.date) = %s

            GROUP BY
                s.enrollment_no,
                s.name,
                s.batch,
                s.class

            ORDER BY s.enrollment_no
            """

        cursor.execute(query, (year,))
        students = cursor.fetchall()

        return jsonify({
            "success": True,
            "students": students
        })

    except Exception as e:
        print(f"Monthly Attendance Error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@teacher_bp.route("/api/teacher/attendance/student-detail")
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

        cursor.execute("""
            SELECT enrollment_no, name, batch, class, department
            FROM students
            WHERE enrollment_no = %s
        """, (enrollment,))

        student = cursor.fetchone()
        if not student:
            return jsonify({"success": False, "message": "Student not found"}), 404

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
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@teacher_bp.route("/api/teacher/recent-activity")
def get_recent_activity():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                a.enrollment_no,
                s.name,
                a.batch,
                a.class,
                a.date,
                a.time_slot,
                a.status
            FROM attendance a
            LEFT JOIN students s ON a.enrollment_no = s.enrollment_no
            WHERE a.faculty_id = %s
            ORDER BY a.date DESC, a.id DESC
            LIMIT 10
        """, (session["user_id"],))

        rows = cursor.fetchall()

        return jsonify({"success": True, "activities": rows})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@teacher_bp.route("/api/teacher/attendance/years")
def get_attendance_years():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT DISTINCT YEAR(date) as year
            FROM attendance
            WHERE date IS NOT NULL
            ORDER BY year DESC
        """)

        years = [row['year'] for row in cursor.fetchall()]
        
        if not years:
            current_year = datetime.now().year
            years = [current_year]

        return jsonify({
            "success": True,
            "years": years
        })

    except Exception as e:
        print(f"Get Years Error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
