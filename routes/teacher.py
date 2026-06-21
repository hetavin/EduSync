from flask import Blueprint, render_template, session, redirect, url_for

teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/teacher")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("auth.home"))

    if session.get("role") != "faculty":
        return redirect(url_for("auth.home"))

    return render_template("teacher.html")