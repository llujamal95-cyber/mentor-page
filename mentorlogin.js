const interns=[
{name:'Jamalluddin',dept:'Frontend Development',attendance:88,marks:82,level:2,pending:2,missed:2},
{name:'Usmaniya',dept:'Web Design',attendance:91,marks:86,level:2,pending:1,missed:1},
{name:'Saniya Taj',dept:'Java Basics',attendance:84,marks:79,level:1,pending:3,missed:3},
{name:'Noorani',dept:'Python Basics',attendance:80,marks:75,level:1,pending:2,missed:2},
{name:'Sayeda',dept:'IT Training',attendance:93,marks:89,level:3,pending:0,missed:0},
{name:'Dhanush V',dept:'Frontend Development',attendance:86,marks:81,level:2,pending:1,missed:1}
];

const mentors=[
{name:'Sahana',dept:'Frontend Mentor'},
{name:'Dhanush RV',dept:'Technical Mentor'}
];

const quizQuestions=[
{q:'Which tag is used to create a heading in HTML?',a:['<p>','<h1>','<img>'],c:1},
{q:'Which CSS property changes text color?',a:['font-size','color','margin'],c:1},
{q:'Which language makes a webpage interactive?',a:['JavaScript','HTML only','CSS only'],c:0},
{q:'Which symbol is used for an ID selector in CSS?',a:['.','#','@'],c:1},
{q:'Which method shows a popup in JavaScript?',a:['alert()','print()','show()'],c:0}
];

function tasks(){
return JSON.parse(localStorage.getItem('portalTasks')||'[]')
}

function saveTasks(t){
localStorage.setItem('portalTasks',JSON.stringify(t))
}

function msgs(){
return JSON.parse(localStorage.getItem('portalMessages')||'[]')
}

function saveMsgs(m){
localStorage.setItem('portalMessages',JSON.stringify(m))
}

function badgeStore(){
return JSON.parse(localStorage.getItem('portalBadges')||'{}')
}

function saveBadges(b){
localStorage.setItem('portalBadges',JSON.stringify(b))
}

function quizStore(){
return JSON.parse(localStorage.getItem('portalQuizScores')||'{}')
}

function saveQuiz(q){
localStorage.setItem('portalQuizScores',JSON.stringify(q))
}

function calcXP(i){
let qs=quizStore()[i.name]?.score||0;
let admin=(badgeStore()[i.name]||[]).length*80;
return i.marks*10+i.attendance*3-(i.missed||0)*20+qs*50+admin
}

function calcBadge(i){
if((quizStore()[i.name]?.score||0)>=4)return '🧠 Quiz Master';
if(i.marks>=88)return '🏆 Elite Performer';
if(i.marks>=82)return '🥇 Pro Coder';
return '🥈 Skill Builder'
}

function calcProgress(i){
return Math.min(100,Math.round((i.marks+i.attendance+(quizStore()[i.name]?.score||0)*10)/2.2))
}

function allBadges(i){
return [calcBadge(i)].concat(badgeStore()[i.name]||[])
}

function title(h,p){
return `<div class="hero"><h1 class="game-title">${h}</h1><p>${p}</p></div>`
}

function active(s){
document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active'));
document.getElementById('nav-'+s)?.classList.add('active')
}

function chatUI(options){
return `<div class="card">
<label>Chat With</label>
<select id="chatTo" onchange="renderChat()">
${options.map(x=>`<option>${x}</option>`).join('')}
</select>
<div class="chat-box" id="chatBox"></div>
<div class="chat-row">
<input id="chatText" placeholder="Type message...">
<button class="btn" onclick="sendMessage()">Send</button>
</div>
</div>`
}

function renderChat(){
let from=currentName();
let to=document.getElementById('chatTo')?.value;
let box=document.getElementById('chatBox');

if(!box)return;

let m=msgs().filter(x=>
(x.from===from&&x.to===to)||(x.from===to&&x.to===from)
);

box.innerHTML=m.length
?m.map(x=>`<div class="msg ${x.from===from?'sent':'received'}"><b>${x.from}</b><br>${x.text}</div>`).join('')
:`<div class="msg received">No messages yet.</div>`
}

function sendMessage(){
let text=document.getElementById('chatText').value.trim();
if(!text)return;

let m=msgs();
m.push({
from:currentName(),
to:document.getElementById('chatTo').value,
text
});

saveMsgs(m);
document.getElementById('chatText').value='';
renderChat()
}

const validUsers={
'sahana':'Sahana',
'dhanush rv':'Dhanush RV',
'dhanush':'Dhanush RV'
};

function loginUser(){
let e=document.getElementById('loginName').value.trim().toLowerCase();
if(!validUsers[e])return alert('Enter valid mentor name: Sahana or Dhanush RV');

localStorage.setItem('mentorUser',validUsers[e]);
location.href='mentordash.html'
}

function currentName(){
return localStorage.getItem('mentorUser')||'Sahana'
}

function avg(k){
return Math.round(interns.reduce((a,b)=>a+b[k],0)/interns.length)
}

function showSection(s){
active(s);

let app=document.getElementById('app');
let u=currentName();

document.getElementById('profileInitial').innerText=u[0];

if(s==='dashboard'){
app.innerHTML=
title(`${u} Mentor Dashboard`,'Monitor interns, XP, quizzes, tasks, and reports.')+

`<div class="grid grid-4">

<div class="card">
<h3>Total Interns</h3>
<div class="metric">${interns.length}</div>
</div>

<div class="card">
<h3>Average Attendance</h3>
<div class="metric">${avg('attendance')}%</div>
</div>

<div class="card">
<h3>Average Marks</h3>
<div class="metric">${avg('marks')}</div>
</div>

<div class="card">
<h3>Assigned Tasks</h3>
<div class="metric">${tasks().filter(t=>t.by===u).length}</div>
</div>

</div>`
}

if(s==='interns'){
app.innerHTML=
title('Interns','Intern details with XP, quiz scores, badges, and progress.')+
internTable()
}

if(s==='task'){
app.innerHTML=
title('Assign Quest','Assign task to interns.')+
taskForm()+
taskTable(tasks().filter(t=>t.by===u))
}

if(s==='message'){
app.innerHTML=
title('Message','Chat with interns and admin.')+
chatUI(['Admin',...interns.map(i=>i.name)]);

renderChat()
}

if(s==='report'){
app.innerHTML=
title('Reports','Intern XP, quiz, badge, and progress reports.')+
reportCards()
}
}

function internTable(){
return `<div class="card table-wrap">

<table>

<tr>
<th>Name</th>
<th>Department</th>
<th>Attendance</th>
<th>Marks</th>
<th>Quiz</th>
<th>XP</th>
<th>Badges</th>
<th>Progress</th>
</tr>

${interns.map(i=>`
<tr>
<td>${i.name}</td>
<td>${i.dept}</td>
<td>${i.attendance}%</td>
<td>${i.marks}</td>
<td>${quizStore()[i.name]?.score||0}/5</td>
<td>${calcXP(i)}</td>
<td>${allBadges(i).map(b=>`<span class="badge">${b}</span>`).join('')}</td>
<td>${calcProgress(i)}%</td>
</tr>`).join('')}

</table>

</div>`
}

function taskForm(){
return `<div class="card">

<label>Task Title</label>
<input id="taskTitle" placeholder="Task title">

<label>Assign To Intern</label>
<select id="taskTo">
${interns.map(i=>`<option>${i.name}</option>`).join('')}
</select>

<label>Deadline</label>
<input id="deadline" type="date">

<label>Description</label>
<textarea id="desc" placeholder="Task details"></textarea>

<button class="btn" onclick="assignTask()">Assign Task</button>

</div><br>`
}

function assignTask(){
let title=document.getElementById('taskTitle').value.trim();
if(!title)return alert('Enter task title');

let t=tasks();

t.push({
title,
to:document.getElementById('taskTo').value,
by:currentName(),
deadline:document.getElementById('deadline').value||'No deadline',
desc:document.getElementById('desc').value||'-',
status:'Pending'
});

saveTasks(t);
alert('Task assigned successfully.');
showSection('task')
}

function taskTable(a){
return `<div class="card table-wrap">

<table>

<tr>
<th>Quest</th>
<th>Intern</th>
<th>Deadline</th>
<th>Status</th>
<th>Description</th>
</tr>

${a.length
?a.map(t=>`
<tr>
<td>🎯 ${t.title}</td>
<td>${t.to}</td>
<td>${t.deadline}</td>
<td><span class="badge">${t.status}</span></td>
<td>${t.desc}</td>
</tr>`).join('')
:`<tr><td colspan="5">No assigned tasks yet.</td></tr>`}

</table>

</div>`
}

function reportCards(){
return `<div class="grid grid-3">

${interns.map(i=>`
<div class="card game-card">
<h3>${i.name}</h3>
<p>Quiz Score: ${quizStore()[i.name]?.score||0}/5</p>
<p>XP: ${calcXP(i)}</p>
<p>Progress: ${calcProgress(i)}%</p>
<div class="badge-box">
${allBadges(i).map(b=>`<span class="badge">${b}</span>`).join('')}
</div>
</div>`).join('')}

</div>`
}

function showProfile(){
alert(`Name: ${currentName()}\nRole: Mentor`)
}

if(document.getElementById('app')){
showSection('dashboard')
}