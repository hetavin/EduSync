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

    return render_template("teacher.html")


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

    # try:

    #     present_students = set()

    #     total_faces = 0

    #     for image_file in images:

    #         image_bytes = np.frombuffer(
    #             image_file.read(),
    #             np.uint8
    #         )

    #         image = cv2.imdecode(
    #             image_bytes,
    #             cv2.IMREAD_COLOR
    #         )

    #         if image is None:
    #             continue

    #         result = slice_image_with_overlap(
    #             image
    #         )

    #         total_faces += result[
    #             "total_faces"
    #         ]

    #         present_students.update(
    #             result["present_students"]
    #         )

    #     conn = db_connection()

    #     cursor = conn.cursor()

    #     cursor.execute("""
    #         DELETE FROM attendance
    #         WHERE batch=%s
    #           AND class=%s
    #           AND date=%s
    #           AND time_slot=%s
    #     """, (
    #         batch,
    #         class_name,
    #         attendance_date,
    #         slot
    #     ))

    #     for enrollment_no in present_students:

    #         cursor.execute("""
    #             INSERT INTO attendance(
    #                 enrollment_no,
    #                 faculty_id,
    #                 batch,
    #                 class,
    #                 date,
    #                 time_slot,
    #                 status
    #             )
    #             VALUES(
    #                 %s,%s,%s,%s,%s,%s,
    #                 'present'
    #             )
    #         """, (
    #             enrollment_no,
    #             faculty_id,
    #             batch,
    #             class_name,
    #             attendance_date,
    #             slot
    #         ))

    #     conn.commit()
    
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

        cursor.execute("""
            DELETE FROM attendance
            WHERE batch=%s
            AND class=%s
            AND date=%s
            AND time_slot=%s
        """, (
            batch,
            class_name,
            attendance_date,
            slot
        ))

        for enrollment_no in present_students:

            cursor.execute("""
                INSERT INTO attendance(
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