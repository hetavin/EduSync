# 🎓 EduSync

> **EduSync** is a Smart Educational Management System designed to streamline student, faculty, mentor, and attendance management within educational institutions. Built using Flask, MySQL, JavaScript, and Pandas, EduSync provides a centralized platform for managing academic operations efficiently.

![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge\&logo=python)
![Flask](https://img.shields.io/badge/Flask-Web_Framework-black?style=for-the-badge\&logo=flask)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge\&logo=mysql)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow?style=for-the-badge\&logo=javascript)

---

# 📖 Overview

EduSync simplifies educational administration by providing role-based access for administrators and mentors. The system supports student management, faculty management, attendance tracking, Excel-based data import, automated email notifications, and mentor-class assignments.

---

# ✨ Key Features

## 👨‍💼 Admin Panel

* 🔐 Secure Authentication System
* 👨‍🏫 Faculty Management
* 🎓 Student Management
* 📤 Bulk Student Import via Excel
* 📧 Automatic Faculty Credential Emailing
* 📊 Dashboard Analytics
* 🏫 Mentor-Class Assignment
* 📝 Attendance Management
* 👥 User Role Management

---

## 👨‍🏫 Mentor Panel

* 🔐 Mentor Authentication
* 👥 View Assigned Students
* 📋 Student Information Tracking
* 📊 Attendance Monitoring
* 📁 Excel-Based Student Assignment
* 🏫 Manage Assigned Classes

---

## 🎓 Student Management

* Enrollment Number Management
* Student Profile Management
* Department Detection
* Automatic Batch Generation
* Class Assignment
* Bulk Import Support
* Student Search & Filtering

---

## 📧 Automated Email System

When a new faculty member is added, EduSync automatically sends login credentials via email.

### Included in Email

* Faculty Name
* Email Address
* Login ID
* Temporary Password
* Login Portal URL

### Example Email

```text
Welcome to EduSync 🎉

Dear Faculty Member,

Your account has been successfully created.

Email: faculty@example.com
Password: ********

Login Portal:
http://localhost:5000

Regards,
EduSync Team
```

---

## 📁 Excel Import System

Supported File Formats:

* XLSX
* XLS
* CSV

### Automatically Processes

* Enrollment Number
* Student Name
* Email Address
* Phone Number
* Department
* Batch
* Class

---

# 🛠️ Technology Stack

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Python     | Core Programming Language |
| Flask      | Web Framework             |
| Pandas     | Excel/CSV Processing      |
| MySQL      | Database Management       |

---

## Frontend

| Technology   | Purpose           |
| ------------ | ----------------- |
| HTML5        | Structure         |
| CSS3         | Styling           |
| JavaScript   | Client-Side Logic |
| jQuery       | DOM Manipulation  |
| Bootstrap    | Responsive UI     |
| Font Awesome | Icons             |

---

# 📂 Project Structure

```text
EduSync/
│
├── app.py                       # Application Entry Point
├── connect.py                   # Database Connection
├── requirements.txt             # Project Dependencies
│
├── routes/
│   ├── auth.py                  # Authentication Routes
│   ├── admin.py                 # Admin Routes
│   └── mentor.py                # Mentor Routes
│
├── services/
│   └──auth_service.py           # Authentication Logic
│   
│  
│   
│   
│
├── models/
│   └── read_excel.py            # Excel Processing Module
│
├── templates/
│   ├── auth.html                # Login Page
│   ├── dashboard.html           # Admin Dashboard
│   ├── mentor.html              # Mentor Dashboard
│   ├── students.html            # Student Management
│   └── faculty.html             # Faculty Management
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── mentor.js
│   │
│   ├── images/
│   └── assets/
│
├── uploads/                     # Uploaded Excel Files
│
├── database/
│   └── schema.sql               # Database Schema
│
└── README.md
```

---

# 🚀 API & Application Routes

## 🔑 Authentication

| Method | Route     | Description |
| ------ | --------- | ----------- |
| GET    | `/`       | Login Page  |
| POST   | `/login`  | User Login  |
| GET    | `/logout` | User Logout |

---

## 👨‍💼 Admin Routes

| Method | Route             | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/admin`          | Admin Dashboard   |
| GET    | `/api/students`   | Get Student List  |
| POST   | `/api/student`    | Import Students   |
| POST   | `/api/faculty`    | Add Faculty       |
| GET    | `/api/faculty`    | View Faculty      |
| POST   | `/api/attendance` | Manage Attendance |

---

## 👨‍🏫 Mentor Routes

| Method | Route                     | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/mentor`                 | Mentor Dashboard                |
| GET    | `/profile`                | Mentor Profile                  |
| GET    | `/displayStudents`        | Assigned Students               |
| POST   | `/api/mentor/updateClass` | Upload Student Assignment Excel |

---

# 🗄️ Database Schema

## users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','mentor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## faculty

```sql
CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    email VARCHAR(150),
    phone_number VARCHAR(20),
    class_name VARCHAR(50),
    department VARCHAR(100)
);
```

---

## students

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(20),
    name VARCHAR(150),
    email VARCHAR(150),
    phone_number VARCHAR(20),
    batch VARCHAR(20),
    class VARCHAR(50),
    department VARCHAR(100)
);
```

---

# 🔐 User Roles

## 👨‍💼 Administrator

### Permissions

* Full System Access
* Manage Faculty
* Manage Students
* Assign Mentors
* View Dashboard Analytics
* Manage Attendance

---

## 👨‍🏫 Mentor

### Permissions

* View Assigned Students
* Manage Attendance
* Access Assigned Classes
* Update Student Information

---

# 📦 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/hetavin/EduSync.git
cd EduSync
```

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/Mac

```bash
source venv/bin/activate
```

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

## 4️⃣ Configure Database

Create MySQL Database:

```sql
CREATE DATABASE edusync;
```

Import schema:

```bash
mysql -u root -p edusync < database/schema.sql
```

## 5️⃣ Run Application

```bash
python app.py
```

Application URL:

```text
http://localhost:5000
```

---

# 🚀 Future Enhancements

* 🤖 AI-Based Student Analytics
* 📷 Face Recognition Attendance
* 📊 Advanced Performance Reports
* 📈 Student Performance Prediction
* 📱 Android & iOS Application
* ☁️ Cloud Deployment
* 🔔 Smart Notifications
* 📧 Email & SMS Integration

---

# 👨‍💻 Developer

### Hetavin Pokiya

🐍 Python Developer
⚡ Flask Developer
🗄️ MySQL Developer
🌐 Full Stack Enthusiast

GitHub: https://github.com/hetavin

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, please consider giving it a **Star ⭐** on GitHub.

Your support motivates further development and improvements!
