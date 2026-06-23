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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (enrollment_no)
    REFERENCES students(enrollment_no)
    ON DELETE CASCADE
);

drop table students

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