-- Active: 1766670365285@@localhost@3306@edusync

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'mentor', 'student') NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users
MODIFY role ENUM('admin','faculty','mentor','student');

drop TABLE users

CREATE TABLE students (
    enrollment_no VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(15) UNIQUE DEFAULT NULL,
    batch VARCHAR(50) DEFAULT NULL,
    class VARCHAR(50) DEFAULT NULL,
    department VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_face (
    id INT AUTO_INCREMENT PRIMARY KEY,

    enrollment_no VARCHAR(30) NOT NULL,

    face_image LONGBLOB NOT NULL,

    face_embedding LONGBLOB DEFAULT NULL,

    embedding_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED'
    ) DEFAULT 'PENDING',

    embedding_error TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (enrollment_no)
    REFERENCES students(enrollment_no)
    ON DELETE CASCADE
);

drop table students

DROP Table student_face

UPDATE users role SET role = 'admin' WHERE id = 1

UPDATE students SET batch = '2024-28' WHERE enrollment_no = '23BECE30291';

CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('faculty', 'mentor') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    profession VARCHAR(100) NOT NULL,
    class_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP Table faculty

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(30) NOT NULL,
    faculty_id INT NOT NULL,
    batch VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot ENUM('slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3') NOT NULL,
    status ENUM('present', 'absent') NOT NULL DEFAULT 'absent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_no) REFERENCES students(enrollment_no) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_attendance (enrollment_no, date, time_slot)
);

CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_batch_class ON attendance(batch, class);
CREATE INDEX idx_attendance_faculty ON attendance(faculty_id);