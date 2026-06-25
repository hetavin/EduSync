# Forgot Password with OTP Implementation

## Overview
The EduSync system now includes a secure password reset feature using OTP (One-Time Password) verification sent via email.

---

## 🔐 Features

### 1. **Email-Based Password Reset**
- Users can request password reset using their registered email
- System validates email exists in database before proceeding

### 2. **6-Digit OTP Generation**
- Random 6-digit OTP generated for each request
- OTP is stored temporarily with 10-minute expiry
- New OTP can be requested if needed

### 3. **Email Delivery**
- Professional HTML-formatted email sent to user
- Contains OTP code with clear instructions
- Security warnings included
- Valid for 10 minutes

### 4. **OTP Verification**
- Users verify OTP before password reset
- Invalid/expired OTP shows appropriate error
- Single-use OTP (cleared after successful password reset)

### 5. **Password Reset**
- Users create new password after OTP verification
- Password updated directly in database
- Redirects to login after successful reset

---

## 📋 Files Modified/Created

### Backend (Python)
1. **routes/forgot.py** (NEW)
   - `/forgot-password` - Send OTP to email
   - `/verify-otp` - Verify OTP code
   - `/reset-password` - Update password
   - `/resend-otp` - Request new OTP

2. **service/mail_service.py**
   - Added `send_otp_email()` function
   - HTML email template with styling
   - Security notices included

3. **app.py**
   - Registered `forgot_bp` blueprint

### Frontend (HTML)
- **templates/auth.html** (Already exists with forgot password forms)

### Frontend (JavaScript)
- **static/js/auth.js** (Already configured with forgot password handlers)

---

## 🔄 User Flow

```
1. User clicks "Forgot Password?" → Shows forgot password form
2. User enters email → System validates email
3. System generates 6-digit OTP → Sends email with OTP
4. User receives email → Copies OTP code
5. User enters OTP → System verifies OTP
6. User enters new password → System updates password
7. User redirects to login → Can login with new password
```

---

## 📧 Email Template

The OTP email includes:
- **Header**: EduSync branding with gradient background
- **Greeting**: Personalized with username
- **OTP Display**: Large, centered 6-digit code
- **Validity**: Shows "Valid for 10 minutes"
- **Security Warning**: 
  - Do not share OTP
  - EduSync never asks for OTP
  - Ignore if not requested
- **Footer**: Copyright and automated email notice

---

## 🛠️ API Endpoints

### 1. POST `/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Email not found"
}
```

---

### 2. POST `/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again."
}
```
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

---

### 3. POST `/reset-password`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "newPassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Please verify OTP first"
}
```

---

### 4. POST `/resend-otp`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "New OTP sent successfully"
}
```

---

## 🔒 Security Features

### 1. **OTP Expiry**
- OTP valid for 10 minutes only
- Expired OTPs automatically rejected
- Users must request new OTP if expired

### 2. **Email Validation**
- Checks if email exists in database
- Returns error if email not found
- Prevents OTP spam to non-existent emails

### 3. **Single-Use OTP**
- OTP deleted after successful password reset
- Cannot reuse same OTP
- Requires verification before password reset

### 4. **Temporary Storage**
- OTPs stored in-memory (dictionary)
- Automatically cleared after use
- Not persisted in database

### 5. **Password Security**
- Direct database password update
- No intermediate storage
- Immediate effect after reset

---

## 💾 OTP Storage Structure

```python
otp_storage = {
    "user@example.com": {
        "otp": "123456",
        "expiry": datetime(2025, 1, 15, 10, 30, 0),
        "verified": False
    }
}
```

**Fields:**
- `otp`: 6-digit random code
- `expiry`: Expiration timestamp (10 minutes from generation)
- `verified`: Boolean flag (set to True after verification)

---

## 📝 Error Handling

### Common Errors:
1. **Email not found**: User email doesn't exist in database
2. **OTP expired**: More than 10 minutes passed since generation
3. **Invalid OTP**: Entered OTP doesn't match stored OTP
4. **OTP not verified**: Attempting password reset without verifying OTP
5. **Email sending failed**: SMTP error or network issue

### Error Messages:
- Clear, user-friendly messages
- Appropriate HTTP status codes (400, 404, 500)
- Logged to console for debugging

---

## 🔧 Configuration

### Email Settings (mail_service.py):
```python
sender_email = "developer16.balajitechs@gmail.com"
app_password = "dsjq avmf dtdo bedq"
smtp_server = "smtp.gmail.com"
smtp_port = 587
```

### OTP Settings (forgot.py):
```python
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
OTP_CHARACTERS = string.digits  # 0-9
```

---

## 🧪 Testing

### Test Scenarios:

1. **Valid Email**
   - Enter valid registered email
   - Check email inbox for OTP
   - Verify OTP received

2. **Invalid Email**
   - Enter non-existent email
   - Should show "Email not found" error

3. **Correct OTP**
   - Enter correct 6-digit OTP
   - Should proceed to reset password

4. **Wrong OTP**
   - Enter incorrect OTP
   - Should show "Invalid OTP" error

5. **Expired OTP**
   - Wait 10+ minutes after receiving OTP
   - Enter OTP
   - Should show "OTP expired" error

6. **Password Reset**
   - Complete OTP verification
   - Enter new password
   - Confirm password matches
   - Login with new password

---

## 📊 Database Requirements

### Users Table:
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'mentor', 'faculty', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Required Fields:**
- `email`: For OTP delivery and user identification
- `password`: To be updated during reset
- `username`: For personalized email greeting

---

## 🚀 Future Enhancements

Potential improvements:
1. **SMS OTP**: Add SMS delivery option alongside email
2. **Rate Limiting**: Prevent OTP spam (max 3 requests per hour)
3. **Redis Storage**: Use Redis instead of in-memory storage for production
4. **OTP History**: Log OTP requests in database for audit
5. **2FA Integration**: Use OTP for two-factor authentication
6. **Email Templates**: Create multiple email templates
7. **Resend Cooldown**: Add 60-second cooldown between resend requests
8. **Password Strength**: Enforce strong password requirements
9. **Account Lockout**: Lock account after multiple failed OTP attempts
10. **Email Verification**: Verify email ownership before allowing OTP

---

## 📱 User Interface

### Forms Included:
1. **Forgot Password Form** - Enter email
2. **Verify OTP Form** - Enter 6-digit code
3. **Reset Password Form** - Enter new password

### Animations:
- Smooth slide transitions between forms
- Shake animation on errors
- Loading spinners during API calls
- Flash messages for success/error feedback

---

## ⚠️ Important Notes

1. **Production Considerations**:
   - Replace in-memory storage with Redis or database
   - Use environment variables for email credentials
   - Implement rate limiting
   - Add logging and monitoring
   - Use HTTPS in production

2. **Security Best Practices**:
   - Never log OTP codes
   - Use secure SMTP connection (TLS)
   - Validate all user inputs
   - Sanitize email addresses
   - Implement CSRF protection

3. **Email Deliverability**:
   - Configure SPF, DKIM, DMARC records
   - Use dedicated email service (SendGrid, AWS SES)
   - Monitor bounce and spam rates
   - Provide fallback contact method

---

## 📞 Support

If users don't receive OTP:
1. Check spam/junk folder
2. Verify email address is correct
3. Request new OTP
4. Contact support team
5. Use alternative recovery method (if available)

---

## ✅ Summary

The forgot password feature provides:
- ✅ Secure OTP-based password reset
- ✅ Email delivery with professional template
- ✅ 10-minute OTP validity
- ✅ Clear error messages
- ✅ Smooth user experience
- ✅ Security warnings and best practices
- ✅ Single-use OTP tokens
- ✅ Proper error handling

The system is now fully functional for password recovery! 🎉
