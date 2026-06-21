import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_faculty_credentials(to_email, faculty_id, password,role):

    sender_email = "developer16.balajitechs@gmail.com"
    app_password = "dsjq avmf dtdo bedq"

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "EduSync Faculty Account Credentials"

    body = f"""
    <h2>Welcome to EduSync</h2>

    <p>Your account has been created successfully.</p>

    <p><strong>Role:</strong> {role}</p>
    <p><strong>Faculty ID:</strong> {faculty_id}</p>
    <p><strong>Password:</strong> {password}</p>

    <p>Please login and change your password after first login.</p>
    """

    msg.attach(MIMEText(body, "html"))

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender_email, app_password)

    server.sendmail(
        sender_email,
        to_email,
        msg.as_string()
    )

    server.quit()