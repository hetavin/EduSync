from flask import Flask

from routes.auth import auth_bp
from routes.login import login_bp
from routes.register import register_bp
from routes.forgot import forgot_bp
from routes.admin import admin_bp
from routes.teacher import teacher_bp
from routes.mentor import mentor_bp
from routes.student import student_bp

app = Flask(__name__)

app.secret_key = "edusync_secret"

# Prevent browser from caching protected pages
@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

app.register_blueprint(auth_bp)
app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(forgot_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(mentor_bp)
app.register_blueprint(student_bp)

if __name__ == "__main__":
    app.run(debug=True)