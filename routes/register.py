from flask import Blueprint, request, redirect, url_for, flash
from flask import jsonify
from connect import db_connection

register_bp = Blueprint("register", __name__)

@register_bp.route("/register", methods=["POST"])
def register():

    enrollment = request.form.get("enrollment")
    email = request.form.get("email")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")

    # Validation
    if password != confirm_password:
        flash("Passwords do not match!", "danger")
        return redirect(url_for("auth.home"))

    conn = db_connection()
    cursor = conn.cursor()

    # Check existing user
    cursor.execute(
        "SELECT * FROM users WHERE enrollment=%s OR email=%s",
        (enrollment, email)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({
        "success": False,
        "show_login": True,
        "message": "Account already exists. Please login."
        }), 409

    # Insert user
    cursor.execute(
        """
        INSERT INTO users
        (enrollment, email, password)
        VALUES (%s, %s, %s)
        """,
        (enrollment, email, password)
    )

    conn.commit()

    cursor.close()
    conn.close()

    flash("Registration successful! Please login.", "success")

    return redirect(url_for("auth.home"))