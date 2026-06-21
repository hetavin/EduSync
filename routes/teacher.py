from flask import Blueprint, render_template, session, redirect, url_for

teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/teacher")
def dashboard():

    if session.get("role") != "teacher":
        return redirect(url_for("auth.home"))

    return render_template("teacher.html")