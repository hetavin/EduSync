from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from connect import db_connection
from service.attendance_stats import (
    class_key,
    conducted_by_month,
    conducted_sessions,
    monthly_row,
    percentage
)
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

        # The student's batch + class decides which conducted lectures
        # their percentage is measured against
        cursor.execute(
            "SELECT batch, class FROM students WHERE enrollment_no = %s",
            (enrollment_no,)
        )
        student = cursor.fetchone() or {"batch": "", "class": ""}

        now = datetime.now()

        # Get current month attendance
        cursor.execute(
            """SELECT
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
               FROM attendance
               WHERE enrollment_no = %s
                 AND YEAR(date) = %s AND MONTH(date) = %s""",
            (enrollment_no, now.year, now.month)
        )
        month_stats = cursor.fetchone()

        # Lectures conducted for this class this month
        monthly_conducted = conducted_sessions(
            cursor,
            student["batch"],
            student["class"],
            year=now.year,
            month=now.month
        )

        # Get overall attendance
        cursor.execute(
            """SELECT
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
               FROM attendance
               WHERE enrollment_no = %s""",
            (enrollment_no,)
        )
        overall_stats = cursor.fetchone()

        overall_conducted = conducted_sessions(
            cursor,
            student["batch"],
            student["class"]
        )

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
        
        # Percentages are measured against conducted lectures, so they
        # move on their own as attendance is taken for new slots
        monthly_present = int(month_stats['present'] or 0)
        overall_present = int(overall_stats['present'] or 0)

        return jsonify({
            "success": True,
            "stats": {
                "overall_percentage": percentage(
                    overall_present, overall_conducted
                ),
                "overall_present": overall_present,
                "overall_conducted": overall_conducted,
                "monthly_present": monthly_present,
                "monthly_absent": max(monthly_conducted - monthly_present, 0),
                "monthly_conducted": monthly_conducted,
                "monthly_percentage": percentage(
                    monthly_present, monthly_conducted
                ),
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

@student_bp.route("/api/student/attendance/daily", methods=["GET"])
def get_daily_attendance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        cursor.execute(
            """SELECT 
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
               WHERE enrollment_no = %s AND date = %s
               GROUP BY DATE(date)""",
            (enrollment_no, date)
        )
        attendance = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "attendance": [attendance] if attendance else []
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/monthly", methods=["GET"])
def get_monthly_attendance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        # Get month and year from query params or use current
        month = request.args.get('month', datetime.now().month)
        year = request.args.get('year', datetime.now().year)
        
        cursor.execute(
            """SELECT 
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
               ORDER BY date DESC""",
            (enrollment_no, month, year)
        )
        attendance = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "attendance": attendance
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/yearly", methods=["GET"])
def get_yearly_attendance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        year = request.args.get('year', datetime.now().year)

        cursor.execute(
            "SELECT batch, class FROM students WHERE enrollment_no = %s",
            (enrollment_no,)
        )
        student = cursor.fetchone() or {"batch": "", "class": ""}

        # Lectures the student attended, per month
        cursor.execute(
            """SELECT MONTH(date) AS month, COUNT(*) AS present
               FROM attendance
               WHERE enrollment_no = %s
                 AND YEAR(date) = %s
                 AND status = 'present'
               GROUP BY MONTH(date)""",
            (enrollment_no, year)
        )
        present_months = {
            row["month"]: row["present"] for row in cursor.fetchall()
        }

        # Lectures conducted for the student's class, per month
        conducted = conducted_by_month(cursor, year).get(
            class_key(student["batch"], student["class"]), {}
        )

        yearly_data = monthly_row(present_months, conducted)

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "yearly": yearly_data
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@student_bp.route("/api/student/attendance/years", methods=["GET"])
def get_attendance_years():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        conn = db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT enrollment FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        enrollment_no = user['enrollment']
        
        cursor.execute(
            """SELECT DISTINCT YEAR(date) as year
               FROM attendance
               WHERE enrollment_no = %s AND date IS NOT NULL
               ORDER BY year DESC""",
            (enrollment_no,)
        )
        years = [row['year'] for row in cursor.fetchall()]
        
        if not years:
            years = [datetime.now().year]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "years": years
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
