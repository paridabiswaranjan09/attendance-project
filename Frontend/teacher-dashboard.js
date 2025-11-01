const API_URL = "http://localhost:5000/api";

// ------------------ Teacher Name Display ------------------
const teacherNameDisplay = document.getElementById("teacherNameDisplay");
const teacherCourseBranch = document.getElementById("teacherCourseBranch");
let teacherName = localStorage.getItem("teacherName") || "Teacher";

// ------------------ Sections ------------------
const studentsSection = document.getElementById("studentsSection");
const takeAttendanceSection = document.getElementById("takeAttendanceSection");
const viewAttendanceSection = document.getElementById("viewAttendanceSection");
const viewComplainSection = document.getElementById("viewComplainSection");

// ------------------ Main Panel Heading ------------------
const mainPanel = document.getElementById("mainPanel");

// ------------------ Modal Elements (Course/Branch) ------------------
const courseSelectionModal = document.getElementById("courseSelectionModal");
const branchSelectionModal = document.getElementById("branchSelectionModal");
const courseSelectionTableBody = document.getElementById("courseSelectionTableBody");
const branchSelectionTableBody = document.getElementById("branchSelectionTableBody");
const selectedCourseNameSpan = document.getElementById("selectedCourseName");
const closeCourseSelectionModalBtn = document.getElementById("closeCourseSelectionModal");
const closeBranchSelectionModalBtn = document.getElementById("closeBranchSelectionModal");

// ------------------ Add Student Modal Elements ------------------
const addStudentModal = document.getElementById("addStudentModal");
const closeAddStudentModalBtn = document.getElementById("closeAddStudentModal");
const confirmAddStudentBtn = document.getElementById("confirmAddStudentBtn");
const studentNameInput = document.getElementById("studentNameInput");
const studentRegdNoInput = document.getElementById("studentRegdNoInput");

// ------------------ Students Section Elements ------------------
const studentsTableBody = document.getElementById("studentsTableBody");
const studentsHeading = document.getElementById("studentsHeading");
const addStudentBtn = document.getElementById("addStudentBtn");
const removeStudentBtn = document.getElementById("removeStudentBtn");
const studentsTable = document.getElementById("studentsTable");

// ------------------ Take Attendance Elements ------------------
const attendanceDateInput = document.getElementById("attendanceDate");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
const takeAttendanceHeading = document.getElementById("takeAttendanceHeading");

// ------------------ View Attendance Elements ------------------
const viewAttendanceDateInput = document.getElementById("viewAttendanceDate");
const viewAttendanceRecordsBody = document.getElementById("viewAttendanceRecordsBody");
const viewAttendanceHeading = document.getElementById("viewAttendanceHeading");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

// ------------------ View Complain Elements ------------------
const viewComplainHeading = document.getElementById("viewComplainHeading");
const complaintsTableBody = document.getElementById("complaintsTableBody");
const toggleComplaintActionsBtn = document.getElementById("toggleComplaintActions");
const complaintsTable = document.getElementById("complaintsTable");

// ------------------ Photo Modal Elements ------------------
const photoModal = document.getElementById("photoModal");
const fullPhoto = document.getElementById("fullPhoto");
const closePhotoModalBtn = document.getElementById("closePhotoModal");

// -------------- Global State ----------------
let courses = [];
let selectedCourse = null;
let selectedBranch = null;
let selectedCourseBranchKey = "";

async function updateTeacherLocationDisplay() {
  selectedCourse = localStorage.getItem("teacherSelectedCourse") || null;
  selectedBranch = localStorage.getItem("teacherSelectedBranch") || null;
  if(selectedCourse && selectedBranch) {
    selectedCourseBranchKey = `${selectedCourse}_${selectedBranch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  } else {
    selectedCourseBranchKey = "";
  }
  teacherNameDisplay.textContent = teacherName;
  teacherCourseBranch.textContent = selectedCourse && selectedBranch ? `${selectedCourse} - ${selectedBranch}` : "No course/branch selected";
  teacherCourseBranch.title = selectedCourseBranchKey ? "Click to change course/branch" : "Select course/branch first";
  mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, you are in ${selectedCourse || 'No Course'} - ${selectedBranch || 'No Branch'}`;
  hideAllSections();
  await fetchCourses();
}

// ------------------ Hide all sections --------------------
function hideAllSections() {
  studentsSection.style.display = 'none';
  takeAttendanceSection.style.display = 'none';
  viewAttendanceSection.style.display = 'none';
  viewComplainSection.style.display = 'none';
}

// ------------------ Fetch courses from backend ----------------
async function fetchCourses() {
  const res = await fetch(`${API_URL}/course/list`);
  courses = await res.json();
}

// ------------------ Modal open and selection ----------------
function openCourseSelectionModal() {
  if(courses.length === 0){
    alert("No courses available. Please ask Admin to add courses.");
    return;
  }
  courseSelectionTableBody.innerHTML = "";
  courses.forEach(course => {
    let tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `<td>${course.name}</td>`;
    tr.addEventListener('click', () => openBranchSelectionModal(course));
    courseSelectionTableBody.appendChild(tr);
  });
  courseSelectionModal.style.display = "flex";
}

function openBranchSelectionModal(course) {
  selectedCourseNameSpan.textContent = course.name;
  branchSelectionTableBody.innerHTML = "";
  if (!course.branches || course.branches.length === 0) {
    branchSelectionTableBody.innerHTML = `<tr><td style="text-align:center;">No branches available</td></tr>`;
  } else {
    course.branches.forEach(branch => {
      let tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `<td>${branch}</td>`;
      tr.addEventListener('click', () => {
        selectedBranch = branch;
        saveAndCloseModals();
      });
      branchSelectionTableBody.appendChild(tr);
    });
  }
  courseSelectionModal.style.display = "none";
  branchSelectionModal.style.display = "flex";
}

function saveAndCloseModals() {
  localStorage.setItem("teacherSelectedCourse", selectedCourseNameSpan.textContent);
  localStorage.setItem("teacherSelectedBranch", selectedBranch);
  branchSelectionModal.style.display = "none";
  updateTeacherLocationDisplay();
  addStudentModal.style.display = "none";
}

// Close modals buttons
closeCourseSelectionModalBtn.addEventListener("click", () => courseSelectionModal.style.display = "none");
closeBranchSelectionModalBtn.addEventListener("click", () => branchSelectionModal.style.display = "none");

// ------------------ Students Section ----------------------------
async function loadStudents() {
  if(!selectedCourseBranchKey){
    studentsHeading.textContent = "Please select course and branch first.";
    studentsTableBody.innerHTML = '<tr><td colspan=4 style="text-align:center;">Select course-branch to view students</td></tr>';
    return;
  }
  const res = await fetch(`${API_URL}/student/list`);
  let students = await res.json();
  
  // Filter students by courseBranchKey in backend or frontend
  students = students.filter(s => selectedCourseBranchKey === `${s.course}_${s.branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, ""));
  
  studentsHeading.textContent = `Students List - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  studentsTableBody.innerHTML = "";
  if(students.length === 0){
    studentsTableBody.innerHTML = '<tr><td colspan=4 style="text-align:center;">No students yet</td></tr>';
    return;
  }
  students.forEach((student, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.regdNo}</td>
      <td>${student.attendance || 0}%</td>
      <td><button class="remove-student-btn" onclick="removeStudent('${student._id}')">Remove</button></td>
    `;
    studentsTableBody.appendChild(tr);
  });
}

// Remove Student
async function removeStudent(id) {
  await fetch(`${API_URL}/student/remove/${id}`, { method: 'DELETE' });
  loadStudents();
}

// Add Student
addStudentBtn.addEventListener("click", () => {
  if(!selectedCourseBranchKey){
    alert("Please select course and branch first");
    return;
  }
  addStudentModal.style.display = "flex";
});

confirmAddStudentBtn.addEventListener("click", async () => {
  const name = studentNameInput.value.trim();
  const regdNo = studentRegdNoInput.value.trim();
  if(!name || !regdNo){
    alert("Please fill all fields");
    return;
  }
  if(!selectedCourseBranchKey){
    alert("Please select course and branch first");
    return;
  }

  const student = {
    name,
    regdNo,
    course: localStorage.getItem("teacherSelectedCourse"),
    branch: localStorage.getItem("teacherSelectedBranch"),
    attendance: 0,
  };

  await fetch(`${API_URL}/student/add`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(student),
  });
  addStudentModal.style.display = "none";
  studentNameInput.value = "";
  studentRegdNoInput.value = "";
  loadStudents();
});

// ------------------ Attendance Section ------------------------
function loadAttendanceTable() {
  if(!selectedCourseBranchKey){
    takeAttendanceHeading.textContent = "Please select course and branch first.";
    attendanceTableBody.innerHTML = '<tr><td colspan=4 style="text-align:center;">Select course-branch to take attendance</td></tr>';
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  takeAttendanceHeading.textContent = `Take Attendance - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  attendanceTableBody.innerHTML = "";
  if(students.length === 0){
    attendanceTableBody.innerHTML = '<tr><td colspan=4 style="text-align:center;">No students yet. Add students first.</td></tr>';
    return;
  }
  if(!attendanceDateInput.value){
    attendanceDateInput.value = new Date().toISOString().split('T')[0];
  }
  students.forEach((student) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.regdNo}</td>
      <td><input type="radio" name="status_${student.regdNo}" value="present" checked> Present</td>
      <td><input type="radio" name="status_${student.regdNo}" value="absent"> Absent</td>
    `;
    attendanceTableBody.appendChild(tr);
  });
}

saveAttendanceBtn.addEventListener("click", async () => {
  if(!selectedCourseBranchKey){
    alert("Please select course and branch first");
    return;
  }
  const date = attendanceDateInput.value;
  if(!date){
    alert("Please select a date");
    return;
  }
  
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  if(students.length === 0){
    alert("No students to take attendance");
    return;
  }

  let attendanceRecords = [];
  students.forEach((student) => {
    const statusPresent = document.querySelector(`input[name="status_${student.regdNo}"][value="present"]`).checked;
    const status = statusPresent ? "present" : "absent";
    attendanceRecords.push({ regdNo: student.regdNo, status });
  });

  // Save attendance to backend API
  const res = await fetch(`${API_URL}/attendance/mark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course: localStorage.getItem("teacherSelectedCourse"),
      branch: localStorage.getItem("teacherSelectedBranch"),
      date,
      attendanceRecords
    }),
  });

  const data = await res.json();
  if (data.success) {
    alert("Attendance saved successfully!");
    calculateMonthlyPercentage();
    loadStudents();
  } else {
    alert("Failed to save attendance.");
  }
});

// ------------------ Monthly Percentage Calculation ------------------
async function calculateMonthlyPercentage() {
  if (!selectedCourseBranchKey) return;

  // Fetch all students with attendance data for the current month (backend API can be added later)
  // For now, just load students and calculate percentages from localStorage (can be improved)
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");

  // TODO: Calculate monthly percentage from backend attendance data; placeholder logic here
  students.forEach(student => {
    // Placeholder: mark 100% attendance
    student.attendance = 100;
  });

  localStorage.setItem(`students_${selectedCourseBranchKey}`, JSON.stringify(students));
}


// ------------------ View Attendance Section ---------------------
async function loadViewAttendance() {
  if (!selectedCourseBranchKey) {
    viewAttendanceHeading.textContent = "Please select course and branch first.";
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan=3 style="text-align:center;">Select course-branch to view attendance</td></tr>';
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "Download PDF";
    return;
  }
  const date = viewAttendanceDateInput.value;
  if (!date) {
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan=3 style="text-align:center;">Select date to view records</td></tr>';
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "Download PDF";
    return;
  }
  // Fetch attendance from backend
  const res = await fetch(`${API_URL}/attendance/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course: localStorage.getItem("teacherSelectedCourse"),
      branch: localStorage.getItem("teacherSelectedBranch"),
      date
    }),
  });
  const records = await res.json();

  viewAttendanceHeading.textContent = `Attendance Records - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")}) - ${date}`;
  viewAttendanceRecordsBody.innerHTML = "";
  if (records.length === 0) {
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan=3 style="text-align:center;">No records for this date</td></tr>';
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "No Data to Download";
    return;
  }
  records.forEach(record => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.name}</td>
      <td>${record.regdNo}</td>
      <td><span class="status-${record.status}">${record.status.toUpperCase()}</span></td>
    `;
    viewAttendanceRecordsBody.appendChild(tr);
  });
  downloadPdfBtn.disabled = false;
  downloadPdfBtn.textContent = "Download PDF";
}

downloadPdfBtn.addEventListener("click", () => {
  if (viewAttendanceDateInput.value && !downloadPdfBtn.disabled) {
    downloadAttendancePDF();
  } else {
    alert("Please select a valid date with attendance records.");
  }
});

// ------------------ View Complaints Section --------------------
async function loadComplaints() {
  if (!selectedCourseBranchKey) {
    viewComplainHeading.textContent = "Please select course and branch first.";
    complaintsTableBody.innerHTML = '<tr><td colspan=6 style="text-align:center;">Select course-branch to view complaints</td></tr>';
    toggleComplaintActionsBtn.style.display = "none";
    return;
  }
  const res = await fetch(`${API_URL}/complaints/view`);
  let complaints = await res.json();
  complaints = complaints.filter(c => `${c.course}_${c.branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "") === selectedCourseBranchKey);

  viewComplainHeading.textContent = `Student Complaints - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  toggleComplaintActionsBtn.style.display = complaints.length > 0 ? "block" : "none";

  complaintsTableBody.innerHTML = "";
  if (complaints.length === 0) {
    complaintsTableBody.innerHTML = '<tr><td colspan=6 style="text-align:center;">No complaints yet</td></tr>';
    toggleComplaintActionsBtn.style.display = "none";
    return;
  }

  complaints.forEach(complaint => {
    const formattedDate = new Date(complaint.timestamp).toLocaleString();
    const photoHtml = complaint.photo 
      ? `<img src="${complaint.photo}" alt="Photo" class="complaint-photo" onclick="openPhotoModal('${complaint.photo}')" style="cursor:pointer; width:50px; height:50px; object-fit:cover; border-radius:5px;">`
      : '<span style="color:#999; font-style:italic;">No Photo</span>';
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${complaint.name}</td>
      <td>${complaint.regdNo}</td>
      <td style="max-width:200px; word-wrap:break-word;">${complaint.text}</td>
      <td style="text-align:center;">${photoHtml}</td>
      <td>${formattedDate}</td>
      <td><button class="remove-complaint-btn" onclick="removeComplaint('${complaint._id}')">Remove</button></td>
    `;
    complaintsTableBody.appendChild(tr);
  });
}

// Remove complaint
async function removeComplaint(id) {
  if(!selectedCourseBranchKey) return;
  if(!confirm("Are you sure you want to remove this complaint?")) return;
  await fetch(`${API_URL}/complaints/remove/${id}`, { method: "DELETE" });
  loadComplaints();
}

// Photo Modal functions
function openPhotoModal(photoSrc) {
  fullPhoto.src = photoSrc;
  photoModal.style.display = "flex";
}
closePhotoModalBtn.addEventListener("click", () => {
  photoModal.style.display = "none";
});

// Toggle complaint actions column
toggleComplaintActionsBtn.addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  if (complaintsTable.classList.contains("show-actions")) {
    complaintsTable.classList.remove("show-actions");
    toggleComplaintActionsBtn.textContent = "Show Remove Options";
  } else {
    complaintsTable.classList.add("show-actions");
    toggleComplaintActionsBtn.textContent = "Hide Remove Options";
  }
  loadComplaints();
});

window.addEventListener("click", (event) => {
  if (event.target === photoModal) {
    photoModal.style.display = "none";
  }
  if (event.target === addStudentModal) {
    addStudentModal.style.display = "none";
  }
  if (event.target === courseSelectionModal) {
    courseSelectionModal.style.display = "none";
  }
  if (event.target === branchSelectionModal) {
    branchSelectionModal.style.display = "none";
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  if(confirm("Are you sure you want to logout?")){
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherSelectedCourse");
    localStorage.removeItem("teacherSelectedBranch");
    window.location.href = "Login-Table.html";
  }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  hideAllSections();
  updateTeacherLocationDisplay();
  removeStudentBtn.textContent = "Show Remove Options";
  toggleComplaintActionsBtn.textContent = "Show Remove Options";
});
