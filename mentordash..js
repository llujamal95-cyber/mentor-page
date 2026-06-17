const currentUser = JSON.parse(sessionStorage.getItem('portalCurrentUser') || '{"name":"Sahana","role":"mentor","email":"sahana@portal.com"}');
function norm(v){ return String(v || '').trim().toLowerCase(); }
function sameUser(a,b){ return norm(a) === norm(b); }
function messageMatches(message, a, b){ return (sameUser(message.sender, a) && sameUser(message.receiver, b)) || (sameUser(message.sender, b) && sameUser(message.receiver, a)); }


const defaultInterns = [
  { id: 1, name: 'Dhanush V', email: 'dhanushv@gmail.com', course: 'BCA 4th Sem', attendance: 70, marks: 75, tasks: 3 },
  { id: 2, name: 'Sayeda', email: 'sayeda@gmail.com', course: 'BCA 4th Sem', attendance: 82, marks: 88, tasks: 1 },
  { id: 3, name: 'Noorani', email: 'noorani@gmail.com', course: 'BCA 4th Sem', attendance: 68, marks: 72, tasks: 3 },
  { id: 4, name: 'Saniya', email: 'saniya@gmail.com', course: 'BCA 4th Sem', attendance: 91, marks: 93, tasks: 0 },
  { id: 5, name: 'Jamalluddin', email: 'jamalluddin@gmail.com', course: 'BCA 4th Sem', attendance: 74, marks: 79, tasks: 2 },
  { id: 6, name: 'Usmaniya', email: 'usmaniya@gmail.com', course: 'BCA 4th Sem', attendance: 86, marks: 90, tasks: 1 }
];

function normalizeInterns(interns = []) {
  const existingByName = new Map((Array.isArray(interns) ? interns : []).map(item => [String(item.name || '').toLowerCase(), item]));
  return defaultInterns.map(def => {
    const existing = existingByName.get(def.name.toLowerCase()) || {};
    return {
      ...def,
      ...existing,
      attendance: Number(existing.attendance ?? def.attendance),
      marks: Number(existing.marks ?? def.marks),
      tasks: Number(existing.tasks ?? def.tasks),
      course: existing.course || def.course,
      email: existing.email || def.email
    };
  });
}

function getUsers() {
  const users = JSON.parse(localStorage.getItem('portalUsers') || '{}');
  users.interns = normalizeInterns(users.interns);
  const defaultMentors = [
    { name: 'Sahana', role: 'mentor', email: 'sahana@portal.com', specialization: 'Frontend Mentor', password: '1234' },
    { name: 'Dhanush', role: 'mentor', email: 'dhanush@portal.com', specialization: 'Technical Mentor', password: '1234' }
  ];
  if (!Array.isArray(users.mentors) || !users.mentors.length) users.mentors = defaultMentors;
  if (!(users.mentors || []).some(m => sameUser(m.email, currentUser.email) || sameUser(m.name, currentUser.name))) users.mentors.push({ name: currentUser.name, role: 'mentor', email: currentUser.email, specialization: 'Internship Management' });
  localStorage.setItem('portalUsers', JSON.stringify(users));
  return users;
}
function saveUsers(users) { localStorage.setItem('portalUsers', JSON.stringify(users)); }
function getTasks() { return JSON.parse(localStorage.getItem('portalTasks') || '[]'); }
function getMessages() { return JSON.parse(localStorage.getItem('portalMessages') || '[]'); }
function saveTasks(tasks) { localStorage.setItem('portalTasks', JSON.stringify(tasks)); }
function saveMessages(messages) { localStorage.setItem('portalMessages', JSON.stringify(messages)); }

function showSection(id, el) {
  document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active-tab'));
  if (el) el.classList.add('active-tab');
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
  if (id === 'messages') renderChat();
}

function updateActiveTabOnScroll() {
  const sections = [...document.querySelectorAll('.section')];
  const navItems = [...document.querySelectorAll('.nav-links li')];
  let activeId = sections[0]?.id;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) activeId = section.id;
  });
  navItems.forEach(item => {
    const onclick = item.getAttribute('onclick') || '';
    item.classList.toggle('active-tab', onclick.includes(`'${activeId}'`));
  });
}

function logoutUser() {
  sessionStorage.removeItem('portalCurrentUser');
  window.location.href = 'mentorlogin.html';
}

function averageValue(list, key) {
  return Math.round(list.reduce((sum, item) => sum + Number(item[key] || 0), 0) / (list.length || 1));
}

function setProfile() {
  const users = getUsers();
  const mentor = (users.mentors || []).find(user => user.name === currentUser.name || user.email === currentUser.email) || users.mentors[0] || {};
  const department = mentor.specialization || 'Internship Management';

  document.getElementById('mentorHeading').textContent = `Welcome back, ${currentUser.name}`;
  document.getElementById('mentorWelcome').textContent = `${department} · Manage intern tasks and communication`;
  document.getElementById('mentorAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('summaryAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('navUserName').textContent = currentUser.name;
  document.getElementById('navUserEmail').textContent = currentUser.email;
  document.getElementById('summaryRoleTitle').textContent = department;
  document.getElementById('dashboardProfileName').textContent = currentUser.name;
  document.getElementById('summaryEmail').textContent = currentUser.email;
  document.getElementById('profileNameInput').value = currentUser.name;
  document.getElementById('profileEmailInput').value = currentUser.email;
  document.getElementById('profileSpecInput').value = department;
}

function renderHeroStats(interns, tasks) {
  const activeTasks = tasks.filter(task => task.status !== 'Completed').length;
  const avgAttendance = averageValue(interns, 'attendance');
  const avgMarks = averageValue(interns, 'marks');
  document.getElementById('heroMiniStats').innerHTML = `
    <div class="mini-stat"><strong>${interns.length}</strong><small>Students</small></div>
    <div class="mini-stat"><strong>${activeTasks}</strong><small>Active Tasks</small></div>
    <div class="mini-stat"><strong>${avgAttendance}%</strong><small>Attendance</small></div>
    <div class="mini-stat"><strong>${avgMarks}</strong><small>Marks</small></div>`;
}

function renderMentorDashboard() {
  const users = getUsers();
  const interns = users.interns || [];
  const tasks = getTasks();
  const messages = getMessages();
  const myMessages = messages.filter(message => message.sender === currentUser.name || message.receiver === currentUser.name);
  const topPerformer = interns.slice().sort((a, b) => b.marks - a.marks)[0];
  const lowAttendance = interns.filter(intern => intern.attendance < 75).length;

  renderHeroStats(interns, tasks);

  document.getElementById('mentorStats').innerHTML = `
    <div class="card"><span>${interns.length}</span><p>Total Students</p></div>
    <div class="card"><span>${averageValue(interns, 'attendance')}%</span><p>Average Attendance %</p></div>
    <div class="card"><span>${averageValue(interns, 'marks')}</span><p>Average Marks</p></div>
    <div class="card"><span>${tasks.filter(task => task.status !== 'Completed').length}</span><p>Active Tasks</p></div>
    <div class="card"><span>${topPerformer ? topPerformer.name : '-'}</span><p>Top Performer</p></div>
    <div class="card"><span>${lowAttendance}</span><p>Low Attendance Students</p></div>`;

  const activityFeed = [
    { title: 'Welcome back to the mentor dashboard.', meta: 'Notification' },
    { title: 'Dashboard session started', meta: new Date().toLocaleString() },
    { title: 'Mentor profile loaded', meta: new Date().toLocaleString() },
    ...myMessages.slice(-2).reverse().map(msg => ({ title: `${msg.sender} → ${msg.receiver}`, meta: msg.text }))
  ];

  document.getElementById('mentorRecentMessages').innerHTML = activityFeed.map(item => `
    <div class="activity-item">
      <strong>${item.title}</strong>
      <span>${item.meta}</span>
    </div>`).join('');

  document.getElementById('mentorCreatedTasks').innerHTML = tasks.slice().reverse().map(task => `
    <div class="task-tile">
      <strong>${task.title}</strong>
      <span>${task.assignedTo} · ${task.description}</span>
      <small>${task.deadline || 'No deadline'} · ${task.priority || 'Medium'} · ${task.status || 'Pending'}</small>
    </div>`).join('') || '<div class="task-tile"><strong>No tasks yet</strong><span>Assigned tasks will appear here.</span></div>';

  renderBarChart('marksChart', interns.map(i => ({ label: i.name.split(' ')[0], value: i.marks })));
  renderLineChart('attendanceChart', interns.map(i => ({ label: i.name.split(' ')[0], value: i.attendance })));
  renderLineChart('performanceChart', interns.map(i => ({ label: i.name.split(' ')[0], value: i.marks })));
  renderSnapshot('studentSnapshot', interns);
  renderSnapshot('profileStudentSnapshot', interns);
}

function renderBarChart(containerId, data) {
  const box = document.getElementById(containerId);
  if (!box) return;
  if (!data.length) {
    box.innerHTML = '<div class="chart-empty">No chart data</div>';
    return;
  }
  const max = Math.max(...data.map(d => Number(d.value) || 0), 100);
  box.innerHTML = data.map(item => {
    const value = Number(item.value) || 0;
    const height = Math.max(70, (value / max) * 220);
    return `
      <div class="bar-wrap">
        <div class="bar-value">${value}</div>
        <div class="bar" style="height:${height}px"></div>
        <div class="bar-label">${item.label}</div>
      </div>`;
  }).join('');
}

function renderLineChart(containerId, data) {
  const box = document.getElementById(containerId);
  if (!box) return;
  if (!data.length) {
    box.innerHTML = '<div class="chart-empty">No chart data</div>';
    return;
  }

  const values = data.map(item => Number(item.value) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 760;
  const height = 280;
  const padX = 42;
  const topY = 30;
  const bottomY = 210;
  const step = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
  const scale = (value) => {
    if (max === min) return (topY + bottomY) / 2;
    return bottomY - ((value - min) / (max - min)) * (bottomY - topY);
  };

  const points = data.map((item, index) => {
    const x = padX + index * step;
    const y = scale(Number(item.value) || 0);
    return { ...item, x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${bottomY + 18} L ${points[0].x} ${bottomY + 18} Z`;

  box.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="line-svg" preserveAspectRatio="none" aria-label="${containerId}">
      <defs>
        <linearGradient id="lineFill${containerId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style="stop-color:#63e4ff;stop-opacity:0.28"></stop>
          <stop offset="100%" style="stop-color:#63e4ff;stop-opacity:0.02"></stop>
        </linearGradient>
      </defs>
      <line x1="${padX}" y1="${bottomY + 18}" x2="${width - padX}" y2="${bottomY + 18}" stroke="rgba(255,255,255,0.18)" stroke-width="1"></line>
      <path d="${area}" fill="url(#lineFill${containerId})"></path>
      <path d="${line}" fill="none" stroke="#63e4ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points.map(p => `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="6" fill="#63e4ff"></circle>
          <text x="${p.x}" y="${p.y - 14}" text-anchor="middle" class="point-label">${p.value}</text>
          <text x="${p.x}" y="${height - 12}" text-anchor="middle" class="point-name">${p.label}</text>
        </g>`).join('')}
    </svg>`;
}

function populateInterns() {
  const users = getUsers();
  const interns = users.interns || [];
  const internSelect = document.getElementById('internSelect');
  if (internSelect) {
    internSelect.innerHTML = interns.map(intern => `<option value="${intern.name}">${intern.name}</option>`).join('');
  }

  document.getElementById('internCards').innerHTML = interns.map((intern, index) => {
    const attendanceClass = intern.attendance >= 80 ? 'good' : 'low';
    const marksClass = intern.marks >= 85 ? 'good' : '';
    const statusText = intern.attendance >= 80 ? 'Top Performer' : 'Low Attendance';
    const statusClass = intern.attendance >= 80 ? 'good' : 'low';
    const nameParts = intern.name.split(' ');
    const firstLine = nameParts.slice(0, -1).join(' ') || intern.name;
    const secondLine = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    return `
      <div class="intern-row">
        <div class="name-cell">
          <div class="name-badge">${intern.name.charAt(0)}</div>
          <div>
            <strong>${firstLine}${secondLine ? `<br>${secondLine}` : ''}</strong>
            <div class="muted">#${index + 1}</div>
          </div>
        </div>
        <div>${intern.course}</div>
        <div><span class="pill attendance ${attendanceClass}">${intern.attendance}%</span></div>
        <div><span class="pill marks ${marksClass}">${intern.marks}</span></div>
        <div><span class="pill tasks">${intern.tasks}</span></div>
        <div><span class="pill status ${statusClass}">${statusText}</span></div>
        <div class="actions">
          <button onclick="updateInternMetric('${intern.name}', 'attendance', 1)">+ Attendance</button>
          <button onclick="updateInternMetric('${intern.name}', 'marks', 1)">+ Marks</button>
          <button onclick="addTaskToIntern('${intern.name}')">+ Task</button>
          <button onclick="viewInternProfile('${intern.name}')">View Profile</button>
        </div>
      </div>`;
  }).join('');
}

function updateInternMetric(name, field, step) {
  const users = getUsers();
  users.interns = users.interns.map(intern => {
    if (intern.name !== name) return intern;
    const nextValue = Number(intern[field] || 0) + Number(step || 1);
    return {
      ...intern,
      [field]: field === 'attendance' ? Math.min(100, nextValue) : Math.min(100, nextValue)
    };
  });
  saveUsers(users);
  populateInterns();
  renderMentorDashboard();
}

function addTaskToIntern(name) {
  const users = getUsers();
  users.interns = users.interns.map(intern => intern.name === name ? { ...intern, tasks: Number(intern.tasks || 0) + 1 } : intern);
  saveUsers(users);
  populateInterns();
  renderMentorDashboard();
  const navTask = document.querySelectorAll('.nav-links li')[2];
  if (document.getElementById('internSelect')) document.getElementById('internSelect').value = name;
  showSection('tasks', navTask);
}

function viewInternProfile(name) {
  const users = getUsers();
  const intern = (users.interns || []).find(item => item.name === name);
  if (!intern) return;
  const navProfile = document.querySelectorAll('.nav-links li')[5];
  showSection('profile', navProfile);
  setTimeout(() => {
    const target = document.getElementById('profileStudentSnapshot');
    if (target) target.innerHTML = '<div class="student-profile-box"><h3>'+intern.name+'</h3><p>'+intern.course+'</p><p>Attendance: <strong>'+intern.attendance+'%</strong></p><p>Marks: <strong>'+intern.marks+'</strong></p><p>Tasks: <strong>'+intern.tasks+'</strong></p><p>Level: <strong>'+(intern.level || 1)+'</strong> · XP: <strong>'+(intern.xp || 0)+'</strong></p></div>';
    alert('Profile opened for '+intern.name);
  }, 350);
}

function renderSnapshot(targetId, interns) {
  const sorted = interns.slice().sort((a, b) => b.marks - a.marks);
  document.getElementById(targetId).innerHTML = sorted.map(intern => `
    <div class="snapshot-item">
      <div>
        <strong>${intern.name}</strong>
        <small>${intern.course}</small>
      </div>
      <div class="right">
        <strong>${intern.marks}</strong>
        <small>${intern.attendance >= 80 ? 'Top Performer' : 'Low Attendance'}</small>
      </div>
    </div>`).join('');
}

function assignTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const assignedTo = document.getElementById('internSelect').value;
  const deadline = document.getElementById('taskDeadline').value;
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;

  if (!title || !description || !assignedTo || !deadline) return;

  const tasks = getTasks();
  tasks.push({
    id: `task-${Date.now()}`,
    title,
    description,
    assignedBy: currentUser.name,
    assignedByRole: currentUser.role,
    assignedTo,
    assignedToRole: 'intern',
    deadline,
    priority,
    status,
    createdAt: new Date().toISOString()
  });
  saveTasks(tasks);

  const users = getUsers();
  users.interns = users.interns.map(intern => intern.name === assignedTo ? { ...intern, tasks: Number(intern.tasks || 0) + 1 } : intern);
  saveUsers(users);

  e.target.reset();
  populateInterns();
  renderMentorDashboard();
  alert('Task assigned to intern successfully.');
}

function populateChatContacts() {
  const users = getUsers();
  const allContacts = [{name:'Admin',role:'admin'}, ...(users.interns || []).map(i => ({name:i.name, role:'intern'}))];
  const select = document.getElementById('chatContact');
  if (!select) return;
  const oldValue = select.value;
  select.innerHTML = allContacts.map(person => '<option value="'+person.name+'" data-role="'+person.role+'">'+person.name+'</option>').join('');
  if (oldValue && [...select.options].some(o => o.value === oldValue)) select.value = oldValue;
  renderChat();
}

function renderChat() {
  const select = document.getElementById('chatContact');
  const list = document.getElementById('messagesList');
  if (!select || !list) return;
  const contact = select.value;
  const messages = getMessages().filter(message => messageMatches(message, currentUser.name, contact));
  list.innerHTML = messages.map(message => `
    <div class="message ${sameUser(message.sender, currentUser.name) ? 'sent' : 'received'}">
      <strong>${message.sender}</strong><br>${message.text}
      <small>${new Date(message.createdAt || Date.now()).toLocaleString()}</small>
    </div>`).join('') || '<div class="message received">No messages yet.</div>';
  list.scrollTop = list.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const select = document.getElementById('chatContact');
  const text = input.value.trim();
  const receiver = select.value;
  if (!text || !receiver) return;
  const option = select.options[select.selectedIndex];
  const messages = getMessages();
  messages.push({id: `msg-${Date.now()}`, sender: currentUser.name, senderRole: 'mentor', receiver, receiverRole: option?.dataset?.role || (receiver === 'Admin' ? 'admin' : 'intern'), text, createdAt: new Date().toISOString()});
  saveMessages(messages);
  input.value = '';
  renderMentorDashboard();
  renderChat();
}

function initializePage() {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById('dashboard').classList.add('active');
  document.getElementById('taskForm').addEventListener('submit', assignTask);
  document.getElementById('chatContact').addEventListener('change', renderChat);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  window.addEventListener('storage', () => { setProfile(); populateInterns(); populateChatContacts(); renderMentorDashboard(); });

  setProfile();
  populateInterns();
  populateChatContacts();
  renderMentorDashboard();
}

initializePage();

