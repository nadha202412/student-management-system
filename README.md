Student Management System and Task Manager

A Full-Stack Web Application for Student Records and Academic Task Management 

Table of Contents

1. "Project Overview" (#project-overview)
2. "Objectives" (#objectives)
3. "Key Features" (#key-features)
4. "Technology Stack" (#technology-stack)
5. "System Architecture" (#system-architecture)
6. "Project Structure" (#project-structure)
7. "Database Design" (#database-design)
8. "Prerequisites" (#prerequisites)
9. "Installation and Setup" (#installation-and-setup)
10. "Environment Configuration" (#environment-configuration)
11. "Running the Application" (#running-the-application)
12. "Database Resilience" (#database-resilience)
13. "REST API Documentation" (#rest-api-documentation)
14. "User Interface and Functionality" (#user-interface-and-functionality)
15. "Security and Data Integrity" (#security-and-data-integrity)
16. "Deployment" (#deployment)
17. "Laboratory Viva Questions" (#laboratory-viva-questions)
18. "Future Enhancements" (#future-enhancements)
19. "Author" (#author)
20. "License" (#license)

---

Project Overview

The Student Management System and Task Manager is a full-stack web application designed to simplify student record management and academic task tracking within an educational environment.

The application provides a centralized interface for registering students, maintaining academic records, organizing assignments, monitoring task progress, and managing submission deadlines. It integrates a responsive frontend with a Node.js and Express.js backend, supported by a MySQL relational database and a local JSON-based fallback storage mechanism.

The system demonstrates the practical application of full-stack web development concepts, RESTful API design, relational database management, client-server communication, CRUD operations, and deployment-oriented application configuration.

Objectives

- Develop a centralized system for managing student information.
- Implement Create, Read, Update, and Delete operations for student records and academic tasks.
- Provide task prioritization and deadline tracking.
- Enable student directory search and department-based filtering.
- Design a responsive and user-friendly interface.
- Integrate a relational database for structured data storage.
- Implement a fallback storage mechanism for improved availability during local demonstrations.
- Apply modular development practices and REST API principles.

Key Features

Student Record Management

- Register students with name, email, and department details.
- Retrieve individual student records and the complete student directory.
- Update existing student information.
- Delete student records with associated task cleanup.
- Validate required fields and prevent duplicate email registrations.

Academic Task Management

- Create and manage assignments, laboratory exercises, and project milestones.
- Associate tasks with individual students.
- Set due dates and priority levels.
- Categorize tasks as Pending, In Progress, or Completed.
- Update task status through the application interface.
- Delete tasks when they are no longer required.

Search and Filtering

- Search student records by name, email, or department.
- Filter students using department selections.
- Filter tasks by their current status.
- Display student, task, and department statistics.

Database Resilience

- Connect to MySQL using a connection pool.
- Support a local JSON-based storage fallback when the application is configured to use it and the MySQL connection is unavailable.
- Display database connection status and application statistics.
- Reduce dependency on a continuously available MySQL server during local demonstrations.

User Interface

- Responsive layout for different screen sizes.
- Student registration form with input validation.
- Student directory with initials-based avatars.
- Edit and delete interfaces for student records.
- Task management board with status and priority indicators.
- Loading states, confirmation prompts, and interactive feedback.

Technology Stack

Technology| Purpose
HTML5| Application structure and semantic markup
CSS3| Responsive styling, layouts, and animations
JavaScript| Frontend interaction and API communication
Node.js| Server-side JavaScript runtime
Express.js| Backend framework and REST API routing
MySQL| Relational database management
mysql2| MySQL connectivity, prepared statements, and connection pooling
JSON| Local fallback data persistence
dotenv| Environment variable configuration
CORS| Cross-origin request configuration
npm| Dependency and script management
Vercel| Deployment platform

System Architecture

The application follows a client-server architecture with a frontend, backend API, and persistence layer.

+----------------------------------+
|          User Interface          |
|       HTML, CSS, JavaScript      |
+----------------+-----------------+
                 |
                 | HTTP Requests
                 v
+----------------------------------+
|          Express.js API          |
|       Node.js Application        |
|                                  |
| Validation, Routing and Logic    |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
|         Database Layer           |
|                                  |
|       MySQL Database             |
|               or                 |
|       JSON Fallback Storage      |
+----------------------------------+

Request Processing Flow

1. The user interacts with the frontend.
2. JavaScript sends an HTTP request to the Express.js API.
3. The backend validates the request and executes the required operation.
4. The configured persistence layer processes the data operation.
5. The server returns a JSON response with the result.
6. The frontend updates the interface based on the response.

Project Structure

student-management-system/
|
|-- server.js
|-- database.sql
|-- package.json
|-- package-lock.json
|-- .env.example
|-- .gitignore
|-- README.md
|
|-- task-manager/
|   |-- server.js
|   |-- public/
|   |-- database.sql
|
|-- public/
|   |-- index.html
|   |-- css/
|   |   |-- style.css
|   |
|   |-- js/
|       |-- app.js
|
|-- data/
|   |-- db.json
|

Note: The "task-manager" directory contains aliases or linked resources according to the supplied project structure. The "data/db.json" file may be generated when the fallback storage mechanism is initialized.

Database Design

The MySQL database is named "student_db" and contains two primary tables: "students" and "tasks".

1. Students Table

Column| Data Type| Description
id| INT| Primary key and unique student identifier
name| VARCHAR(100)| Student's full name
email| VARCHAR(100)| Unique student email address
department| VARCHAR(100)| Academic department
created_at| TIMESTAMP| Record creation timestamp
updated_at| TIMESTAMP| Last modification timestamp

Constraints:

- "id" is the primary key with auto-increment.
- "name", "email", and "department" are required.
- "email" has a unique constraint.

2. Tasks Table

Column| Data Type| Description
id| INT| Primary key and unique task identifier
student_id| INT| Reference to the associated student
title| VARCHAR(200)| Task or assignment title
description| TEXT| Additional task information
due_date| DATE| Submission deadline
priority| ENUM| Low, Medium, or High
status| ENUM| Pending, In Progress, or Completed
created_at| TIMESTAMP| Task creation timestamp

Constraints:

- "id" is the primary key with auto-increment.
- "student_id" references "students.id".
- The foreign key uses "ON DELETE CASCADE" to remove associated tasks when a student is deleted, provided the operation uses the configured MySQL relationship.

Entity Relationship

+-------------------+
|      students     |
+-------------------+
| PK id             |
|    name           |
|    email          |
|    department     |
|    created_at     |
|    updated_at     |
+---------+---------+
          |
          | One-to-Many
          |
+---------v---------+
|       tasks       |
+-------------------+
| PK id             |
| FK student_id     |
|    title          |
|    description    |
|    due_date       |
|    priority       |
|    status         |
|    created_at     |
+-------------------+

One student can have multiple tasks, while each task is associated with a student.

Prerequisites

Install the following software before running the application:

- Node.js 18.x, 20.x, or 22.x, subject to dependency compatibility.
- npm, which is distributed with Node.js.
- MySQL Server for relational database mode.
- A code editor such as Visual Studio Code.
- A modern web browser.

MySQL is optional only if the application's JSON fallback is implemented and configured correctly.

Verify the Node.js and npm installations:

node -v
npm -v

Installation and Setup

Step 1: Clone the Repository

git clone https://github.com/tamilsabari397-dev/student-management-system.git

Navigate to the project directory:

cd student-management-system

If SSH access is configured for your GitHub account, you can also use the repository's SSH URL.

Step 2: Install Dependencies

npm install

The primary dependencies include:

- "express" for backend routing and middleware.
- "mysql2" for MySQL database operations.
- "dotenv" for environment configuration.
- "cors" for cross-origin resource sharing.

Step 3: Configure Environment Variables

Create a local ".env" file using the supplied template.

On Windows Command Prompt:

copy .env.example .env

On macOS or Linux:

cp .env.example .env

Update the values according to your local environment.

Environment Configuration

Example ".env" configuration:

PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=student_db
DB_PORT=3306

Replace "YOUR_MYSQL_PASSWORD" with your local MySQL password.

Keep ".env" out of version control. Commit ".env.example" with placeholder values instead of actual credentials.

Running the Application

Step 1: Initialize the Database

If MySQL is installed and running, execute:

mysql -u root -p < database.sql

Enter the MySQL password when prompted.

The supplied backend may also initialize the database and tables automatically, depending on its implementation and database permissions.

Step 2: Start the Backend

Run the application using:

npm start

For development, if the project defines a "dev" script:

npm run dev

Step 3: Open the Application

Open the following URL in your browser:

http://localhost:3000

The application should display the student management interface if the server starts successfully and the frontend static files are configured correctly.

Database Resilience

The application is designed to support MySQL persistence and a JSON-based fallback mechanism.

MySQL Mode

When the MySQL server is available and the connection settings are valid, the application can use a MySQL connection pool to perform database operations.

JSON Fallback Mode

When MySQL is unavailable, the backend may use the local JSON storage engine implemented in the project.

This approach can simplify local demonstrations and reduce setup requirements. However, the fallback's availability depends on the actual error-handling and storage implementation.

The JSON fallback is not a replacement for a production-grade relational database in a multi-instance deployment. Local file persistence may not be durable or shared across serverless deployments.

REST API Documentation

The backend exposes REST endpoints for student records, academic tasks, and system statistics.

Student Endpoints

Method| Endpoint| Description
GET| "/api/status"| Retrieve server and database status
GET| "/api/stats"| Retrieve student, task, and department statistics
GET| "/api/students"| Retrieve student records
GET| "/api/students/:id"| Retrieve a student by ID
POST| "/api/students"| Register a student
PUT| "/api/students/:id"| Update student details
DELETE| "/api/students/:id"| Delete a student and associated tasks

Supported student directory query parameters:

/api/students?search=arun
/api/students?department=Information%20Technology

These can also be combined if supported by the backend.

Task Endpoints

Method| Endpoint| Description
GET| "/api/tasks"| Retrieve task records
POST| "/api/tasks"| Create an academic task
PATCH| "/api/tasks/:id/status"| Update a task's status
DELETE| "/api/tasks/:id"| Delete a task

Example task filters:

/api/tasks?status=Pending
/api/tasks?student_id=1

Example: Register a Student

Request:

POST /api/students
Content-Type: application/json

Request body:

{
  "name": "Nandha",
  "email": "nandha@example.com",
  "department": "Information Technology"
}

Example success response:

{
  "message": "Student registered successfully",
  "student": {
    "id": 1,
    "name": "Nandha",
    "email": "nandha@example.com",
    "department": "Information Technology",
    "created_at": "2026-10-26T04:38:53.684Z"
  }
}

The actual response fields and HTTP status codes depend on the backend implementation.

Example: Create a Task

Request body:

{
  "student_id": 1,
  "title": "Laboratory Assignment",
  "description": "Complete the assigned programming exercises.",
  "due_date": "2026-11-05",
  "priority": "High",
  "status": "Pending"
}

Example: Update Task Status

Request:

PATCH /api/tasks/1/status
Content-Type: application/json

Request body:

{
  "status": "Completed"
}

Common HTTP Status Codes

Status Code| Meaning
200| Request completed successfully
201| Resource created successfully
400| Invalid request data
404| Requested resource not found
409| Duplicate or conflicting data
500| Internal server error

These status codes represent recommended API conventions; verify the actual codes returned by the implementation.

User Interface and Functionality

Student Registration

The registration interface provides fields for student name, email address, and department. Client-side validation helps users identify missing or invalid input before submission.

Student Directory

The directory displays registered student information and supports search, department filtering, record editing, and deletion.

Task Management Board

The task board organizes academic tasks by status and displays priority levels and due dates. Users can update task progress and remove tasks through the available controls.

System Overview

The dashboard displays application statistics and database connection information where supported by the backend.

Responsive Design

The interface uses HTML5, CSS3, and JavaScript to provide an interactive experience across supported desktop and mobile screen sizes.

Security and Data Integrity

The project incorporates or is intended to demonstrate the following practices:

- Required-field and email-format validation.
- Unique email constraints at the database level.
- Foreign key relationships for task ownership.
- Parameterized database queries where implemented.
- Environment variables for sensitive database configuration.
- Appropriate HTTP response codes for API operations.
- Controlled handling of invalid requests and database errors.

Client-side validation alone is not sufficient for security. All important validation and authorization checks should also be enforced on the backend.

The current feature set should not be interpreted as a complete production security audit.

Deployment

The application is intended to be deployable through Vercel, subject to the project's server configuration and persistence requirements.

Deployment Preparation

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Verify the build and server entry-point configuration.
5. Configure a hosted MySQL database if relational persistence is required.
6. Test student registration, task creation, updates, and deletion on the deployed URL.

Important Deployment Consideration

Vercel serverless functions do not provide a reliable persistent local filesystem for application data. Therefore, "data/db.json" should not be relied on for durable storage in a serverless production deployment.

For deployment, use a supported hosted database and verify that the backend is compatible with Vercel's execution model. A conventional long-running Express server may require additional configuration or a different hosting platform.

Live Demo: Add your verified deployment URL here after deployment.

GitHub Repository: https://github.com/tamilsabari397-dev/student-management-system

Laboratory Viva Questions

Q1. What is the purpose of "express.json()" and "express.urlencoded()"?

"express.json()" parses incoming JSON request bodies, while "express.urlencoded()" parses URL-encoded form submissions. The parsed data is made available through "req.body".

Q2. Why is Express.js used in this project?

Express.js simplifies backend development by providing routing, middleware support, request handling, and REST API implementation.

Q3. Why is "mysql2" used?

The "mysql2" package provides MySQL connectivity, support for prepared statements, Promise-based APIs, and connection pooling.

Q4. What is CRUD?

CRUD stands for Create, Read, Update, and Delete. These are the four fundamental operations used to manage application records.

Q5. What is the purpose of a primary key?

A primary key uniquely identifies each record in a database table and prevents duplicate identifiers.

Q6. What is the purpose of a foreign key?

A foreign key establishes a relationship between tables and helps maintain referential integrity.

Q7. What is "ON DELETE CASCADE"?

It automatically deletes related child records when the referenced parent record is deleted, provided the database relationship and deletion operation enforce that constraint.

Q8. How does the application prevent duplicate email registrations?

A unique constraint on the email column prevents duplicate email values in MySQL. Backend validation can additionally return an appropriate conflict response.

Q9. What is a REST API?

A REST API allows clients and servers to exchange data through HTTP methods and resource-oriented endpoints.

Q10. Why are environment variables used?

Environment variables separate configuration from source code and help prevent credentials from being hard-coded into the repository.

Q11. Why is JSON fallback storage used?

It provides a lightweight alternative for local demonstrations when MySQL is unavailable, provided the fallback implementation is configured correctly.

Q12. What challenges can arise when deploying this application?

Common challenges include environment configuration, database connectivity, CORS settings, serverless execution constraints, persistent storage, and production error handling.

Future Enhancements

Potential improvements include:

- Role-based access control for administrators, faculty, and students.
- Authentication and secure session management.
- Student profile pages and academic performance tracking.
- Email notifications for upcoming assignment deadlines.
- File attachments for assignment submissions.
- Pagination and server-side filtering for large datasets.
- Automated testing for API endpoints.
- API documentation using Swagger or OpenAPI.
- Docker-based development and deployment.
- Continuous integration and automated deployment.
- Centralized logging and application monitoring.
- Integration with a persistent managed database for production use.

Author

Developer: NandhaKumar K
GitHub: "@nandha397-dev" (https://github.com/tamilsabari397-dev)
Institution: Sri Sai Ram Engineering College, Chennai, Tamil Nadu
Department: Information Technology

This project was developed as part of an academic laboratory exercise to demonstrate practical knowledge of full-stack web development, backend API design, relational database integration, and application deployment.

License

This project is licensed under the MIT License.

Refer to the "LICENSE" file in the repository for the complete license terms.
