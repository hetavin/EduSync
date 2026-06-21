from flask import Blueprint, render_template, session, redirect, url_for

mentor_bp = Blueprint("mentor", __name__)

@mentor_bp.route("/mentor")
def dashboard():

    if session.get("role") != "mentor":
        return redirect(url_for("auth.home"))

    return render_template("mentor.html")