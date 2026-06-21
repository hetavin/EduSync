from flask import Blueprint, render_template, session, redirect, url_for

student_bp = Blueprint("student", __name__)

@student_bp.route("/student")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "student":
        return redirect(url_for("auth.home"))

    return render_template("student.html")