/**
 * Student Management System & Task Manager
 * Frontend Application Logic
 * Sri Sai Ram Engineering College
 */

// State Management
const state = {
  students: [],
  tasks: [],
  stats: null,
  activeTab: 'studentsSection',
  searchQuery: '',
  selectedDepartment: 'All',
  selectedTaskStatus: 'All',
  selectedTaskStudent: ''
};

// DOM Elements
const elements = {
  // Navigation
  tabs: document.querySelectorAll('.nav-tab'),
  sections: document.querySelectorAll('.tab-section'),
  
  // Status & Metrics
  dbStatusText: document.getElementById('dbStatusText'),
  dbStatusBadge: document.getElementById('dbStatusBadge'),
  statTotalStudents: document.getElementById('statTotalStudents'),
  statDepartments: document.getElementById('statDepartments'),
  statActiveTasks: document.getElementById('statActiveTasks'),
  statCompletionRate: document.getElementById('statCompletionRate'),
  analyticsDbEngine: document.getElementById('analyticsDbEngine'),
  
  // Student Form
  addStudentForm: document.getElementById('addStudentForm'),
  studentNameInput: document.getElementById('studentName'),
  studentEmailInput: document.getElementById('studentEmail'),
  studentDeptInput: document.getElementById('studentDepartment'),
  submitStudentBtn: document.getElementById('submitStudentBtn'),
  nameError: document.getElementById('nameError'),
  emailError: document.getElementById('emailError'),
  deptError: document.getElementById('deptError'),
  
  // Student Directory
  studentSearchInput: document.getElementById('studentSearchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  departmentFilter: document.getElementById('departmentFilter'),
  refreshStudentsBtn: document.getElementById('refreshStudentsBtn'),
  studentsTableBody: document.getElementById('studentsTableBody'),
  recordCountBadge: document.getElementById('recordCountBadge'),
  emptyStudentsState: document.getElementById('emptyStudentsState'),
  
  // Task Management
  tasksGrid: document.getElementById('tasksGrid'),
  taskStatusPills: document.querySelectorAll('#taskStatusPills .status-pill'),
  taskStudentFilter: document.getElementById('taskStudentFilter'),
  emptyTasksState: document.getElementById('emptyTasksState'),
  openCreateTaskModalBtn: document.getElementById('openCreateTaskModalBtn'),
  createTaskModal: document.getElementById('createTaskModal'),
  closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
  cancelTaskBtn: document.getElementById('cancelTaskBtn'),
  createTaskForm: document.getElementById('createTaskForm'),
  taskStudentSelect: document.getElementById('taskStudentSelect'),
  taskDueDate: document.getElementById('taskDueDate'),
  
  // Edit Student Modal
  editStudentModal: document.getElementById('editStudentModal'),
  closeEditModalBtn: document.getElementById('closeEditModalBtn'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  editStudentForm: document.getElementById('editStudentForm'),
  editStudentId: document.getElementById('editStudentId'),
  editStudentName: document.getElementById('editStudentName'),
  editStudentEmail: document.getElementById('editStudentEmail'),
  editStudentDepartment: document.getElementById('editStudentDepartment'),
  
  // Confirm Modal
  confirmModal: document.getElementById('confirmModal'),
  confirmTitle: document.getElementById('confirmTitle'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmCancelBtn: document.getElementById('confirmCancelBtn'),
  confirmActionBtn: document.getElementById('confirmActionBtn'),
  
  // Toasts
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// API CLIENT
// ==========================================
const API = {
  async getStatus() {
    const res = await fetch('/api/status');
    return res.json();
  },
  async getStats() {
    const res = await fetch('/api/stats');
    return res.json();
  },
  async getStudents(search = '', department = 'All') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department && department !== 'All') params.append('department', department);
    const res = await fetch(`/api/students?${params.toString()}`);
    return res.json();
  },
  async addStudent(data) {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add student');
    return json;
  },
  async updateStudent(id, data) {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update student');
    return json;
  },
  async deleteStudent(id) {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete student');
    return json;
  },
  async getTasks(status = 'All', student_id = '') {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (student_id) params.append('student_id', student_id);
    const res = await fetch(`/api/tasks?${params.toString()}`);
    return res.json();
  },
  async addTask(data) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add task');
    return json;
  },
  async updateTaskStatus(id, status) {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update task status');
    return json;
  },
  async deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete task');
    return json;
  }
};

// ==========================================
// UI HELPERS & NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function getInitials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getDeptClass(dept) {
  const d = (dept || '').toLowerCase();
  if (d.includes('information')) return 'it';
  if (d.includes('computer')) return 'cse';
  if (d.includes('intelligence')) return 'aids';
  if (d.includes('electronics') || d.includes('communication')) return 'ece';
  if (d.includes('mechanical')) return 'mech';
  return '';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Confirmation Dialog Promisified
let confirmResolver = null;
function openConfirmModal(title, message, btnText = 'Delete') {
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  elements.confirmActionBtn.textContent = btnText;
  elements.confirmModal.classList.remove('hidden');

  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

function closeConfirmModal(result) {
  elements.confirmModal.classList.add('hidden');
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================
async function refreshAllData() {
  await Promise.all([
    loadStatus(),
    loadStats(),
    loadStudents(),
    loadTasks()
  ]);
}

async function loadStatus() {
  try {
    const status = await API.getStatus();
    const isMysql = status.dbMode === 'mysql';
    elements.dbStatusText.textContent = isMysql ? 'MySQL: Connected' : 'Embedded DB: Active';
    elements.analyticsDbEngine.textContent = isMysql 
      ? 'MySQL Relational Database (Active)' 
      : 'Embedded JSON Fallback Engine (Active)';
  } catch (err) {
    elements.dbStatusText.textContent = 'Server Offline';
    elements.dbStatusBadge.querySelector('.status-indicator-dot').classList.remove('online');
  }
}

async function loadStats() {
  try {
    const stats = await API.getStats();
    elements.statTotalStudents.textContent = stats.totalStudents;
    elements.statDepartments.textContent = stats.totalDepartments;
    elements.statActiveTasks.textContent = stats.totalTasks - stats.completedTasks;
    elements.statCompletionRate.textContent = `${stats.completionRate}%`;
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function loadStudents() {
  try {
    const students = await API.getStudents(state.searchQuery, state.selectedDepartment);
    state.students = students;
    renderStudents(students);
    updateStudentSelectOptions(students);
  } catch (err) {
    showToast('Failed to load students: ' + err.message, 'error');
  }
}

function renderStudents(students) {
  elements.recordCountBadge.textContent = `${students.length} ${students.length === 1 ? 'Record' : 'Records'}`;
  
  if (students.length === 0) {
    elements.studentsTableBody.innerHTML = '';
    elements.emptyStudentsState.classList.remove('hidden');
    return;
  }
  
  elements.emptyStudentsState.classList.add('hidden');
  
  elements.studentsTableBody.innerHTML = students.map(student => `
    <tr data-id="${student.id}">
      <td><span class="text-muted">#${student.id}</span></td>
      <td>
        <div class="student-cell">
          <div class="student-avatar" aria-hidden="true">${getInitials(student.name)}</div>
          <div>
            <span class="student-name-text">${escapeHTML(student.name)}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="text-secondary">${escapeHTML(student.email)}</span>
      </td>
      <td>
        <span class="dept-badge ${getDeptClass(student.department)}">
          ${escapeHTML(student.department)}
        </span>
      </td>
      <td>
        <span class="text-muted">${formatDate(student.created_at)}</span>
      </td>
      <td class="text-right">
        <div class="action-buttons-wrap">
          <button type="button" class="btn-action-icon btn-assign" title="Assign Task" onclick="window.assignTaskTo(${student.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          <button type="button" class="btn-action-icon btn-edit" title="Edit Student" onclick="window.openEditStudent(${student.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-action-icon btn-delete" title="Delete Student" onclick="window.deleteStudent(${student.id}, '${escapeHTML(student.name).replace(/'/g, "\\'")}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStudentSelectOptions(students) {
  // Update task assign dropdown
  elements.taskStudentSelect.innerHTML = `
    <option value="" disabled selected>Select a student</option>
    ${students.map(s => `<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.department)})</option>`).join('')}
  `;

  // Update task filter dropdown
  elements.taskStudentFilter.innerHTML = `
    <option value="">All Students</option>
    ${students.map(s => `<option value="${s.id}">${escapeHTML(s.name)}</option>`).join('')}
  `;
}

async function loadTasks() {
  try {
    const tasks = await API.getTasks(state.selectedTaskStatus, state.selectedTaskStudent);
    state.tasks = tasks;
    renderTasks(tasks);
  } catch (err) {
    showToast('Failed to load tasks: ' + err.message, 'error');
  }
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    elements.tasksGrid.innerHTML = '';
    elements.emptyTasksState.classList.remove('hidden');
    return;
  }

  elements.emptyTasksState.classList.add('hidden');

  elements.tasksGrid.innerHTML = tasks.map(task => `
    <div class="task-card" data-id="${task.id}">
      <div>
        <div class="task-card-header">
          <span class="task-priority-chip priority-${task.priority}">${task.priority} Priority</span>
          <button class="btn-action-icon btn-delete" title="Delete Task" onclick="window.deleteTaskItem(${task.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <h4 class="task-title">${escapeHTML(task.title)}</h4>
        ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
        <div class="task-student-meta" style="margin-top: 0.6rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${escapeHTML(task.student_name)} • ${escapeHTML(task.student_department)}</span>
        </div>
      </div>

      <div class="task-card-footer">
        <div class="task-due-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Due: ${formatDate(task.due_date)}</span>
        </div>
        <div>
          <select class="status-dropdown" onchange="window.handleStatusChange(${task.id}, this.value)">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// FORM HANDLING
// ==========================================
function validateStudentForm(name, email, department) {
  let isValid = true;
  elements.nameError.textContent = '';
  elements.emailError.textContent = '';
  elements.deptError.textContent = '';

  if (!name.trim()) {
    elements.nameError.textContent = 'Please enter student name';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    elements.emailError.textContent = 'Please enter email address';
    isValid = false;
  } else if (!emailRegex.test(email.trim())) {
    elements.emailError.textContent = 'Please enter a valid email address';
    isValid = false;
  }

  if (!department) {
    elements.deptError.textContent = 'Please select a department';
    isValid = false;
  }

  return isValid;
}

elements.addStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = elements.studentNameInput.value;
  const email = elements.studentEmailInput.value;
  const department = elements.studentDeptInput.value;

  if (!validateStudentForm(name, email, department)) return;

  elements.submitStudentBtn.classList.add('loading');
  elements.submitStudentBtn.disabled = true;

  try {
    const res = await API.addStudent({ name, email, department });
    showToast(`Student "${res.student.name}" registered successfully!`, 'success');
    
    // Reset Form
    elements.addStudentForm.reset();
    
    // Refresh lists & stats
    await Promise.all([loadStudents(), loadStats()]);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    elements.submitStudentBtn.classList.remove('loading');
    elements.submitStudentBtn.disabled = false;
  }
});

// Search & Filter Events
let debounceTimer;
elements.studentSearchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.trim();
  elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadStudents();
  }, 250);
});

elements.clearSearchBtn.addEventListener('click', () => {
  elements.studentSearchInput.value = '';
  state.searchQuery = '';
  elements.clearSearchBtn.style.display = 'none';
  loadStudents();
});

elements.departmentFilter.addEventListener('change', (e) => {
  state.selectedDepartment = e.target.value;
  loadStudents();
});

elements.refreshStudentsBtn.addEventListener('click', async () => {
  elements.refreshStudentsBtn.style.transform = 'rotate(180deg)';
  await refreshAllData();
  setTimeout(() => {
    elements.refreshStudentsBtn.style.transform = 'none';
  }, 300);
  showToast('Data refreshed successfully', 'success');
});

// Edit Student Logic
window.openEditStudent = (id) => {
  const student = state.students.find(s => s.id === id);
  if (!student) return;

  elements.editStudentId.value = student.id;
  elements.editStudentName.value = student.name;
  elements.editStudentEmail.value = student.email;
  elements.editStudentDepartment.value = student.department;

  elements.editStudentModal.classList.remove('hidden');
};

elements.closeEditModalBtn.addEventListener('click', () => {
  elements.editStudentModal.classList.add('hidden');
});
elements.cancelEditBtn.addEventListener('click', () => {
  elements.editStudentModal.classList.add('hidden');
});

elements.editStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = elements.editStudentId.value;
  const name = elements.editStudentName.value.trim();
  const email = elements.editStudentEmail.value.trim();
  const department = elements.editStudentDepartment.value;

  try {
    await API.updateStudent(id, { name, email, department });
    elements.editStudentModal.classList.add('hidden');
    showToast('Student information updated successfully!', 'success');
    await Promise.all([loadStudents(), loadStats(), loadTasks()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Delete Student Logic
window.deleteStudent = async (id, name) => {
  const confirmed = await openConfirmModal(
    'Delete Student Record',
    `Are you sure you want to delete student "${name}"? All associated tasks will also be removed.`,
    'Delete Record'
  );

  if (confirmed) {
    try {
      await API.deleteStudent(id);
      showToast(`Student "${name}" deleted.`, 'warning');
      await Promise.all([loadStudents(), loadStats(), loadTasks()]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
};

// Task Actions
window.assignTaskTo = (studentId) => {
  elements.taskStudentSelect.value = studentId;
  // Default due date: 7 days from now
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  elements.taskDueDate.value = nextWeek.toISOString().split('T')[0];
  
  elements.createTaskModal.classList.remove('hidden');
};

elements.openCreateTaskModalBtn.addEventListener('click', () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  elements.taskDueDate.value = nextWeek.toISOString().split('T')[0];
  elements.createTaskModal.classList.remove('hidden');
});

elements.closeTaskModalBtn.addEventListener('click', () => {
  elements.createTaskModal.classList.add('hidden');
});
elements.cancelTaskBtn.addEventListener('click', () => {
  elements.createTaskModal.classList.add('hidden');
});

elements.createTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const student_id = elements.taskStudentSelect.value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const due_date = elements.taskDueDate.value;
  const priority = document.getElementById('taskPriority').value;

  if (!student_id || !title) {
    showToast('Please select a student and task title', 'warning');
    return;
  }

  try {
    await API.addTask({ student_id, title, description, due_date, priority, status: 'Pending' });
    elements.createTaskModal.classList.add('hidden');
    elements.createTaskForm.reset();
    showToast('Task assigned successfully!', 'success');
    await Promise.all([loadTasks(), loadStats()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

window.handleStatusChange = async (taskId, newStatus) => {
  try {
    await API.updateTaskStatus(taskId, newStatus);
    showToast(`Task status updated to "${newStatus}"`, 'success');
    await Promise.all([loadTasks(), loadStats()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteTaskItem = async (taskId) => {
  const confirmed = await openConfirmModal(
    'Delete Task',
    'Are you sure you want to delete this task?',
    'Delete Task'
  );

  if (confirmed) {
    try {
      await API.deleteTask(taskId);
      showToast('Task removed successfully', 'warning');
      await Promise.all([loadTasks(), loadStats()]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
};

// Task Filtering
elements.taskStatusPills.forEach(pill => {
  pill.addEventListener('click', () => {
    elements.taskStatusPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.selectedTaskStatus = pill.getAttribute('data-status');
    loadTasks();
  });
});

elements.taskStudentFilter.addEventListener('change', (e) => {
  state.selectedTaskStudent = e.target.value;
  loadTasks();
});

// Confirmation Modal Listeners
elements.confirmCancelBtn.addEventListener('click', () => closeConfirmModal(false));
elements.confirmActionBtn.addEventListener('click', () => closeConfirmModal(true));
elements.confirmModal.addEventListener('click', (e) => {
  if (e.target === elements.confirmModal) closeConfirmModal(false);
});

// Navigation Tab Switching
elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.getAttribute('data-target');
    elements.tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    elements.sections.forEach(section => {
      if (section.id === targetId) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    state.activeTab = targetId;
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  refreshAllData();
});
