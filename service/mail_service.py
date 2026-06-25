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


def send_otp_email(to_email, otp, username):
    """
    Send OTP email for password reset
    """
    sender_email = "developer16.balajitechs@gmail.com"
    app_password = "dsjq avmf dtdo bedq"

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "EduSync - Password Reset OTP"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #f9f9f9;
                border-radius: 10px;
            }}
            .header {{
                background: linear-gradient(135deg, #007AFF, #5856D6);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: white;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .otp-box {{
                background: #f0f0f0;
                border: 2px dashed #007AFF;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 20px 0;
            }}
            .otp-code {{
                font-size: 32px;
                font-weight: bold;
                color: #007AFF;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }}
            .warning {{
                background: #fff3cd;
                border-left: 4px solid #ff9500;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 EduSync</h1>
                <p>Password Reset Request</p>
            </div>
            <div class="content">
                <h2>Hello, {username}!</h2>
                <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                    <div class="otp-code">{otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    • Do not share this OTP with anyone<br>
                    • EduSync will never ask for your OTP<br>
                    • If you didn't request this, please ignore this email
                </div>
                
                <p style="margin-top: 30px;">
                    <strong>Need help?</strong> Contact our support team.
                </p>
            </div>
            <div class="footer">
                <p>© 2025 EduSync - Smart Educational Management System</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        raise e