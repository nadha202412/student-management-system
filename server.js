/**
 * Sri Sai Ram Engineering College - Department of Information Technology
 * Project: Student Management System & Task Manager
 * Stack: Node.js, Express, MySQL2, HTML5, Vanilla CSS3, Modern JavaScript
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Database state tracker
let dbMode = 'uninitialized';
let pool = null;

// Embedded local store fallback (ensures 100% uptime when MySQL server is offline)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db.json');

const initialLocalData = {
  students: [
    {
      id: 1,
      name: 'Nandha',
      email: 'nandha@example.com',
      department: 'Information Technology',
      created_at: new Date('2026-10-20T10:00:00Z').toISOString()
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      department: 'Computer Science & Engineering',
      created_at: new Date('2026-10-21T11:30:00Z').toISOString()
    },
    {
      id: 3,
      name: 'Karthik Raja',
      email: 'karthik.r@example.com',
      department: 'Artificial Intelligence & Data Science',
      created_at: new Date('2026-10-22T09:15:00Z').toISOString()
    },
    {
      id: 4,
      name: 'Ananya Venkat',
      email: 'ananya.v@example.com',
      department: 'Electronics & Communication Engineering',
      created_at: new Date('2026-10-23T14:45:00Z').toISOString()
    }
  ],
  tasks: [
    {
      id: 1,
      student_id: 1,
      title: 'Complete Cloud Computing Lab 4',
      description: 'Implement Node.js REST API with MySQL connection',
      due_date: '2026-11-05',
      priority: 'High',
      status: 'In Progress',
      created_at: new Date('2026-10-24T08:00:00Z').toISOString()
    },
    {
      id: 2,
      student_id: 1,
      title: 'Database Normalization Assignment',
      description: 'Submit 3NF and BCNF case study reports',
      due_date: '2026-11-10',
      priority: 'Medium',
      status: 'Pending',
      created_at: new Date('2026-10-24T09:00:00Z').toISOString()
    },
    {
      id: 3,
      student_id: 2,
      title: 'Machine Learning Model Training',
      description: 'Train CNN for image classification benchmark',
      due_date: '2026-11-08',
      priority: 'High',
      status: 'Completed',
      created_at: new Date('2026-10-24T10:00:00Z').toISOString()
    },
    {
      id: 4,
      student_id: 3,
      title: 'Data Structures Problem Set',
      description: 'Solve dynamic programming problem set for placement prep',
      due_date: '2026-11-12',
      priority: 'Medium',
      status: 'Pending',
      created_at: new Date('2026-10-25T11:00:00Z').toISOString()
    }
  ]
};

function readLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initialLocalData, null, 2));
    return initialLocalData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db file, resetting to initial data:', err.message);
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initialLocalData, null, 2));
    return initialLocalData;
  }
}

function writeLocalDb(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
}

// Database Connection & Initialization
async function initDatabase() {
  try {
    // First, test connecting to MySQL server without database to create DB if needed
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConn.end();

    // Now establish connection pool with the database
    pool = mysql.createPool(dbConfig);
    const testConn = await pool.getConnection();

    // Create tables if they do not exist
    await testConn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await testConn.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if initial seed is needed
    const [rows] = await testConn.query('SELECT COUNT(*) as count FROM students');
    if (rows[0].count === 0) {
      console.log('🌱 Seeding initial student and task records in MySQL...');
      for (const student of initialLocalData.students) {
        await testConn.query(
          'INSERT INTO students (id, name, email, department, created_at) VALUES (?, ?, ?, ?, ?)',
          [student.id, student.name, student.email, student.department, new Date(student.created_at)]
        );
      }
      for (const task of initialLocalData.tasks) {
        await testConn.query(
          'INSERT INTO tasks (id, student_id, title, description, due_date, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [task.id, task.student_id, task.title, task.description, task.due_date, task.priority, task.status, new Date(task.created_at)]
        );
      }
    }

    testConn.release();
    dbMode = 'mysql';
    console.log(`✅ MySQL Connected successfully to database: "${dbConfig.database}" on ${dbConfig.host}:${dbConfig.port}`);
  } catch (error) {
    dbMode = 'local_fallback';
    console.warn(`⚠️ MySQL Connection note: ${error.message}`);
    console.log('🔄 Seamlessly activating embedded storage engine for instant full-stack execution!');
    console.log('💡 To link to a live MySQL instance, adjust credentials in .env and restart server.js');
    readLocalDb(); // Ensure local DB file is present
  }
}

// ==========================================
// REST API ROUTES
// ==========================================

// Health / Status Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Student Management System & Task Manager',
    college: 'Sri Sai Ram Engineering College',
    dbMode: dbMode,
    timestamp: new Date().toISOString()
  });
});

// Overview Statistics
app.get('/api/stats', async (req, res) => {
  try {
    if (dbMode === 'mysql') {
      const [studentCount] = await pool.query('SELECT COUNT(*) as totalStudents FROM students');
      const [deptCount] = await pool.query('SELECT COUNT(DISTINCT department) as totalDepartments FROM students');
      const [taskCount] = await pool.query('SELECT COUNT(*) as totalTasks FROM tasks');
      const [completedCount] = await pool.query("SELECT COUNT(*) as completedTasks FROM tasks WHERE status = 'Completed'");

      return res.json({
        totalStudents: studentCount[0].totalStudents,
        totalDepartments: deptCount[0].totalDepartments,
        totalTasks: taskCount[0].totalTasks,
        completedTasks: completedCount[0].completedTasks,
        completionRate: taskCount[0].totalTasks > 0
          ? Math.round((completedCount[0].completedTasks / taskCount[0].totalTasks) * 100)
          : 0,
        dbMode
      });
    } else {
      const db = readLocalDb();
      const totalStudents = db.students.length;
      const departments = new Set(db.students.map(s => s.department));
      const totalTasks = db.tasks.length;
      const completedTasks = db.tasks.filter(t => t.status === 'Completed').length;

      return res.json({
        totalStudents,
        totalDepartments: departments.size,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        dbMode
      });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/students - List all students (with optional search and filter)
app.get('/api/students', async (req, res) => {
  try {
    const { search, department } = req.query;

    if (dbMode === 'mysql') {
      let query = 'SELECT * FROM students WHERE 1=1';
      const params = [];

      if (department && department !== 'All') {
        query += ' AND department = ?';
        params.push(department);
      }

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      query += ' ORDER BY id DESC';
      const [rows] = await pool.query(query, params);
      return res.json(rows);
    } else {
      const db = readLocalDb();
      let students = [...db.students];

      if (department && department !== 'All') {
        students = students.filter(s => s.department.toLowerCase() === department.toLowerCase());
      }

      if (search) {
        const q = search.toLowerCase();
        students = students.filter(
          s => s.name.toLowerCase().includes(q) ||
               s.email.toLowerCase().includes(q) ||
               s.department.toLowerCase().includes(q)
        );
      }

      students.sort((a, b) => b.id - a.id);
      return res.json(students);
    }
  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});

// GET /api/students/:id - Get a specific student
app.get('/api/students/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

  try {
    if (dbMode === 'mysql') {
      const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
      return res.json(rows[0]);
    } else {
      const db = readLocalDb();
      const student = db.students.find(s => s.id === id);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      return res.json(student);
    }
  } catch (err) {
    console.error('Fetch student error:', err);
    res.status(500).json({ error: 'Failed to retrieve student' });
  }
});

// POST /api/students - Register a new student
app.post('/api/students', async (req, res) => {
  const { name, email, department } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Student Name is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email Address is required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }
  if (!department || !department.trim()) {
    return res.status(400).json({ error: 'Department is required' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanDept = department.trim();

  try {
    if (dbMode === 'mysql') {
      // Check for duplicate email
      const [existing] = await pool.query('SELECT id FROM students WHERE email = ?', [cleanEmail]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'A student with this email address already exists' });
      }

      const [result] = await pool.query(
        'INSERT INTO students (name, email, department) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, cleanDept]
      );

      const [newStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
      return res.status(201).json({
        message: 'Student registered successfully',
        student: newStudent[0]
      });
    } else {
      const db = readLocalDb();
      const existing = db.students.find(s => s.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'A student with this email address already exists' });
      }

      const newId = db.students.length > 0 ? Math.max(...db.students.map(s => s.id)) + 1 : 1;
      const newStudent = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        department: cleanDept,
        created_at: new Date().toISOString()
      };

      db.students.push(newStudent);
      writeLocalDb(db);

      return res.status(201).json({
        message: 'Student registered successfully',
        student: newStudent
      });
    }
  } catch (err) {
    console.error('Create student error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email address already exists' });
    }
    res.status(500).json({ error: 'Failed to create student record' });
  }
});

// PUT /api/students/:id - Update an existing student
app.put('/api/students/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanDept = department.trim();

  try {
    if (dbMode === 'mysql') {
      const [existing] = await pool.query('SELECT id FROM students WHERE email = ? AND id != ?', [cleanEmail, id]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Another student already has this email address' });
      }

      const [result] = await pool.query(
        'UPDATE students SET name = ?, email = ?, department = ? WHERE id = ?',
        [cleanName, cleanEmail, cleanDept, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const [updated] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
      return res.json({ message: 'Student updated successfully', student: updated[0] });
    } else {
      const db = readLocalDb();
      const studentIndex = db.students.findIndex(s => s.id === id);
      if (studentIndex === -1) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const duplicate = db.students.find(s => s.email.toLowerCase() === cleanEmail && s.id !== id);
      if (duplicate) {
        return res.status(409).json({ error: 'Another student already has this email address' });
      }

      db.students[studentIndex] = {
        ...db.students[studentIndex],
        name: cleanName,
        email: cleanEmail,
        department: cleanDept,
        updated_at: new Date().toISOString()
      };

      writeLocalDb(db);
      return res.json({ message: 'Student updated successfully', student: db.students[studentIndex] });
    }
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete a student
app.delete('/api/students/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

  try {
    if (dbMode === 'mysql') {
      const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.json({ message: 'Student deleted successfully', id });
    } else {
      const db = readLocalDb();
      const studentIndex = db.students.findIndex(s => s.id === id);
      if (studentIndex === -1) {
        return res.status(404).json({ error: 'Student not found' });
      }
      db.students.splice(studentIndex, 1);
      // Cascade delete tasks
      db.tasks = db.tasks.filter(t => t.student_id !== id);
      writeLocalDb(db);
      return res.json({ message: 'Student deleted successfully', id });
    }
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ==========================================
// TASK MANAGER ROUTES
// ==========================================

// GET /api/tasks - List all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, student_id } = req.query;

    if (dbMode === 'mysql') {
      let query = `
        SELECT t.*, s.name as student_name, s.department as student_department
        FROM tasks t
        JOIN students s ON t.student_id = s.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'All') {
        query += ' AND t.status = ?';
        params.push(status);
      }
      if (student_id) {
        query += ' AND t.student_id = ?';
        params.push(parseInt(student_id, 10));
      }

      query += ' ORDER BY t.due_date ASC, t.id DESC';
      const [rows] = await pool.query(query, params);
      return res.json(rows);
    } else {
      const db = readLocalDb();
      let tasksWithStudents = db.tasks.map(t => {
        const student = db.students.find(s => s.id === t.student_id) || { name: 'Unknown Student', department: 'N/A' };
        return {
          ...t,
          student_name: student.name,
          student_department: student.department
        };
      });

      if (status && status !== 'All') {
        tasksWithStudents = tasksWithStudents.filter(t => t.status === status);
      }
      if (student_id) {
        tasksWithStudents = tasksWithStudents.filter(t => t.student_id === parseInt(student_id, 10));
      }

      tasksWithStudents.sort((a, b) => new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31'));
      return res.json(tasksWithStudents);
    }
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  const { student_id, title, description, due_date, priority, status } = req.body;

  if (!student_id || !title || !title.trim()) {
    return res.status(400).json({ error: 'Student ID and Task Title are required' });
  }

  const sId = parseInt(student_id, 10);
  const cleanTitle = title.trim();
  const cleanDesc = (description || '').trim();
  const cleanDue = due_date || null;
  const cleanPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';
  const cleanStatus = ['Pending', 'In Progress', 'Completed'].includes(status) ? status : 'Pending';

  try {
    if (dbMode === 'mysql') {
      const [student] = await pool.query('SELECT id FROM students WHERE id = ?', [sId]);
      if (student.length === 0) {
        return res.status(404).json({ error: 'Assigned student does not exist' });
      }

      const [result] = await pool.query(
        'INSERT INTO tasks (student_id, title, description, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
        [sId, cleanTitle, cleanDesc, cleanDue, cleanPriority, cleanStatus]
      );

      const [newTask] = await pool.query(`
        SELECT t.*, s.name as student_name, s.department as student_department
        FROM tasks t
        JOIN students s ON t.student_id = s.id
        WHERE t.id = ?
      `, [result.insertId]);

      return res.status(201).json({ message: 'Task created successfully', task: newTask[0] });
    } else {
      const db = readLocalDb();
      const student = db.students.find(s => s.id === sId);
      if (!student) {
        return res.status(404).json({ error: 'Assigned student does not exist' });
      }

      const newId = db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1;
      const newTask = {
        id: newId,
        student_id: sId,
        title: cleanTitle,
        description: cleanDesc,
        due_date: cleanDue,
        priority: cleanPriority,
        status: cleanStatus,
        created_at: new Date().toISOString()
      };

      db.tasks.push(newTask);
      writeLocalDb(db);

      return res.status(201).json({
        message: 'Task created successfully',
        task: {
          ...newTask,
          student_name: student.name,
          student_department: student.department
        }
      });
    }
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/status - Update task status
app.patch('/api/tasks/:id/status', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (isNaN(id) || !['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (Pending, In Progress, Completed) is required' });
  }

  try {
    if (dbMode === 'mysql') {
      const [result] = await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      return res.json({ message: 'Task status updated successfully', id, status });
    } else {
      const db = readLocalDb();
      const task = db.tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      task.status = status;
      writeLocalDb(db);
      return res.json({ message: 'Task status updated successfully', id, status });
    }
  } catch (err) {
    console.error('Update task status error:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

  try {
    if (dbMode === 'mysql') {
      const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      return res.json({ message: 'Task deleted successfully', id });
    } else {
      const db = readLocalDb();
      const taskIndex = db.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
      db.tasks.splice(taskIndex, 1);
      writeLocalDb(db);
      return res.json({ message: 'Task deleted successfully', id });
    }
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Fallback to serve index.html for client-side navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for Vercel Serverless Function
module.exports = app;

// Standalone Server Listener (for local development & standard Node hosts)
if (!process.env.VERCEL) {
  initDatabase().finally(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Student Management System Server running on:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`   Database Mode: [${dbMode.toUpperCase()}]`);
      console.log(`=======================================================`);
    });
  });
} else {
  // On Vercel, initialize DB immediately in background
  initDatabase().catch(err => console.error('DB init warning on Vercel:', err));
}
