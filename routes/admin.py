from flask import Blueprint, render_template, session, redirect, url_for

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin")
def dashboard():

    if session.get("role") != "admin":
        return redirect(url_for("auth.home"))

    return render_template("dashboard.html")