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
const studentsTable = document.getElementById("studentsTable"); // For toggle class

// ------------------ Take Attendance Elements ------------------
const attendanceDateInput = document.getElementById("attendanceDate");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
const takeAttendanceHeading = document.getElementById("takeAttendanceHeading");

// ------------------ View Attendance Elements ------------------
const viewAttendanceDateInput = document.getElementById("viewAttendanceDate");
const viewAttendanceRecordsBody = document.getElementById("viewAttendanceRecordsBody");
const viewAttendanceHeading = document.getElementById("viewAttendanceHeading");
const downloadPdfBtn = document.getElementById("downloadPdfBtn"); // New PDF button

// ------------------ View Complain Elements ------------------
const viewComplainHeading = document.getElementById("viewComplainHeading");
const complaintsTableBody = document.getElementById("complaintsTableBody");
const toggleComplaintActionsBtn = document.getElementById("toggleComplaintActions"); // Toggle button
const complaintsTable = document.getElementById("complaintsTable"); // For toggle class

// ------------------ Photo Modal Elements ------------------
const photoModal = document.getElementById("photoModal");
const fullPhoto = document.getElementById("fullPhoto");
const closePhotoModalBtn = document.getElementById("closePhotoModal");

// ------------------ Load courses from localStorage ------------------
let courses = JSON.parse(localStorage.getItem("courses")) || [];
let selectedCourse = null;
let selectedBranch = null;
let selectedCourseBranchKey = ""; // e.g., "BTech_CSE"

// ------------------ Update teacher name and course-branch display ------------------
function updateTeacherLocationDisplay() {
  const course = localStorage.getItem("teacherSelectedCourse") || "No course selected";
  const branch = localStorage.getItem("teacherSelectedBranch") || "No branch selected";
  selectedCourseBranchKey = `${course}_${branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, ""); // Safe key for localStorage

  teacherNameDisplay.textContent = teacherName;
  teacherCourseBranch.textContent = `${course} - ${branch}`;
  teacherCourseBranch.title = selectedCourseBranchKey ? "Click to change course/branch" : "Select course/branch first";

  mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, you are in ${course} - ${branch}`;
  hideAllSections();
}
updateTeacherLocationDisplay();

// ------------------ Hide all main sections ------------------
function hideAllSections() {
  studentsSection.style.display = "none";
  takeAttendanceSection.style.display = "none";
  viewAttendanceSection.style.display = "none";
  viewComplainSection.style.display = "none";
}

// ------------------ Course/Branch Selection Logic ------------------
function openCourseSelectionModal() {
  if (courses.length === 0) {
    alert("No courses available. Please add courses from Admin Dashboard.");
    return;
  }
  courseSelectionTableBody.innerHTML = "";
  courses.forEach((course) => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML = `<td>${course.name}</td>`;
    tr.addEventListener("click", () => {
      selectedCourse = course;
      openBranchSelectionModal(course);
    });
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
    course.branches.forEach((branch) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `<td>${branch}</td>`;
      tr.addEventListener("click", () => {
        selectedBranch = branch;
        saveSelectionAndCloseModals();
      });
      branchSelectionTableBody.appendChild(tr);
    });
  }
  courseSelectionModal.style.display = "none";
  branchSelectionModal.style.display = "flex";
}

function saveSelectionAndCloseModals() {
  if (selectedCourse && selectedBranch) {
    localStorage.setItem("teacherSelectedCourse", selectedCourse.name);
    localStorage.setItem("teacherSelectedBranch", selectedBranch);
    branchSelectionModal.style.display = "none";
    // Update display and key immediately
    updateTeacherLocationDisplay();
    // Close any open modals
    addStudentModal.style.display = "none";
  }
}

closeCourseSelectionModalBtn.addEventListener("click", () => courseSelectionModal.style.display = "none");
closeBranchSelectionModalBtn.addEventListener("click", () => branchSelectionModal.style.display = "none");

// ------------------ Make Profile Course-Branch Clickable ------------------
teacherCourseBranch.addEventListener("click", () => {
  if (selectedCourseBranchKey) {
    // If already selected, confirm change
    if (confirm("Change course/branch? Current data will switch.")) {
      openCourseSelectionModal();
    }
  } else {
    openCourseSelectionModal();
  }
});

// ------------------ Students Section Logic ------------------
function loadStudents() {
  if (!selectedCourseBranchKey) {
    studentsHeading.textContent = "Please select course and branch first.";
    studentsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Select course-branch to view students</td></tr>'; // colspan=3 since action hidden
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  studentsHeading.textContent = `Students List - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  studentsTableBody.innerHTML = "";
  if (students.length === 0) {
    studentsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No students yet</td></tr>'; // colspan=3
    return;
  }
  students.forEach((student, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.regdNo}</td>
      <td>${student.attendance || 0}%</td>
      <td class="action-col"><button class="remove-student-btn" onclick="removeStudent(${index})">Remove</button></td>
    `;
    studentsTableBody.appendChild(tr);
  });
  // Maintain toggle state after reload
  if (studentsTable.classList.contains("show-actions")) {
    studentsTable.classList.add("show-actions");
  }
}

function addStudent() {
  const name = studentNameInput.value.trim();
  const regdNo = studentRegdNoInput.value.trim();
  if (!name || !regdNo) {
    alert("Please fill all fields");
    return;
  }
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  // Check if student already exists
  if (students.some(s => s.regdNo === regdNo)) {
    alert("Student with this Regd No. already exists");
    return;
  }
  students.push({ name, regdNo, attendance: 0 });
  localStorage.setItem(`students_${selectedCourseBranchKey}`, JSON.stringify(students));
  loadStudents();
  addStudentModal.style.display = "none";
  studentNameInput.value = "";
  studentRegdNoInput.value = "";
}

function removeStudent(index) {
  if (!selectedCourseBranchKey) return;
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  students.splice(index, 1);
  localStorage.setItem(`students_${selectedCourseBranchKey}`, JSON.stringify(students));
  loadStudents();
}

// Event listeners for students
document.getElementById("studentsBtn").addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course and branch first.`;
  } else {
    hideAllSections();
    studentsSection.style.display = "block";
    loadStudents(); // Loads data for current course/branch
  }
});

addStudentBtn.addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  addStudentModal.style.display = "flex";
});

// Toggle Action Column on Remove Student Button Click
removeStudentBtn.addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  if (studentsTable.classList.contains("show-actions")) {
    // Hide actions
    studentsTable.classList.remove("show-actions");
    removeStudentBtn.textContent = "Show Remove Options";
  } else {
    // Show actions
    studentsTable.classList.add("show-actions");
    removeStudentBtn.textContent = "Hide Remove Options";
  }
  loadStudents(); // Reload to apply toggle
});

confirmAddStudentBtn.addEventListener("click", addStudent);
closeAddStudentModalBtn.addEventListener("click", () => addStudentModal.style.display = "none");

// ------------------ Take Attendance Logic ------------------
function loadAttendanceTable() {
  if (!selectedCourseBranchKey) {
    takeAttendanceHeading.textContent = "Please select course and branch first.";
    attendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Select course-branch to take attendance</td></tr>';
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  takeAttendanceHeading.textContent = `Take Attendance - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  attendanceTableBody.innerHTML = "";
  if (students.length === 0) {
    attendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students yet. Add students first.</td></tr>';
    return;
  }
  // Set default date to today
  if (!attendanceDateInput.value) {
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

function saveAttendance() {
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  const date = attendanceDateInput.value;
  if (!date) {
    alert("Please select a date");
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  if (students.length === 0) {
    alert("No students to take attendance");
    return;
  }
  let attendanceRecords = [];
  students.forEach((student) => {
    const presentRadio = document.querySelector(`input[name="status_${student.regdNo}"][value="present"]`);
    const status = presentRadio ? (presentRadio.checked ? "present" : "absent") : "absent";
    attendanceRecords.push({ name: student.name, regdNo: student.regdNo, status });
  });
  // Save attendance for this date and course/branch
  localStorage.setItem(`attendance_${selectedCourseBranchKey}_${date}`, JSON.stringify(attendanceRecords));
  // Calculate and update percentages for the current month
  calculateMonthlyPercentage();
  alert("Attendance saved successfully!");
  loadStudents(); // Refresh students table with updated percentages (for current course/branch)
}

function calculateMonthlyPercentage() {
  if (!selectedCourseBranchKey) return;
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchKey}`) || "[]");
  let attendanceData = {};

  // Collect all attendance dates in current month for this course/branch
  for (let i = 1; i <= 31; i++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchKey}_${dateStr}`) || "[]");
    if (records.length > 0) {
      records.forEach(record => {
        if (!attendanceData[record.regdNo]) attendanceData[record.regdNo] = { present: 0, total: 0 };
        attendanceData[record.regdNo].total++;
        if (record.status === "present") attendanceData[record.regdNo].present++;
      });
    }
  }

  // Update students attendance percentage for this course/branch
  students.forEach(student => {
    const data = attendanceData[student.regdNo];
    if (data && data.total > 0) {
      student.attendance = Math.round((data.present / data.total) * 100);
    } else {
      student.attendance = 0;
    }
  });
  localStorage.setItem(`students_${selectedCourseBranchKey}`, JSON.stringify(students));
}

// Event listeners for take attendance
document.getElementById("takeAttendanceBtn").addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course and branch first.`;
  } else {
    hideAllSections();
    takeAttendanceSection.style.display = "block";
    loadAttendanceTable(); // Loads data for current course/branch
    // Reload on date change
    const handleDateChange = () => loadAttendanceTable();
    attendanceDateInput.removeEventListener("change", handleDateChange); // Prevent duplicates
    attendanceDateInput.addEventListener("change", handleDateChange);
  }
});

saveAttendanceBtn.addEventListener("click", saveAttendance);

// ------------------ View Attendance Logic ------------------
function loadViewAttendance() {
  if (!selectedCourseBranchKey) {
    viewAttendanceHeading.textContent = "Please select course and branch first.";
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Select course-branch to view attendance</td></tr>';
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "Download PDF";
    return;
  }
  const date = viewAttendanceDateInput.value;
  if (!date) {
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Select date to view records</td></tr>';
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "Download PDF";
    return;
  }
  const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchKey}_${date}`) || "[]");
  viewAttendanceHeading.textContent = `Attendance Records - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")}) - ${date}`;
  viewAttendanceRecordsBody.innerHTML = "";
  if (records.length === 0) {
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No records for this date</td></tr>';
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
// Enable PDF download if records exist
downloadPdfBtn.disabled = false;
downloadPdfBtn.textContent = "Download PDF";
}

// PDF Download Function
function downloadAttendancePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = viewAttendanceDateInput.value;
  const course = localStorage.getItem("teacherSelectedCourse") || "";
  const branch = localStorage.getItem("teacherSelectedBranch") || "";
  const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchKey}_${date}`) || "[]");

  // Header
  doc.setFontSize(20);
  doc.text("Attendance Report", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${course} - ${branch}`, 105, 35, { align: 'center' });
  doc.text(`Date: ${date}`, 105, 45, { align: 'center' });

  // Table Headers
  let yPos = 60;
  doc.setFontSize(10);
  doc.text('Student Name', 20, yPos);
  doc.text('Regd No.', 80, yPos);
  doc.text('Status', 140, yPos);

  // Draw header line
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 2, 195, yPos + 2);

  // Table Rows
  yPos += 10;
  records.forEach((record) => {
    if (yPos > 270) { // New page if content exceeds
      doc.addPage();
      yPos = 20;
    }
    
    // Student data
    doc.text(record.name.substring(0, 25), 20, yPos); // Truncate long names
    doc.text(record.regdNo, 80, yPos);
    const statusText = record.status.toUpperCase();
    const statusColor = record.status === 'present' ? [0, 128, 0] : [255, 0, 0]; // Green for present, red for absent
    doc.setTextColor(...statusColor);
    doc.text(statusText, 140, yPos);
    doc.setTextColor(0, 0, 0); // Reset color

    yPos += 8;
  });

  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
  doc.text(`Total Students: ${records.length}`, 105, yPos + 5, { align: 'center' });

  // Save PDF
  const filename = `attendance_${course.replace(/ /g, '_')}_${branch.replace(/ /g, '_')}_${date}.pdf`;
  doc.save(filename);
}

// Event listeners for view attendance
document.getElementById("viewAttendanceBtn").addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course and branch first.`;
  } else {
    hideAllSections();
    viewAttendanceSection.style.display = "block";
    // Set default date to today
    if (!viewAttendanceDateInput.value) {
      viewAttendanceDateInput.value = new Date().toISOString().split('T')[0];
    }
    loadViewAttendance();
    // Reload on date change
    const handleViewDateChange = () => loadViewAttendance();
    viewAttendanceDateInput.removeEventListener("change", handleViewDateChange); // Prevent duplicates
    viewAttendanceDateInput.addEventListener("change", handleViewDateChange);
  }
});

downloadPdfBtn.addEventListener("click", () => {
  if (viewAttendanceDateInput.value && !downloadPdfBtn.disabled) {
    downloadAttendancePDF();
  } else {
    alert("Please select a valid date with attendance records.");
  }
});

// ------------------ View Complain Logic ------------------
function loadComplaints() {
  if (!selectedCourseBranchKey) {
    viewComplainHeading.textContent = "Please select course and branch first.";
    complaintsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Select course-branch to view complaints</td></tr>'; // colspan=6 (including action)
    toggleComplaintActionsBtn.style.display = "none"; // Hide toggle if no data
    return;
  }

  let complaints = JSON.parse(localStorage.getItem(`complaints_${selectedCourseBranchKey}`) || "[]");
  viewComplainHeading.textContent = `Student Complaints - ${localStorage.getItem("teacherSelectedCourse")} (${localStorage.getItem("teacherSelectedBranch")})`;
  toggleComplaintActionsBtn.style.display = "block"; // Show toggle if data available

  // Sort by timestamp (newest first)
  complaints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  complaintsTableBody.innerHTML = "";
  if (complaints.length === 0) {
    complaintsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No complaints yet</td></tr>'; // colspan=6
    toggleComplaintActionsBtn.style.display = "none"; // Hide toggle if empty
    return;
  }

  complaints.forEach((complaint) => {
    const formattedDate = new Date(complaint.timestamp).toLocaleString(); // Readable date/time
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
      <td class="action-col"><button class="remove-complaint-btn" onclick="removeComplaint('${complaint.timestamp}')">Remove</button></td>
    `;
    complaintsTableBody.appendChild(tr);
  });

  // Maintain toggle state after reload
  if (complaintsTable.classList.contains("show-actions")) {
    complaintsTable.classList.add("show-actions");
    toggleComplaintActionsBtn.textContent = "Hide Remove Options";
  } else {
    toggleComplaintActionsBtn.textContent = "Show Remove Options";
  }
}

// NEW: Remove Complaint Function
function removeComplaint(timestamp) {
  if (!selectedCourseBranchKey) return;
  if (!confirm("Are you sure you want to remove this complaint?")) return;

  let complaints = JSON.parse(localStorage.getItem(`complaints_${selectedCourseBranchKey}`) || "[]");
  // Find and remove the complaint by timestamp (unique ID)
  complaints = complaints.filter(complaint => complaint.timestamp !== timestamp);
  localStorage.setItem(`complaints_${selectedCourseBranchKey}`, JSON.stringify(complaints));
  alert("Complaint removed successfully!");
  loadComplaints(); // Reload table
}

// NEW: Open Photo Modal
function openPhotoModal(photoSrc) {
  fullPhoto.src = photoSrc;
  photoModal.style.display = "flex";
}

// Photo Modal Close
closePhotoModalBtn.addEventListener("click", () => {
  photoModal.style.display = "none";
});

// Toggle Action Column for Complaints
toggleComplaintActionsBtn.addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    alert("Please select course and branch first");
    return;
  }
  if (complaintsTable.classList.contains("show-actions")) {
    // Hide actions
    complaintsTable.classList.remove("show-actions");
    toggleComplaintActionsBtn.textContent = "Show Remove Options";
  } else {
    // Show actions
    complaintsTable.classList.add("show-actions");
    toggleComplaintActionsBtn.textContent = "Hide Remove Options";
  }
  loadComplaints(); // Reload to apply toggle
});

// Close photo modal on outside click
window.addEventListener("click", (event) => {
  if (event.target === photoModal) {
    photoModal.style.display = "none";
  }
  // Existing modal closes...
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

// Event listener for view complain
document.getElementById("viewComplainBtn").addEventListener("click", () => {
  if (!selectedCourseBranchKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course and branch first.`;
  } else {
    hideAllSections();
    viewComplainSection.style.display = "block";
    loadComplaints(); // Load complaints for current course/branch
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, viewing complaints.`;
  }
});

// ------------------ Logout ------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherSelectedCourse");
    localStorage.removeItem("teacherSelectedBranch");
    window.location.href = "Login-Table.html";
  }
});

// ------------------ On page load ------------------
document.addEventListener("DOMContentLoaded", () => {
  hideAllSections();
  mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course and branch.`;
  // Initialize selectedCourseBranchKey on load
  updateTeacherLocationDisplay();
  // Set initial button text for remove toggle
  removeStudentBtn.textContent = "Show Remove Options";
  toggleComplaintActionsBtn.textContent = "Show Remove Options"; // NEW: For complaints
});
