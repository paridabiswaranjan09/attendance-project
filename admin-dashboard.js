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
  // New: Open course selection modal instead of directly showing section
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

// ------------------ View Attendance New Logic ------------------
let adminCourses = JSON.parse(localStorage.getItem("courses")) || [];
let adminSelectedCourse = null;
let adminSelectedBranch = null;
let adminSelectedCourseBranchKey = ""; // e.g., "BTech_CSE"

// Modal Elements for Admin View Attendance
const adminCourseSelectionModal = document.getElementById("adminCourseSelectionModal");
const adminBranchSelectionModal = document.getElementById("adminBranchSelectionModal");
const adminCourseSelectionTableBody = document.getElementById("adminCourseSelectionTableBody");
const adminBranchSelectionTableBody = document.getElementById("adminBranchSelectionTableBody");
const adminSelectedCourseNameSpan = document.getElementById("adminSelectedCourseName");
const closeAdminCourseSelectionModalBtn = document.getElementById("closeAdminCourseSelectionModal");
const closeAdminBranchSelectionModalBtn = document.getElementById("closeAdminBranchSelectionModal");

// Attendance Section Elements
const adminAttendanceDateInput = document.getElementById("adminAttendanceDate");
const adminAttendanceTableBody = document.getElementById("adminAttendanceTableBody");
const adminAttendanceHeading = document.getElementById("attendanceHeading");
const downloadAdminPdfBtn = document.getElementById("downloadAdminPdfBtn");

function openAdminCourseSelectionModal() {
  if (adminCourses.length === 0) {
    alert("No courses available. Please add courses from Course & Branches section.");
    return;
  }
  adminCourseSelectionTableBody.innerHTML = "";
  adminCourses.forEach((course) => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML = `<td>${course.name}</td>`;
    tr.addEventListener("click", () => {
      adminSelectedCourse = course;
      openAdminBranchSelectionModal(course);
    });
    adminCourseSelectionTableBody.appendChild(tr);
  });
  adminCourseSelectionModal.style.display = "flex";
}

function openAdminBranchSelectionModal(course) {
  adminSelectedCourseNameSpan.textContent = course.name;
  adminBranchSelectionTableBody.innerHTML = "";
  if (!course.branches || course.branches.length === 0) {
    adminBranchSelectionTableBody.innerHTML = `<tr><td style="text-align:center;">No branches available</td></tr>`;
  } else {
    course.branches.forEach((branch) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `<td>${branch}</td>`;
      tr.addEventListener("click", () => {
        adminSelectedBranch = branch;
        saveAdminSelectionAndLoadAttendance();
      });
      adminBranchSelectionTableBody.appendChild(tr);
    });
  }
  adminCourseSelectionModal.style.display = "none";
  adminBranchSelectionModal.style.display = "flex";
}

function saveAdminSelectionAndLoadAttendance() {
  if (adminSelectedCourse && adminSelectedBranch) {
    const course = adminSelectedCourse.name;
    const branch = adminSelectedBranch;
    adminSelectedCourseBranchKey = `${course}_${branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    localStorage.setItem("adminSelectedCourse", course); // Optional: Save for persistence
    localStorage.setItem("adminSelectedBranch", branch);
    adminBranchSelectionModal.style.display = "none";
    // Show attendance section and load data
    hideAllSections();
    attendanceSection.style.display = "block";
    adminAttendanceHeading.textContent = `Attendance Records - ${course} (${branch})`;
    // Set default date to today
    if (!adminAttendanceDateInput.value) {
      adminAttendanceDateInput.value = new Date().toISOString().split('T')[0];
    }
    loadAdminAttendanceTable();
  }
}

// Close modals
closeAdminCourseSelectionModalBtn.addEventListener("click", () => adminCourseSelectionModal.style.display = "none");
closeAdminBranchSelectionModalBtn.addEventListener("click", () => adminBranchSelectionModal.style.display = "none");

// Load Attendance Table for Selected Date
function loadAdminAttendanceTable() {
  if (!adminSelectedCourseBranchKey) {
    adminAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Please select course and branch first</td></tr>';
    downloadAdminPdfBtn.disabled = true;
    downloadAdminPdfBtn.textContent = "Download PDF";
    return;
  }
  const date = adminAttendanceDateInput.value;
  if (!date) {
    adminAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Select a date to view records</td></tr>';
    downloadAdminPdfBtn.disabled = true;
    downloadAdminPdfBtn.textContent = "Download PDF";
    return;
  }

  // Load students for this course-branch
  let students = JSON.parse(localStorage.getItem(`students_${adminSelectedCourseBranchKey}`) || "[]");
  if (students.length === 0) {
    adminAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students enrolled in this course-branch. Add students from Teacher Dashboard.</td></tr>';
    downloadAdminPdfBtn.disabled = true;
    downloadAdminPdfBtn.textContent = "No Data to Download";
    return;
  }

  // Load attendance records for this date
  const records = JSON.parse(localStorage.getItem(`attendance_${adminSelectedCourseBranchKey}_${date}`) || "[]");
  if (records.length === 0) {
    adminAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No attendance records for this date</td></tr>';
    downloadAdminPdfBtn.disabled = true;
    downloadAdminPdfBtn.textContent = "No Data to Download";
    return;
  }

  // Calculate monthly percentages for all students (like in Teacher JS)
  calculateAdminMonthlyPercentage(students);

  // Match records with students and display
  adminAttendanceTableBody.innerHTML = "";
  students.forEach((student) => {
    // Find matching record for this date
    const record = records.find(r => r.regdNo === student.regdNo);
    const status = record ? record.status : "absent"; // Default to absent if no record
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.regdNo}</td>
      <td><span class="status-${status}">${status.toUpperCase()}</span></td>
      <td>${student.attendance || 0}%</td>
    `;
    adminAttendanceTableBody.appendChild(tr);
  });

  // Enable PDF download if records exist
  downloadAdminPdfBtn.disabled = false;
  downloadAdminPdfBtn.textContent = "Download PDF";
}

// Calculate Monthly Percentage for Students (Similar to Teacher's Function)
function calculateAdminMonthlyPercentage(students) {
  if (!adminSelectedCourseBranchKey) return;
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  let attendanceData = {};

  // Collect all attendance dates in current month for this course/branch
  for (let i = 1; i <= 31; i++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const records = JSON.parse(localStorage.getItem(`attendance_${adminSelectedCourseBranchKey}_${dateStr}`) || "[]");
    if (records.length > 0) {
      records.forEach(record => {
        if (!attendanceData[record.regdNo]) attendanceData[record.regdNo] = { present: 0, total: 0 };
        attendanceData[record.regdNo].total++;
        if (record.status === "present") attendanceData[record.regdNo].present++;
      });
    }
  }

  // Update students attendance percentage
  students.forEach(student => {
    const data = attendanceData[student.regdNo];
    if (data && data.total > 0) {
      student.attendance = Math.round((data.present / data.total) * 100);
    } else {
      student.attendance = 0;
    }
  });
  // Note: We don't save back to localStorage here (read-only for admin), just use for display
}

// PDF Download Function for Admin
function downloadAdminAttendancePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = adminAttendanceDateInput.value;
  const course = localStorage.getItem("adminSelectedCourse") || "";
  const branch = localStorage.getItem("adminSelectedBranch") || "";
  const students = JSON.parse(localStorage.getItem(`students_${adminSelectedCourseBranchKey}`) || "[]");
  const records = JSON.parse(localStorage.getItem(`attendance_${adminSelectedCourseBranchKey}_${date}`) || "[]");

  // Calculate percentages for PDF
  calculateAdminMonthlyPercentage(students);

  // Header
  doc.setFontSize(20);
  doc.text(`Admin Attendance Report`, 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${course} - ${branch}`, 105, 35, { align: 'center' });
  doc.text(`Date: ${date}`, 105, 45, { align: 'center' });

  // Table Headers
  let yPos = 60;
  doc.setFontSize(10);
  doc.text('Student Name', 15, yPos);
  doc.text('Regd No.', 60, yPos);
  doc.text('Status', 100, yPos);
  doc.text('Percentage (%)', 140, yPos);

  // Draw header line
  doc.setLineWidth(0.5);
  doc.line(10, yPos + 2, 200, yPos + 2);

  // Table Rows
  yPos += 10;
  students.forEach((student) => {
    if (yPos > 270) { // New page if content exceeds
      doc.addPage();
      yPos = 20;
    }
    
    // Find status for this date
    const record = records.find(r => r.regdNo === student.regdNo);
    const status = record ? record.status : 'absent';
    const statusText = status.toUpperCase();
    const statusColor = status === 'present' ? [0, 128, 0] : [255, 0, 0]; // Green for present, red for absent
    
    // Student data
    doc.text(student.name.substring(0, 20), 15, yPos); // Truncate long names
    doc.text(student.regdNo, 60, yPos);
    doc.setTextColor(...statusColor);
    doc.text(statusText, 100, yPos);
    doc.setTextColor(0, 0, 0); // Reset color
    doc.text(`${student.attendance || 0}%`, 140, yPos);

    yPos += 8;
  });

  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
  doc.text(`Total Students: ${students.length}`, 105, yPos + 5, { align: 'center' });

  // Save PDF
  const filename = `admin_attendance_${course.replace(/ /g, '_')}_${branch.replace(/ /g, '_')}_${date}.pdf`;
  doc.save(filename);
}

// Event Listeners for Admin Attendance
adminAttendanceDateInput.addEventListener("change", loadAdminAttendanceTable);
downloadAdminPdfBtn.addEventListener("click", () => {
  if (adminAttendanceDateInput.value && !downloadAdminPdfBtn.disabled) {
    downloadAdminAttendancePDF();
  } else {
    alert("Please select a valid date with attendance records.");
  }
});

// Close modals on outside click (for new modals)
window.addEventListener("click", (event) => {
  if (event.target === adminCourseSelectionModal) {
    adminCourseSelectionModal.style.display = "none";
  }
  if (event.target === adminBranchSelectionModal) {
    adminBranchSelectionModal.style.display = "none";
  }
});

// ------------------ Teacher Section (Fixed Syntax) ------------------
let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
const teacherTableBody = document.getElementById("teacherTableBody");
let teacherActionVisible = false; // Action column hidden initially

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
      <td>${t.id}</td>
      <td>${t.profession}</td>
      <td style="display:${teacherActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeTeacher(${i})">Remove</button>
      </td>
    `;
    teacherTableBody.appendChild(row);
  });
}
renderTeachers();

document.getElementById("addTeacherBtn").addEventListener("click", () => {
  document.getElementById("addTeacherModal").style.display = "block";
});

document.getElementById("confirmAddBtn").addEventListener("click", () => {
  const name = document.getElementById("tName").value.trim();
  const id = document.getElementById("tId").value.trim();
  const profession = document.getElementById("tProfession").value.trim();
  if (!name || !id || !profession) { 
    alert("Fill all fields"); 
    return; 
  }

  teachers.push({ name, id, profession });
  localStorage.setItem("teachers", JSON.stringify(teachers));
  renderTeachers();
  document.getElementById("addTeacherModal").style.display = "none";
  document.getElementById("tName").value = "";
  document.getElementById("tId").value = "";
  document.getElementById("tProfession").value = "";
});

function removeTeacher(index) {
  teachers.splice(index, 1);
  localStorage.setItem("teachers", JSON.stringify(teachers));
  renderTeachers();
}

document.getElementById("removeTeacherBtn").addEventListener("click", () => {
  teacherActionVisible = !teacherActionVisible;
  renderTeachers();
});

// Close Add Teacher Modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("addTeacherModal").style.display = "none";
});

// ------------------ Course Section (Fixed Syntax) ------------------
const courseTableBody = document.getElementById("courseTableBody");
let courseActionVisible = false; // hide action column initially
let currentCourseIndex = null;

function renderCourses() {
  const actionCol = document.querySelector("#courseSection th:last-child");
  actionCol.style.display = courseActionVisible ? "table-cell" : "none";

  courseTableBody.innerHTML = "";
  if (!adminCourses.length) {
    courseTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No courses added</td></tr>';
    return;
  }
  adminCourses.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td onclick="openBranchTable(${i})" style="cursor:pointer;">${c.name}</td>
      <td style="display:${courseActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeCourse(${i})">Remove</button>
      </td>
    `;
    courseTableBody.appendChild(row);
  });
}
renderCourses();

document.getElementById("addCourseBtn").addEventListener("click", () => {
  document.getElementById("addCourseModal").style.display = "block";
});

document.getElementById("confirmAddCourseBtn").addEventListener("click", () => {
  const name = document.getElementById("courseNameInput").value.trim();
  if (!name) { 
    alert("Enter course name"); 
    return; 
  }
  adminCourses.push({ name, branches: [] });
  localStorage.setItem("courses", JSON.stringify(adminCourses));
  renderCourses();
  document.getElementById("addCourseModal").style.display = "none";
  document.getElementById("courseNameInput").value = "";
});

function removeCourse(i) {
  adminCourses.splice(i, 1);
  localStorage.setItem("courses", JSON.stringify(adminCourses));
  renderCourses();
}

document.getElementById("removeCourseBtn").addEventListener("click", () => {
  courseActionVisible = !courseActionVisible;
  renderCourses();
});

// Close Add Course Modal
document.getElementById("closeCourseModal").addEventListener("click", () => {
  document.getElementById("addCourseModal").style.display = "none";
});

// ------------------ Branch Section (Fixed Syntax) ------------------
const branchFloatTableBody = document.getElementById("branchFloatTableBody");
let branchActionVisible = false; // hide action initially

function openBranchTable(i) {
  currentCourseIndex = i;
  document.getElementById("branchModalCourseName").textContent = adminCourses[i].name;
  renderBranches();
  document.getElementById("branchTableModal").style.display = "block";
}

function renderBranches() {
  const actionColHeading = document.getElementById("branchFloatActionCol");
  actionColHeading.style.display = branchActionVisible ? "table-cell" : "none";

  branchFloatTableBody.innerHTML = "";
  const branches = adminCourses[currentCourseIndex].branches;
  if (!branches.length) {
    branchFloatTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No branches added</td></tr>';
    return;
  }
  branches.forEach((b, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${b}</td>
      <td style="display:${branchActionVisible ? "table-cell" : "none"};">
        <button class="remove-btn" onclick="removeBranch(${i})">Remove</button>
      </td>
    `;
    branchFloatTableBody.appendChild(row);
  });
}

document.getElementById("addBranchTableBtn").addEventListener("click", () => {
  document.getElementById("addBranchFloatModal").style.display = "block";
});

document.getElementById("confirmAddBranchFloatBtn").addEventListener("click", () => {
  const name = document.getElementById("branchFloatNameInput").value.trim();
  if (!name) { 
    alert("Enter branch name"); 
    return; 
  }
  adminCourses[currentCourseIndex].branches.push(name);
  localStorage.setItem("courses", JSON.stringify(adminCourses));
  renderBranches();
  document.getElementById("addBranchFloatModal").style.display = "none";
  document.getElementById("branchFloatNameInput").value = "";
});

function removeBranch(i) {
  adminCourses[currentCourseIndex].branches.splice(i, 1);
  localStorage.setItem("courses", JSON.stringify(adminCourses));
  renderBranches();
}

document.getElementById("removeBranchTableBtn").addEventListener("click", () => {
  branchActionVisible = !branchActionVisible;
  renderBranches();
});

// Close Branch Table Modal
document.getElementById("closeBranchTableModal").addEventListener("click", () => {
  document.getElementById("branchTableModal").style.display = "none";
});

// Close Add Branch Float Modal
document.getElementById("closeBranchFloatAddModal").addEventListener("click", () => {
  document.getElementById("addBranchFloatModal").style.display = "none";
});

// ------------------ Change Password Section ------------------
// Get stored password from localStorage (set at login)
let storedPassword = localStorage.getItem("adminPassword") || "admin123";

document.getElementById("savePasswordBtn").addEventListener("click", () => {
  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("confirmPassword").value;
  const message = document.getElementById("passwordMessage");

  if (oldPass !== storedPassword) {
    message.style.color = "red";
    message.textContent = "Old password is incorrect.";
    return;
  }
  if (newPass.length < 6) {
    message.style.color = "red";
    message.textContent = "New password should be at least 6 characters.";
    return;
  }
  if (newPass !== confirmPass) {
    message.style.color = "red";
    message.textContent = "New password and confirm password do not match.";
    return;
  }

  // Save new password as updated admin password
  localStorage.setItem("adminPassword", newPass);
  storedPassword = newPass;
  message.style.color = "green";
  message.textContent = "Password changed successfully!";

  // Clear inputs after success
  document.getElementById("oldPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  // Close modal after short delay
  setTimeout(() => {
    document.getElementById("changePasswordModal").style.display = "none";
    message.textContent = "";
  }, 1500);
});

// Close Change Password Modal
document.getElementById("closeChangePassword").addEventListener("click", () => {
  document.getElementById("changePasswordModal").style.display = "none";
  document.getElementById("passwordMessage").textContent = "";
});

// ------------------ Close Modals on Outside Click (All Modals) ------------------
window.addEventListener("click", (event) => {
  // Existing modals
  const modals = [
    document.getElementById("addTeacherModal"),
    document.getElementById("addCourseModal"),
    document.getElementById("branchTableModal"),
    document.getElementById("addBranchFloatModal"),
    document.getElementById("changePasswordModal")
  ];
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // New attendance modals
  if (event.target === adminCourseSelectionModal) {
    adminCourseSelectionModal.style.display = "none";
  }
  if (event.target === adminBranchSelectionModal) {
    adminBranchSelectionModal.style.display = "none";
  }
});

// ------------------ On Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
  // Load courses for consistency
  adminCourses = JSON.parse(localStorage.getItem("courses")) || [];
  renderCourses();
  renderTeachers();
  
  // Set default date for attendance if needed
  if (adminAttendanceDateInput) {
    adminAttendanceDateInput.value = new Date().toISOString().split('T')[0];
  }
  
  // Disable PDF button initially
  if (downloadAdminPdfBtn) {
    downloadAdminPdfBtn.disabled = true;
  }
});
