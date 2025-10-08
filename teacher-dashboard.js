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

// ------------------ Modal Elements (Course/Branch/Year) ------------------
const courseSelectionModal = document.getElementById("courseSelectionModal");
const branchSelectionModal = document.getElementById("branchSelectionModal");
const yearSelectionModal = document.getElementById("yearSelectionModal");
const courseSelectionTableBody = document.getElementById("courseSelectionTableBody");
const branchSelectionTableBody = document.getElementById("branchSelectionTableBody");
const yearSelectionTableBody = document.getElementById("yearSelectionTableBody");
const selectedCourseNameSpan = document.getElementById("selectedCourseName");
const selectedCourseAndBranchSpan = document.getElementById("selectedCourseAndBranch");
const closeCourseSelectionModalBtn = document.getElementById("closeCourseSelectionModal");
const closeBranchSelectionModalBtn = document.getElementById("closeBranchSelectionModal");
const closeYearSelectionModalBtn = document.getElementById("closeYearSelectionModal");

// ------------------ Add Student Modal Elements ------------------
const addStudentModal = document.getElementById("addStudentModal");
const closeAddStudentModalBtn = document.getElementById("closeAddStudentModal");
const confirmAddStudentBtn = document.getElementById("confirmAddStudentBtn");
const studentNameInput = document.getElementById("studentNameInput");
const studentRegdNoInput = document.getElementById("studentRegdNoInput");
const studentAgeInput = document.getElementById("studentAgeInput"); // Now exists in HTML

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

// ------------------ Load courses from localStorage ------------------
let courses = JSON.parse(localStorage.getItem("courses")) || [];
let selectedCourse = null;
let selectedBranch = null;
let selectedYear = null; // New: Selected year
let selectedCourseBranchYearKey = ""; // e.g., "BTech_CSE_1st_year" (updated to include year)

// ------------------ Update teacher name and course-branch-year display ------------------
function updateTeacherLocationDisplay() {
  const course = localStorage.getItem("teacherSelectedCourse") || "No course selected";
  const branch = localStorage.getItem("teacherSelectedBranch") || "No branch selected";
  const year = localStorage.getItem("teacherSelectedYear") || "No year selected";
  selectedCourseBranchYearKey = `${course}_${branch}_${year}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, ""); // Safe key for localStorage (now includes year)

  teacherNameDisplay.textContent = teacherName;
  teacherCourseBranch.textContent = `${course} - ${branch} - ${year}`;
  teacherCourseBranch.title = selectedCourseBranchYearKey ? "Click to change course/branch/year" : "Select course/branch/year first";

  mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, you are in ${course} - ${branch} - ${year}`;
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

// ------------------ Course/Branch/Year Selection Logic ------------------
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
        openYearSelectionModal(course, branch); // Updated: Open year modal after branch
      });
      branchSelectionTableBody.appendChild(tr);
    });
  }
  courseSelectionModal.style.display = "none";
  branchSelectionModal.style.display = "flex";
}

// New: Open Year Selection Modal
function openYearSelectionModal(course, branch) {
  selectedCourseAndBranchSpan.textContent = `${course.name} - ${branch}`;
  yearSelectionTableBody.innerHTML = "";
  let years = [];
  // Determine years based on course name
  const courseNameLower = course.name.toLowerCase();
  if (courseNameLower.includes("btech")) {
    years = ["1st year", "2nd year", "3rd year", "4th year"];
  } else if (courseNameLower.includes("diploma") || courseNameLower.includes("mca")) {
    years = ["1st year", "2nd year", "3rd year"];
  } else {
    // Default for other courses
    years = ["1st year"];
  }
  if (years.length === 0) {
    yearSelectionTableBody.innerHTML = `<tr><td style="text-align:center;">No years available</td></tr>`;
  } else {
    years.forEach((year) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `<td>${year}</td>`;
      tr.addEventListener("click", () => {
        selectedYear = year;
        saveSelectionAndCloseModals(); // Save after year selection
      });
      yearSelectionTableBody.appendChild(tr);
    });
  }
  branchSelectionModal.style.display = "none";
  yearSelectionModal.style.display = "flex";
}

function saveSelectionAndCloseModals() {
  if (selectedCourse && selectedBranch && selectedYear) {
    localStorage.setItem("teacherSelectedCourse", selectedCourse.name);
    localStorage.setItem("teacherSelectedBranch", selectedBranch);
    localStorage.setItem("teacherSelectedYear", selectedYear); // New: Save year
    yearSelectionModal.style.display = "none"; // Close year modal
    // Update display and key immediately
    updateTeacherLocationDisplay();
    // Close any open modals
    addStudentModal.style.display = "none";
  }
}

closeCourseSelectionModalBtn.addEventListener("click", () => courseSelectionModal.style.display = "none");
closeBranchSelectionModalBtn.addEventListener("click", () => branchSelectionModal.style.display = "none");
closeYearSelectionModalBtn.addEventListener("click", () => yearSelectionModal.style.display = "none"); // New: Year close

// ------------------ Make Profile Course-Branch-Year Clickable ------------------
teacherCourseBranch.addEventListener("click", () => {
  if (selectedCourseBranchYearKey) {
    // If already selected, confirm change
    if (confirm("Change course/branch/year? Current data will switch.")) {
      openCourseSelectionModal();
    }
  } else {
    openCourseSelectionModal();
  }
});

// ------------------ FIXED: Students Section Logic ------------------
function loadStudents() {
  if (!selectedCourseBranchYearKey) {
    studentsHeading.textContent = "Please select course, branch, and year first.";
    studentsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Select course-branch-year to view students</td></tr>'; // FIXED: colspan=4 (Name, Regd No., Attendance, Actions)
    return;
  }
  const course = localStorage.getItem("teacherSelectedCourse") || "";
  const branch = localStorage.getItem("teacherSelectedBranch") || "";
  const year = localStorage.getItem("teacherSelectedYear") || "";
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");
  studentsHeading.textContent = `Students List - ${course} (${branch} - ${year})`;
  studentsTableBody.innerHTML = "";
  if (students.length === 0) {
    studentsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students yet</td></tr>'; // FIXED: colspan=4
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
  // Safe element checks (removed age input check)
  if (!studentNameInput || !studentRegdNoInput) {
    alert("Error: Form elements not found. Refresh page.");
    return;
  }

  const name = studentNameInput.value.trim();
  const regdNo = studentRegdNoInput.value.trim();

  if (!name || !regdNo) {
    alert("Please fill all fields (Name, Regd No.)");
    return;
  }

  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
    openCourseSelectionModal();
    return;
  }

  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");

  // Check if student already exists
  if (students.some(s => s.regdNo === regdNo)) {
    alert("Student with this Regd No. already exists");
    return;
  }

  students.push({ name, regdNo, attendance: 0 }); // Removed age
  localStorage.setItem(`students_${selectedCourseBranchYearKey}`, JSON.stringify(students));
  loadStudents();
  addStudentModal.style.display = "none";

  // Clear inputs (removed age clear)
  studentNameInput.value = "";
  studentRegdNoInput.value = "";

  alert("Student added successfully!");
}
function removeStudent(index) {
  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
    return;
  }
  if (!confirm("Are you sure you want to remove this student?")) return;

  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");
  students.splice(index, 1);
  localStorage.setItem(`students_${selectedCourseBranchYearKey}`, JSON.stringify(students));
  loadStudents();
  alert("Student removed successfully!");
}

// Make removeStudent global for onclick in table
window.removeStudent = removeStudent;

// Event listeners for students
document.getElementById("studentsBtn").addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course, branch, and year first.`;
  } else {
    hideAllSections();
    studentsSection.style.display = "block";
    loadStudents(); // Loads data for current course/branch/year
  }
});

addStudentBtn.addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
    openCourseSelectionModal();
    return;
  }
  addStudentModal.style.display = "flex";
});

// Toggle Action Column on Remove Student Button Click
removeStudentBtn.addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
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
  if (!selectedCourseBranchYearKey) {
    takeAttendanceHeading.textContent = "Please select course, branch, and year first.";
    attendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Select course-branch-year to take attendance</td></tr>';
    return;
  }
  const course = localStorage.getItem("teacherSelectedCourse");
  const branch = localStorage.getItem("teacherSelectedBranch");
  const year = localStorage.getItem("teacherSelectedYear");
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");
  takeAttendanceHeading.textContent = `Take Attendance - ${course} (${branch} - ${year})`;
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
  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
    return;
  }
  const date = attendanceDateInput.value;
  if (!date) {
    alert("Please select a date");
    return;
  }
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");
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
  // Save attendance for this date and course/branch/year
  localStorage.setItem(`attendance_${selectedCourseBranchYearKey}_${date}`, JSON.stringify(attendanceRecords));
  // Calculate and update percentages for the current month
  calculateMonthlyPercentage();
  alert("Attendance saved successfully!");
  loadStudents(); // Refresh students table with updated percentages (for current course/branch/year)
}

function calculateMonthlyPercentage() {
  if (!selectedCourseBranchYearKey) return;
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  let students = JSON.parse(localStorage.getItem(`students_${selectedCourseBranchYearKey}`) || "[]");
  let attendanceData = {};

  // Collect all attendance dates in current month for this course/branch/year
  for (let i = 1; i <= 31; i++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchYearKey}_${dateStr}`) || "[]");
    if (records.length > 0) {
      records.forEach(record => {
        if (!attendanceData[record.regdNo]) attendanceData[record.regdNo] = { present: 0, total: 0 };
        attendanceData[record.regdNo].total++;
        if (record.status === "present") attendanceData[record.regdNo].present++;
      });
    }
  }

  // Update students attendance percentage for this course/branch/year
  students.forEach(student => {
    const data = attendanceData[student.regdNo];
    if (data && data.total > 0) {
      student.attendance = Math.round((data.present / data.total) * 100);
    } else {
      student.attendance = 0;
    }
  });
  localStorage.setItem(`students_${selectedCourseBranchYearKey}`, JSON.stringify(students));
}

// Event listeners for take attendance
document.getElementById("takeAttendanceBtn").addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course, branch, and year first.`;
  } else {
    hideAllSections();
    takeAttendanceSection.style.display = "block";
    loadAttendanceTable(); // Loads data for current course/branch/year
    // Reload on date change
    const handleDateChange = () => loadAttendanceTable();
    attendanceDateInput.removeEventListener("change", handleDateChange); // Prevent duplicates
    attendanceDateInput.addEventListener("change", handleDateChange);
  }
});

saveAttendanceBtn.addEventListener("click", saveAttendance);

// ------------------ View Attendance Logic ------------------
function loadViewAttendance() {
  if (!selectedCourseBranchYearKey) {
    viewAttendanceHeading.textContent = "Please select course, branch, and year first.";
    viewAttendanceRecordsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Select course-branch-year to view attendance</td></tr>';
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
  const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchYearKey}_${date}`) || "[]");
  const course = localStorage.getItem("teacherSelectedCourse");
  const branch = localStorage.getItem("teacherSelectedBranch");
  const year = localStorage.getItem("teacherSelectedYear");
  viewAttendanceHeading.textContent = `Attendance Records - ${course} (${branch} - ${year}) - ${date}`;
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

// PDF Download Function (requires jsPDF library to be included in HTML)
function downloadAttendancePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = viewAttendanceDateInput.value;
  const course = localStorage.getItem("teacherSelectedCourse") || "";
  const branch = localStorage.getItem("teacherSelectedBranch") || "";
  const year = localStorage.getItem("teacherSelectedYear") || "";
  const records = JSON.parse(localStorage.getItem(`attendance_${selectedCourseBranchYearKey}_${date}`) || "[]");

  // Header
  doc.setFontSize(20);
  doc.text("Attendance Report", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${course} - ${branch} - ${year}`, 105, 35, { align: 'center' });
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
  const filename = `attendance_${course.replace(/ /g, '_')}_${branch.replace(/ /g, '_')}_${year.replace(/ /g, '_')}_${date}.pdf`;
  doc.save(filename);
}

// Event listeners for view attendance
document.getElementById("viewAttendanceBtn").addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course, branch, and year first.`;
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
  if (!selectedCourseBranchYearKey) {
    viewComplainHeading.textContent = "Please select course, branch, and year first.";
    complaintsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Select course-branch-year to view complaints</td></tr>'; // colspan=6 (including action)
    toggleComplaintActionsBtn.style.display = "none"; // Hide toggle if no data
    return;
  }

  let complaints = JSON.parse(localStorage.getItem(`complaints_${selectedCourseBranchYearKey}`) || "[]");
  const course = localStorage.getItem("teacherSelectedCourse");
  const branch = localStorage.getItem("teacherSelectedBranch");
  const year = localStorage.getItem("teacherSelectedYear");
  viewComplainHeading.textContent = `Student Complaints - ${course} (${branch} - ${year})`;
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

// Remove Complaint Function
function removeComplaint(timestamp) {
  if (!selectedCourseBranchYearKey) return;
  if (!confirm("Are you sure you want to remove this complaint?")) return;

  let complaints = JSON.parse(localStorage.getItem(`complaints_${selectedCourseBranchYearKey}`) || "[]");
  // Find and remove the complaint by timestamp (unique ID)
  complaints = complaints.filter(complaint => complaint.timestamp !== timestamp);
  localStorage.setItem(`complaints_${selectedCourseBranchYearKey}`, JSON.stringify(complaints));
  alert("Complaint removed successfully!");
  loadComplaints(); // Reload table
}

// Open Photo Modal
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
  if (!selectedCourseBranchYearKey) {
    alert("Please select course, branch, and year first");
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
  if (event.target === yearSelectionModal) {
    yearSelectionModal.style.display = "none";
  }
});

// Make removeComplaint global for onclick in table
window.removeComplaint = removeComplaint;

// Event listener for view complain
document.getElementById("viewComplainBtn").addEventListener("click", () => {
  if (!selectedCourseBranchYearKey) {
    openCourseSelectionModal();
    hideAllSections();
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course, branch, and year first.`;
  } else {
    hideAllSections();
    viewComplainSection.style.display = "block";
    loadComplaints(); // Load complaints for current course/branch/year
    mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, viewing complaints.`;
  }
});

// ------------------ Logout ------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherSelectedCourse");
    localStorage.removeItem("teacherSelectedBranch");
    localStorage.removeItem("teacherSelectedYear"); // New: Remove year
    window.location.href = "Login-Table.html";
  }
});

// ------------------ On page load ------------------
document.addEventListener("DOMContentLoaded", () => {
  hideAllSections();
  mainPanel.querySelector("h1").textContent = `Hey ${teacherName}, please select your course, branch, and year.`;
  // Initialize selectedCourseBranchYearKey on load
  updateTeacherLocationDisplay();
  // Set initial button text for remove toggle
  removeStudentBtn.textContent = "Show Remove Options";
  toggleComplaintActionsBtn.textContent = "Show Remove Options";
});