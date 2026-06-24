from flask import Blueprint, render_template, session, redirect, url_for, jsonify
from connect import db_connection
from datetime import datetime

student_bp = Blueprint("student", __name__)

@student_bp.route("/student")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "student":
        return redirect(url_for("auth.home"))

    return render_template("student.html")

@student_bp.route("/api/student/profile", methods=["GET"])
def get_profile():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        # Get student enrollment number from users table
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        # Get student details
        cursor.execute(
            """SELECT enrollment_no, name, email, phone_number, batch, class, department 
               FROM students WHERE enrollment_no = %s""",
            (enrollment_no,)
        )
        student = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not student:
            return jsonify({"success": False, "message": "Student details not found"}), 404
        
        return jsonify({
            "success": True,
            "student": {
                "enrollment_no": student['enrollment_no'],
                "name": student['name'],
                "email": student['email'],
                "phone_number": student['phone_number'] or 'N/A',
                "batch": student['batch'] or 'N/A',
                "class": student['class'] or 'N/A',
                "department": student['department'] or 'N/A'
            }
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/stats", methods=["GET"])
def get_attendance_stats():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        # Get enrollment number
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        # Get current month attendance
        current_month = datetime.now().strftime('%Y-%m')
        cursor.execute(
            """SELECT 
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                   SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
               FROM attendance 
               WHERE enrollment_no = %s AND DATE_FORMAT(date, '%%Y-%%m') = %s""",
            (enrollment_no, current_month)
        )
        month_stats = cursor.fetchone()
        
        # Get overall attendance
        cursor.execute(
            """SELECT 
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                   SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
               FROM attendance 
               WHERE enrollment_no = %s""",
            (enrollment_no,)
        )
        overall_stats = cursor.fetchone()
        
        # Get today's attendance
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute(
            """SELECT status FROM attendance 
               WHERE enrollment_no = %s AND date = %s
               ORDER BY created_at DESC LIMIT 1""",
            (enrollment_no, today)
        )
        today_record = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Calculate percentages
        overall_attendance = 0
        if overall_stats['total'] > 0:
            overall_attendance = round((overall_stats['present'] / overall_stats['total']) * 100, 1)
        
        monthly_attendance = 0
        if month_stats['total'] > 0:
            monthly_attendance = round((month_stats['present'] / month_stats['total']) * 100, 1)
        
        return jsonify({
            "success": True,
            "stats": {
                "overall_percentage": overall_attendance,
                "monthly_present": month_stats['present'] or 0,
                "monthly_absent": month_stats['absent'] or 0,
                "monthly_percentage": monthly_attendance,
                "today_status": today_record['status'] if today_record else 'not_marked'
            }
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/recent", methods=["GET"])
def get_recent_attendance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        # Get enrollment number
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        # Get last 7 days attendance
        cursor.execute(
            """SELECT date, time_slot, status, created_at
               FROM attendance 
               WHERE enrollment_no = %s 
               ORDER BY date DESC, created_at DESC 
               LIMIT 7""",
            (enrollment_no,)
        )
        records = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        attendance_list = []
        for record in records:
            date_obj = record['date']
            attendance_list.append({
                "date": date_obj.strftime('%Y-%m-%d'),
                "day": date_obj.strftime('%a'),
                "display_date": date_obj.strftime('%b %d'),
                "time_slot": record['time_slot'],
                "status": record['status']
            })
        
        return jsonify({
            "success": True,
            "attendance": attendance_list
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/history", methods=["GET"])
def get_attendance_history():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        # Get enrollment number
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        # Get attendance history
        cursor.execute(
            """SELECT date, time_slot, status, created_at
               FROM attendance 
               WHERE enrollment_no = %s 
               ORDER BY date DESC, created_at DESC""",
            (enrollment_no,)
        )
        records = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        history_list = []
        for record in records:
            date_obj = record['date']
            history_list.append({
                "date": date_obj.strftime('%b %d, %Y'),
                "day": date_obj.strftime('%A'),
                "time_slot": record['time_slot'],
                "status": record['status']
            })
        
        return jsonify({
            "success": True,
            "history": history_list
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500