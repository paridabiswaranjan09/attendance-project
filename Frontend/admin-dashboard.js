const API_URL = "http://localhost:5000/api";

// ------------------ Admin Name ------------------
const adminNameDisplay = document.getElementById("adminNameDisplay");
let adminName = localStorage.getItem("adminName") || "Admin";
adminNameDisplay.textContent = adminName;

// ------------------ Sections ------------------
const teacherSection = document.getElementById("teacherSection");
const courseSection = document.getElementById("courseSection");
const attendanceSection = document.getElementById("attendanceSection");
const changePassSection = document.getElementById("changePassSection");

// ------------------ Sidebar Buttons ------------------
document.getElementById("staffBtn").addEventListener("click", () => {
  hideAllSections();
  teacherSection.style.display = "block";
});
document.getElementById("courseBtn").addEventListener("click", () => {
  hideAllSections();
  courseSection.style.display = "block";
});
document.getElementById("viewAttendanceBtn").addEventListener("click", () => {
  hideAllSections();
  openAdminCourseSelectionModal();
});
document.getElementById("changePassBtn").addEventListener("click", () => {
  hideAllSections();
  changePassSection.style.display = "block";
  document.getElementById("changePasswordModal").style.display = "block";
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "Login-Table.html";
});
function hideAllSections() {
  teacherSection.style.display = "none";
  courseSection.style.display = "none";
  attendanceSection.style.display = "none";
  changePassSection.style.display = "none";
}

// ---------------- Teacher CRUD (API) -----------------
const teacherTableBody = document.getElementById("teacherTableBody");
let teachers = [];
let teacherActionVisible = false;

async function fetchTeachers() {
  const res = await fetch(`${API_URL}/teacher/list`);
  teachers = await res.json();
  renderTeachers();
}
function renderTeachers() {
  const actionCol = document.querySelector("#teacherSection th:last-child");
  actionCol.style.display = teacherActionVisible ? "table-cell" : "none";
  teacherTableBody.innerHTML = "";
  if (!teachers.length) {
    teacherTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Not added yet</td></tr>';
    return;
  }
  teachers.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.name}</td>
      <td>${t.email || t.phone || ''}</td>
      <td>${t.course || ''}</td>
      <td style="display:${teacherActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeTeacher('${t._id}')">Remove</button>
      </td>
    `;
    teacherTableBody.appendChild(row);
  });
}

// Add Teacher
document.getElementById("addTeacherBtn").addEventListener("click", () => {
  document.getElementById("addTeacherModal").style.display = "block";
});
document.getElementById("confirmAddBtn").addEventListener("click", async () => {
  const name = document.getElementById("tName").value.trim();
  const email = document.getElementById("tEmail").value.trim();
  const phone = document.getElementById("tPhone").value.trim();
  const password = document.getElementById("tPassword").value.trim();
  const course = document.getElementById("tCourse").value.trim();
  const branch = document.getElementById("tBranch").value.trim();
  if (!name || !email || !phone || !password || !course || !branch) {
    alert("Fill all fields");
    return;
  }
  await fetch(`${API_URL}/teacher/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password, course, branch })
  });
  fetchTeachers();
  document.getElementById("addTeacherModal").style.display = "none";
  document.getElementById("tName").value = "";
  document.getElementById("tEmail").value = "";
  document.getElementById("tPhone").value = "";
  document.getElementById("tPassword").value = "";
  document.getElementById("tCourse").value = "";
  document.getElementById("tBranch").value = "";
});
async function removeTeacher(id) {
  await fetch(`${API_URL}/teacher/remove/${id}`, { method: "DELETE" });
  fetchTeachers();
}
document.getElementById("removeTeacherBtn").addEventListener("click", () => {
  teacherActionVisible = !teacherActionVisible;
  renderTeachers();
});
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("addTeacherModal").style.display = "none";
});

// ---------------- Course CRUD (API) -----------------
const courseTableBody = document.getElementById("courseTableBody");
let courses = [];
let courseActionVisible = false;
let currentCourse = null;

async function fetchCourses() {
  const res = await fetch(`${API_URL}/course/list`);
  courses = await res.json();
  renderCourses();
}
function renderCourses() {
  const actionCol = document.querySelector("#courseSection th:last-child");
  actionCol.style.display = courseActionVisible ? "table-cell" : "none";
  courseTableBody.innerHTML = "";
  if (!courses.length) {
    courseTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No courses added</td></tr>';
    return;
  }
  courses.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td onclick="openBranchTable('${c._id}')" style="cursor:pointer;">${c.name}</td>
      <td style="display:${courseActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeCourse('${c._id}')">Remove</button>
      </td>
    `;
    courseTableBody.appendChild(row);
  });
}
document.getElementById("addCourseBtn").addEventListener("click", () => {
  document.getElementById("addCourseModal").style.display = "block";
});
document.getElementById("confirmAddCourseBtn").addEventListener("click", async () => {
  const name = document.getElementById("courseNameInput").value.trim();
  if (!name) {
    alert("Enter course name");
    return;
  }
  await fetch(`${API_URL}/course/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  fetchCourses();
  document.getElementById("addCourseModal").style.display = "none";
  document.getElementById("courseNameInput").value = "";
});
async function removeCourse(id) {
  await fetch(`${API_URL}/course/remove/${id}`, { method: "DELETE" });
  fetchCourses();
}
document.getElementById("removeCourseBtn").addEventListener("click", () => {
  courseActionVisible = !courseActionVisible;
  renderCourses();
});
document.getElementById("closeCourseModal").addEventListener("click", () => {
  document.getElementById("addCourseModal").style.display = "none";
});

// --------------- Branch CRUD inside Course ------------------
const branchFloatTableBody = document.getElementById("branchFloatTableBody");
let branches = [];
let branchActionVisible = false;

async function openBranchTable(courseId) {
  currentCourse = courses.find(c => c._id === courseId);
  renderBranches();
  document.getElementById("branchModalCourseName").textContent = currentCourse.name;
  document.getElementById("branchTableModal").style.display = "block";
  fetchBranches();
}
async function fetchBranches() {
  const res = await fetch(`${API_URL}/branch/list`);
  branches = await res.json();
  renderBranches();
}
function renderBranches() {
  const actionColHeading = document.getElementById("branchFloatActionCol");
  actionColHeading.style.display = branchActionVisible ? "table-cell" : "none";
  branchFloatTableBody.innerHTML = "";
  if (!branches.length) {
    branchFloatTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No branches added</td></tr>';
    return;
  }
  branches.forEach((b, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${b.name}</td>
      <td style="display:${branchActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeBranch('${b._id}')">Remove</button>
      </td>
    `;
    branchFloatTableBody.appendChild(row);
  });
}
document.getElementById("addBranchTableBtn").addEventListener("click", () => {
  document.getElementById("addBranchFloatModal").style.display = "block";
});
document.getElementById("confirmAddBranchFloatBtn").addEventListener("click", async () => {
  const name = document.getElementById("branchFloatNameInput").value.trim();
  if (!name) {
    alert("Enter branch name");
    return;
  }
  await fetch(`${API_URL}/branch/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  fetchBranches();
  document.getElementById("addBranchFloatModal").style.display = "none";
  document.getElementById("branchFloatNameInput").value = "";
});
async function removeBranch(id) {
  await fetch(`${API_URL}/branch/remove/${id}`, { method: "DELETE" });
  fetchBranches();
}
document.getElementById("removeBranchTableBtn").addEventListener("click", () => {
  branchActionVisible = !branchActionVisible;
  renderBranches();
});
document.getElementById("closeBranchTableModal").addEventListener("click", () => {
  document.getElementById("branchTableModal").style.display = "none";
});
document.getElementById("closeBranchFloatAddModal").addEventListener("click", () => {
  document.getElementById("addBranchFloatModal").style.display = "none";
});

// --------------- Attendance View (Admin) ---------------
let adminSelectedCourse = null;
let adminSelectedBranch = null;
const adminAttendanceDateInput = document.getElementById("adminAttendanceDate");
const adminAttendanceTableBody = document.getElementById("adminAttendanceTableBody");
const adminAttendanceHeading = document.getElementById("attendanceHeading");
const downloadAdminPdfBtn = document.getElementById("downloadAdminPdfBtn");
// Modal elements etc remain same...

function openAdminCourseSelectionModal() {
  if (!courses.length) {
    alert("No courses available. Please add courses first.");
    return;
  }
  // render course modal as before
}

async function loadAdminAttendanceTable() {
  // Yahan pe attendance data backend se fetch karo
  // Example:
  if (!adminSelectedCourse || !adminSelectedBranch) return;
  const date = adminAttendanceDateInput.value;
  // Backend attendance fetch
  const res = await fetch(`${API_URL}/attendance/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course: adminSelectedCourse,
      branch: adminSelectedBranch,
      date: date
    })
  });
  const attendance = await res.json();
  // Render table from attendance data
}

// ------------------ Change Password (API) -----------------
document.getElementById("savePasswordBtn").addEventListener("click", async () => {
  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("confirmPassword").value;
  const message = document.getElementById("passwordMessage");

  // Backend authentication logic for change password
  if (newPass !== confirmPass) {
    message.style.color = "red";
    message.textContent = "New password and confirm password do not match.";
    return;
  }
  if (newPass.length < 6) {
    message.style.color = "red";
    message.textContent = "New password should be at least 6 characters.";
    return;
  }
  // Call /api/admin/change-password (need to make route in backend)
  /*
  const res = await fetch(`${API_URL}/admin/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: adminName, oldPass, newPass })
  });
  const data = await res.json();
  if (data.success) {
    message.style.color = "green";
    message.textContent = "Password changed successfully!";
  } else {
    message.style.color = "red";
    message.textContent = data.message || "Failed to change password";
  }
  */
});

// ------------------ On Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchTeachers();
  fetchCourses();
  // Branches auto-load with modal open
});
