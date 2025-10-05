const ownerPassword = "R@hi9";
let currentUser = null;
let currentRole = null;
const gradeMap = { "A+":4.00, "A":3.75, "B+":3.50, "B":3.25, "C+":3.00, "C":2.75, "D+":2.50, "D":2.25, "F":0.00 };

// -------------------- Role Selection --------------------
function selectRole(role) {
  currentRole = role;
  hideAllSections();
  if (role === "new") document.getElementById("newUserForm").classList.remove("hidden");
  if (role === "member") {
    document.getElementById("memberLogin").classList.remove("hidden");
    populateMemberList();
  }
  if (role === "owner") document.getElementById("ownerLogin").classList.remove("hidden");
}

// -------------------- Back Option --------------------
function goBack() {
  hideAllSections();
  document.getElementById("roleSelection").classList.remove("hidden");
}

function hideAllSections() {
  document.getElementById("newUserForm").classList.add("hidden");
  document.getElementById("memberLogin").classList.add("hidden");
  document.getElementById("ownerLogin").classList.add("hidden");
  document.getElementById("cgpaPortal").classList.add("hidden");
  document.getElementById("ownerMembersList").classList.add("hidden");
  document.getElementById("roleSelection").classList.add("hidden");
}

// -------------------- Storage --------------------
function getUsers() {
  return JSON.parse(localStorage.getItem("cgpaUsers") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("cgpaUsers", JSON.stringify(users));
}

// -------------------- New User --------------------
function createNewUser() {
  let name = document.getElementById("newUserName").value.trim();
  let pass = document.getElementById("newUserPass").value;
  if (!name || !pass) { alert("Enter name & password"); return; }
  let users = getUsers(), count = 1, base = name;
  while (users.some(u => u.name === name)) { count++; name = base + " " + count; }
  let newUser = { name, pass, semesters: [] };
  users.push(newUser);
  saveUsers(users);
  currentUser = newUser;
  showPortal();
  alert(`Account created! Username: ${name}`);
  document.getElementById("newUserName").value = "";
  document.getElementById("newUserPass").value = "";
}

// -------------------- Member Login --------------------
function populateMemberList() {
  const select = document.getElementById("memberSelect");
  select.innerHTML = "";
  getUsers().forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    select.appendChild(opt);
  });
}

function loginMember() {
  const name = document.getElementById("memberSelect").value;
  const pass = document.getElementById("memberPass").value;
  const user = getUsers().find(u => u.name === name);

  if (!user) {
    alert("No user found. Please sign up as a new user.");
    return;
  }

  if (user.pass === pass) {
    currentUser = user;
    showPortal();
    alert(`Welcome back ${name}`);
    document.getElementById("memberPass").value = "";
  } else {
    alert("Invalid password. Try again.");
  }
}

// -------------------- Owner Login --------------------
function loginOwner() {
  const pass = document.getElementById("ownerPassInput").value;
  if (pass === ownerPassword) {
    currentUser = null;
    showPortal(true);
    alert("Welcome back Rahi Bhaiya");
    document.getElementById("ownerPassInput").value = "";
  }
  else alert("Invalid password");
}

// -------------------- Logout --------------------
function logout() {
  currentUser = null;
  currentRole = null;
  hideAllSections();
  document.getElementById("roleSelection").classList.remove("hidden");
}

// -------------------- Portal --------------------
function showPortal(isOwner = false) {
  hideAllSections();
  document.getElementById("cgpaPortal").classList.remove("hidden");
  document.getElementById("ownerMembersList").classList.toggle("hidden", !isOwner);
  document.getElementById("welcomeUser").textContent = isOwner ? "Owner Portal" : `Welcome ${currentUser.name}`;
  renderSemesters();
  if (isOwner) renderAllMembers();
}

// -------------------- Semesters --------------------
function addSemester() {
  if (!currentUser) return;
  const semIndex = currentUser.semesters.length;
  const semName = `Semester ${semIndex + 1}`; // Auto-name
  currentUser.semesters.push({ name: semName, courses: [] });
  saveUserChanges();
  renderSemesters();
}

function removeSemester(semIndex) {
  if (confirm("Are you sure you want to remove this semester? This will delete all its courses.")) {
    currentUser.semesters.splice(semIndex, 1);
    saveUserChanges();
    renderSemesters();
  }
}

function addCourse(semIndex) {
  const sem = currentUser.semesters[semIndex];
  sem.courses.push({ name: "", credit: 0, grade: "A" });
  saveUserChanges();
  renderSemesters();
}

function removeCourse(semIndex, courseIndex) {
  currentUser.semesters[semIndex].courses.splice(courseIndex, 1);
  saveUserChanges();
  renderSemesters();
}

function updateCourse(semIndex, courseIndex, field, value) {
  const course = currentUser.semesters[semIndex].courses[courseIndex];
  if (field === "name") course.name = value;
  if (field === "credit") course.credit = parseFloat(value) || 0;
  if (field === "grade") course.grade = value;
  saveUserChanges();
  renderSemesters();
}

// -------------------- Render --------------------
function renderSemesters() {
  const container = document.getElementById("semesters");
  container.innerHTML = "";
  if (!currentUser) return;
  currentUser.semesters.forEach((sem, i) => {
    const div = document.createElement("div");
    div.classList.add("semester");

    // Header, buttons
    const h3 = document.createElement("h3");
    h3.textContent = sem.name;
    div.appendChild(h3);

    const addCourseBtn = document.createElement("button");
    addCourseBtn.textContent = "Add Course";
    addCourseBtn.onclick = () => addCourse(i);
    div.appendChild(addCourseBtn);

    const removeSemBtn = document.createElement("button");
    removeSemBtn.textContent = "Remove Semester";
    removeSemBtn.className = "remove-sem-btn";
    removeSemBtn.onclick = () => removeSemester(i);
    div.appendChild(removeSemBtn);

    // Table
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    ["Course", "Credit", "Grade", "Action"].forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    sem.courses.forEach((c, j) => {
      const tr = document.createElement("tr");

      // Course name
      const tdName = document.createElement("td");
      const inputName = document.createElement("input");
      inputName.value = c.name;
      inputName.onchange = (e) => updateCourse(i, j, "name", e.target.value);
      tdName.appendChild(inputName);
      tr.appendChild(tdName);

      // Credit
      const tdCredit = document.createElement("td");
      const inputCredit = document.createElement("input");
      inputCredit.type = "number";
      inputCredit.value = c.credit;
      inputCredit.step = "0.5";
      inputCredit.onchange = (e) => updateCourse(i, j, "credit", e.target.value);
      tdCredit.appendChild(inputCredit);
      tr.appendChild(tdCredit);

      // Grade
      const tdGrade = document.createElement("td");
      const selectGrade = document.createElement("select");
      Object.keys(gradeMap).forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g; // This will display A+, B+, etc.
        if (c.grade === g) opt.selected = true;
        selectGrade.appendChild(opt);
      });
      selectGrade.onchange = (e) => updateCourse(i, j, "grade", e.target.value);
      tdGrade.appendChild(selectGrade);
      tr.appendChild(tdGrade);

      // Remove course
      const tdRemove = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = () => removeCourse(i, j);
      tdRemove.appendChild(removeBtn);
      tr.appendChild(tdRemove);

      table.appendChild(tr);
    });

    div.appendChild(table);

    // Semester GPA
    const resultDiv = document.createElement("div");
    resultDiv.className = "result";
    resultDiv.textContent = "Semester GPA: " + calculateGPA(sem).toFixed(2);
    div.appendChild(resultDiv);

    container.appendChild(div);
  });

  document.getElementById("overallCGPA").textContent = "Overall CGPA: " + calculateOverallCGPA().toFixed(2);
}

// -------------------- GPA --------------------
function calculateGPA(sem) {
  let tC = 0, tP = 0;
  sem.courses.forEach(c => { tC += c.credit; tP += c.credit * gradeMap[c.grade]; });
  return tC ? tP / tC : 0;
}

// -------------------- Overall CGPA with Retakes --------------------
function calculateOverallCGPA() {
  if (!currentUser) return 0;
  let tC = 0, tP = 0;
  const latestCourses = {}; // track latest attempt for each course

  currentUser.semesters.forEach(sem => {
    sem.courses.forEach(c => {
      if (c.name) latestCourses[c.name] = c; // overwrite previous attempt if same course
    });
  });

  Object.values(latestCourses).forEach(c => {
    tC += c.credit;
    tP += c.credit * gradeMap[c.grade];
  });

  return tC ? tP / tC : 0;
}

// -------------------- Save --------------------
function saveUserChanges() {
  const users = getUsers();
  const idx = users.findIndex(u => u.name === currentUser.name);
  if (idx >= 0) { users[idx] = currentUser; saveUsers(users); }
}

// -------------------- Owner --------------------
function renderAllMembers() {
  const container = document.getElementById("allMembers");
  container.innerHTML = "";
  getUsers().forEach(u => {
    const div = document.createElement("div");
    div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.alignItems = "center"; div.style.marginBottom = "5px";

    const btn = document.createElement("button");
    btn.textContent = u.name;
    btn.onclick = () => { currentUser = u; renderSemesters(); };

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "#ff4d4d"; delBtn.style.marginLeft = "5px";
    delBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete ${u.name}? This will erase all their info.`)) {
        const users = getUsers().filter(x => x.name !== u.name);
        saveUsers(users);
        renderAllMembers();
        alert(`${u.name} has been deleted.`);
      }
    };

    div.appendChild(btn);
    div.appendChild(delBtn);
    container.appendChild(div);
  });
}