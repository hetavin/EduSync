from flask import Blueprint, request, jsonify, session
from connect import db_connection
import random
import string
from service.mail_service import send_otp_email
from datetime import datetime, timedelta

forgot_bp = Blueprint("forgot", __name__)

# Store OTPs temporarily (in production, use Redis or database)
otp_storage = {}


def generate_otp():
    """Generate a random 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


@forgot_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.form
        email = data.get("email", "").strip()

        if not email:
            return jsonify({
                "success": False,
                "message": "Email is required"
            }), 400

        conn = db_connection()
        cursor = conn.cursor()

        # Check if email exists in users table
        cursor.execute("""
            SELECT enrollment, email 
            FROM users 
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({
                "success": False,
                "message": "Email not found"
            }), 404

        # Generate OTP
        otp = generate_otp()
        
        # Store OTP with expiry time (10 minutes)
        expiry_time = datetime.now() + timedelta(minutes=10)
        otp_storage[email] = {
            "otp": otp,
            "expiry": expiry_time,
            "verified": False
        }

        # Send OTP via email
        try:
            send_otp_email(email, otp, user["enrollment"])
            
            return jsonify({
                "success": True,
                "message": "OTP sent successfully to your email"
            })
        except Exception as e:
            print(f"Email sending error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Failed to send OTP. Please try again."
            }), 500

    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred. Please try again."
        }), 500


@forgot_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.form
        email = data.get("email", "").strip()
        otp = data.get("otp", "").strip()

        if not email or not otp:
            return jsonify({
                "success": False,
                "message": "Email and OTP are required"
            }), 400

        # Check if OTP exists for this email
        if email not in otp_storage:
            return jsonify({
                "success": False,
                "message": "OTP not found. Please request a new one."
            }), 404

        stored_data = otp_storage[email]

        # Check if OTP is expired
        if datetime.now() > stored_data["expiry"]:
            del otp_storage[email]
            return jsonify({
                "success": False,
                "message": "OTP has expired. Please request a new one."
            }), 400

        # Verify OTP
        if stored_data["otp"] != otp:
            return jsonify({
                "success": False,
                "message": "Invalid OTP. Please try again."
            }), 400

        # Mark OTP as verified
        otp_storage[email]["verified"] = True

        return jsonify({
            "success": True,
            "message": "OTP verified successfully"
        })

    except Exception as e:
        print(f"Verify OTP error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred. Please try again."
        }), 500


@forgot_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.form
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password are required"
            }), 400

        # Check if OTP was verified
        if email not in otp_storage or not otp_storage[email].get("verified"):
            return jsonify({
                "success": False,
                "message": "Please verify OTP first"
            }), 400

        # Update password in database
        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users 
            SET password = %s 
            WHERE email = %s
        """, (password, email))

        conn.commit()
        cursor.close()
        conn.close()

        # Clear OTP data
        del otp_storage[email]

        return jsonify({
            "success": True,
            "message": "Password reset successfully"
        })

    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred. Please try again."
        }), 500


@forgot_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    try:
        data = request.form
        email = data.get("email", "").strip()

        if not email:
            return jsonify({
                "success": False,
                "message": "Email is required"
            }), 400

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, email, username 
            FROM users 
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({
                "success": False,
                "message": "Email not found"
            }), 404

        # Generate new OTP
        otp = generate_otp()
        expiry_time = datetime.now() + timedelta(minutes=10)
        otp_storage[email] = {
            "otp": otp,
            "expiry": expiry_time,
            "verified": False
        }

        # Send OTP via email
        try:
            send_otp_email(email, otp, user["username"])
            
            return jsonify({
                "success": True,
                "message": "New OTP sent successfully"
            })
        except Exception as e:
            print(f"Email sending error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Failed to send OTP"
            }), 500

    except Exception as e:
        print(f"Resend OTP error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred"
        }), 500
