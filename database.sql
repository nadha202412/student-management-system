-- ==========================================================
-- Student Management System & Task Manager Database Schema
-- Sri Sai Ram Engineering College - Laboratory Project
-- ==========================================================

-- 1. Create the Database if it does not already exist
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- 2. Create the 'students' Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create the 'tasks' Table (for Student Task Management)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 4. Sample Seed Data (Matches the Lab Manual Demonstration)
INSERT INTO students (name, email, department) VALUES
('Nandha', 'nandha@example.com', 'Information Technology'),
('Priya Sharma', 'priya.s@example.com', 'Computer Science & Engineering'),
('Karthik Raja', 'karthik.r@example.com', 'Artificial Intelligence & Data Science'),
('Ananya Venkat', 'ananya.v@example.com', 'Electronics & Communication Engineering')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Sample Task Data
INSERT INTO tasks (student_id, title, description, due_date, priority, status) VALUES
(1, 'Complete Cloud Computing Lab 4', 'Implement Node.js REST API with MySQL connection', '2026-11-05', 'High', 'In Progress'),
(1, 'Database Normalization Assignment', 'Submit 3NF and BCNF case study reports', '2026-11-10', 'Medium', 'Pending'),
(2, 'Machine Learning Model Training', 'Train CNN for image classification benchmark', '2026-11-08', 'High', 'Completed'),
(3, 'Data Structures Review', 'Solve dynamic programming problem set', '2026-11-12', 'Medium', 'Pending');
