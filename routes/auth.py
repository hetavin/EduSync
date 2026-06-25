from flask import Blueprint, render_template, session, redirect, url_for, flash

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/")
def home():
    return render_template("auth.html")


@auth_bp.route("/admin")
def admin_dashboard():

    if session.get("role") != "admin":
        return redirect(url_for("auth.home"))

    return render_template("admin.html")


@auth_bp.route("/mentor")
def mentor_dashboard():

    if session.get("role") != "mentor":
        return redirect(url_for("auth.home"))

    return render_template("mentor.html")


@auth_bp.route("/faculty")
def teacher_dashboard():

    if session.get("role") != "faculty":
        return redirect(url_for("auth.home"))

    return render_template("teacher.html")


@auth_bp.route("/student")
def student_dashboard():

    if session.get("role") != "student":
        return redirect(url_for("auth.home"))

    return render_template("student.html")


@auth_bp.route("/logout")
def logout():

    session.clear()
    flash("Logged out successfully!", "success")


    return redirect(url_for("auth.home"))