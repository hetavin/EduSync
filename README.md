# 🎓 EduSync

### AI-Powered Smart Attendance Management System

<p align="center">
  <img src="docs/images/logo.png" width="200">
</p>

<p align="center">
  <b>Automated Attendance • Face Recognition • Role-Based Management</b>
</p>

---

## 🚀 Overview

EduSync is an intelligent attendance management platform designed for educational institutions. It automates attendance marking using AI-powered face recognition and provides dedicated dashboards for administrators, mentors, teachers, and students.

The system reduces manual attendance work, improves accuracy, and enables institutions to manage users, classes, and attendance records from a centralized platform.

---

## ✨ Key Features

### 👨‍💼 Admin Panel

* Create and manage departments
* Create batches and classes
* Manage students, mentors, and faculties
* Activate or deactivate user accounts
* Monitor attendance records
* System-wide control panel

### 🧑‍🏫 Mentor Panel

* Register student face data
* Upload multiple student images
* Manage student information
* View attendance reports
* Track student attendance statistics

### 👨‍🏫 Teacher Panel

* Upload classroom images
* Automatic attendance generation
* Batch-wise attendance
* Class-wise attendance
* Date-wise attendance records
* Slot-wise attendance management

### 🎓 Student Panel

* View attendance history
* Track attendance percentage
* Access personal profile
* Attendance status monitoring

---

# 🔐 Automatic Faculty & Mentor Account Generation

EduSync automatically creates login credentials for:

* Mentors
* Faculties

### Workflow

```text
Admin Creates Faculty/Mentor
          │
          ▼
System Generates
Unique User ID
&
Secure Password
          │
          ▼
Credentials Stored
In Database
          │
          ▼
Automatic Email Delivery
To User
```

### Benefits

✅ No manual credential creation

✅ Unique login credentials

✅ Faster onboarding process

✅ Reduced administrative workload

---

# 🤖 AI Attendance Engine

EduSync uses Deep Learning-based face recognition to identify students from classroom images.

---

## Face Detection

### SCRFD

Model:

```text
scrfd_2.5g_bnkps.onnx
```

Used For:

* Multi-face detection
* Group image processing
* Classroom attendance

---

## Face Recognition

### ArcFace

Model:

```text
w600k_mbf.onnx
```

Used For:

* Face embedding generation
* Student identification
* Attendance verification

---

# 🔄 Attendance Processing Pipeline

```text
Teacher Uploads Classroom Image
                │
                ▼
Image Slicing With Overlap
                │
                ▼
SCRFD Face Detection
                │
                ▼
Face Cropping
                │
                ▼
ArcFace Embedding Generation
                │
                ▼
Database Matching
                │
                ▼
Present Student Detection
                │
                ▼
Attendance Saved
```

---

# 🖼️ Crowd Image Optimization

Large classroom images often contain dozens of students.

EduSync improves detection accuracy by:

* Splitting images into overlapping tiles
* Detecting faces in each tile
* Merging detections
* Removing duplicates
* Processing all detected faces

This improves performance in crowded classrooms.

---

# 📂 Project Structure

```text
EduSync/
│
├── app.py
├── connect.py
│
├── routes/
│   ├── auth.py
│   ├── admin.py
│   ├── mentor.py
│   ├── teacher.py
│   └── student.py
│
├── utils/
│   ├── image_slicing.py
│   ├── face_detection.py
│   ├── face_embedding.py
│   ├── face_matching.py
│   └── attendance_processor.py
│
├── models/
│   ├── scrfd_2.5g_bnkps.onnx
│   └── w600k_mbf.onnx
│
├── templates/
│
├── static/
│   ├── css/
│   ├── js/
│   ├── uploads/
│   └── images/
│
└── requirements.txt
```

---

# 🗄️ Database Design

## Users

Stores:

* User ID
* Enrollment Number
* Password
* Role
* Status

Roles:

* Admin
* Mentor
* Teacher
* Student

---

## Students

Stores:

* Student information
* Academic details
* Face image data

---

## Student Face

Stores:

* Face images
* Face embeddings
* Processing status

---

# 📸 Face Registration Workflow

```text
Mentor Selects Student
            │
            ▼
Upload 2–5 Images
            │
            ▼
Face Detection
            │
            ▼
Store Face Images
            │
            ▼
Generate Embeddings
            │
            ▼
Save To Database
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/hetavin/EduSync.git
cd EduSync
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Environment

Windows:

```bash
venv\Scripts\activate
```

Linux/Mac:

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure Database

Update database credentials in:

```python
connect.py
```

## Add AI Models

Place models inside:

```text
models/
```

Required:

```text
scrfd_2.5g_bnkps.onnx
w600k_mbf.onnx
```

## Run Application

```bash
python app.py
```

---

# 📷 Screenshots

## Login Page

![Login](docs/screenshots/login.png)

## Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

## Mentor Panel

![Mentor Panel](docs/screenshots/mentor-panel.png)

## Teacher Attendance

![Teacher Attendance](docs/screenshots/teacher-attendance.png)

---

# 🔮 Future Enhancements

* 🚀 FAISS-based ultra-fast matching
* 📱 Mobile application
* 🎥 Live camera attendance
* 📊 Advanced analytics dashboard
* 📄 PDF/Excel report generation
* 🛡️ Face anti-spoofing system
* ☁️ Cloud deployment

---

# 👨‍💻 Author

**Hetavin Pokiya**

### EduSync

AI-Powered Smart Attendance Management System

Built using Flask, MySQL, OpenCV, SCRFD, and ArcFace.
