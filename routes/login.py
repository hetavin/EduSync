from flask import Blueprint, request, redirect, url_for, flash, session
from flask import jsonify
from connect import db_connection

login_bp = Blueprint("login", __name__)

@login_bp.route("/login", methods=["POST"])
def login():

    enrollment = request.form.get("enrollment")
    password = request.form.get("password")

    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE enrollment=%s
        AND password=%s
        AND is_active=TRUE
        """,
        (enrollment, password)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    # User not found
    if not user:
        return jsonify({
            "success": False,
            "show_register": True,
            "message": "Account not found. Please register first."
        }), 404

    # Wrong password
    if user["password"] != password:
        return jsonify({
            "success": False,
            "message": "Incorrect password."
        }), 401

    # Store session
    session["user_id"] = user["id"]
    session["enrollment"] = user["enrollment"]
    session["role"] = user["role"]

    flash("Login Successful!", "success")

    # Redirect according to role
    if user["role"] == "admin":
        return jsonify({
        "success": True,
        "redirect": url_for("admin.dashboard")
    })

    elif user["role"] == "mentor":
        return jsonify({
        "success": True,
        "redirect": url_for("mentor.dashboard")
    })

    elif user["role"] == "faculty":
         return jsonify({
        "success": True,
        "redirect": url_for("teacher.dashboard")
    })
    elif user["role"] == "student":
        return jsonify({
        "success": True,
        "redirect": url_for("student.dashboard")
    })

    flash("Invalid role assigned!", "danger")
    return redirect(url_for("auth.home"))