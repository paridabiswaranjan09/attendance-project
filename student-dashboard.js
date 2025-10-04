// ------------------ Load Student Data on Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
    const studentName = localStorage.getItem("studentName") || "Student";
    const studentRegdNo = localStorage.getItem("studentRegdNo") || "";
    const selectedCourse = localStorage.getItem("studentSelectedCourse") || "";
    const selectedBranch = localStorage.getItem("studentSelectedBranch") || "";
    const courseBranchKey = localStorage.getItem("studentCourseBranchKey") || "";

    // Display in profile
    document.getElementById("studentNameDisplay").textContent = studentName;
    document.getElementById("studentCourseBranch").textContent = selectedCourse ? `${selectedCourse} - ${selectedBranch}` : "No course selected";

    // Pre-fill complaint form
    document.getElementById("complaintStudentName").value = studentName;
    document.getElementById("complaintStudentRegdNo").value = studentRegdNo;

    // Set default date
    const attendanceDateInput = document.getElementById("studentAttendanceDate");
    if (attendanceDateInput) {
        attendanceDateInput.value = new Date().toISOString().split('T')[0];
        loadStudentAttendanceTable(); // Load initial data on page load
    }

    // If no course-branch, redirect to login
    if (!courseBranchKey) {
        alert("No course selected. Please login again.");
        window.location.href = "Login-Table.html";
        return;
    }

    // Global variables for this dashboard
    window.studentCourseBranchKey = courseBranchKey;
    window.studentRegdNo = studentRegdNo;
});

// ------------------ Sections ------------------
const viewAttendanceSection = document.getElementById("viewAttendanceSection");
const applyComplaintSection = document.getElementById("applyComplaintSection");

// ------------------ Sidebar Buttons ------------------
document.getElementById("viewAttendanceBtn").addEventListener("click", () => {
    hideAllSections();
    viewAttendanceSection.style.display = "block";
    loadStudentAttendanceTable(); // Load initial data
});

document.getElementById("applyComplaintBtn").addEventListener("click", () => {
    hideAllSections();
    applyComplaintSection.style.display = "block";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear student data
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentRegdNo");
    localStorage.removeItem("studentSelectedCourse");
    localStorage.removeItem("studentSelectedBranch");
    localStorage.removeItem("studentCourseBranchKey");
    window.location.href = "Login-Table.html";
});

function hideAllSections() {
    viewAttendanceSection.style.display = "none";
    applyComplaintSection.style.display = "none";
}

// ------------------ View Attendance Logic ------------------
// Elements
const studentAttendanceDateInput = document.getElementById("studentAttendanceDate");
const studentAttendanceTableBody = document.getElementById("studentAttendanceTableBody");
const downloadStudentPdfBtn = document.getElementById("downloadStudentPdfBtn");

function loadStudentAttendanceTable() {
    const courseBranchKey = window.studentCourseBranchKey;
    const regdNo = window.studentRegdNo;
    if (!courseBranchKey || !regdNo) {
        studentAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available. Please login again.</td></tr>';
        downloadStudentPdfBtn.disabled = true;
        return;
    }

    const date = studentAttendanceDateInput.value;
    if (!date) {
        studentAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Select a date to view your record</td></tr>';
        downloadStudentPdfBtn.disabled = true;
        downloadStudentPdfBtn.textContent = "Download PDF";
        return;
    }

    // Load attendance records for this date
    const records = JSON.parse(localStorage.getItem(`attendance_${courseBranchKey}_${date}`) || "[]");
    const record = records.find(r => r.regdNo === regdNo);

    if (!record) {
        studentAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No attendance record for this date</td></tr>';
        downloadStudentPdfBtn.disabled = true;
        downloadStudentPdfBtn.textContent = "No Data to Download";
        return;
    }

    // Calculate monthly percentage for this student
    const monthlyPercentage = calculateStudentMonthlyPercentage();

    // Display single row for this student
    studentAttendanceTableBody.innerHTML = `
        <tr>
            <td>${localStorage.getItem("studentName")}</td>
            <td>${regdNo}</td>
            <td><span class="status-${record.status}">${record.status.toUpperCase()}</span></td>
            <td>${monthlyPercentage}%</td>
        </tr>
    `;

    // Enable PDF
    downloadStudentPdfBtn.disabled = false;
    downloadStudentPdfBtn.textContent = "Download PDF";
}

// Calculate Monthly Percentage for This Student (Similar to Teacher's)
function calculateStudentMonthlyPercentage() {
    const courseBranchKey = window.studentCourseBranchKey;
    const regdNo = window.studentRegdNo;
    if (!courseBranchKey || !regdNo) return 0;

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    let presentCount = 0;
    let totalCount = 0;

    // Scan all dates in current month
    for (let i = 1; i <= 31; i++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const records = JSON.parse(localStorage.getItem(`attendance_${courseBranchKey}_${dateStr}`) || "[]");
        const record = records.find(r => r.regdNo === regdNo);
        if (record) {
            totalCount++;
            if (record.status === "present") presentCount++;
        }
    }

    return totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
}

// PDF Download for Student
function downloadStudentAttendancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = studentAttendanceDateInput.value;
    const course = localStorage.getItem("studentSelectedCourse") || "";
    const branch = localStorage.getItem("studentSelectedBranch") || "";
    const studentName = localStorage.getItem("studentName") || "";
    const regdNo = window.studentRegdNo;
    const courseBranchKey = window.studentCourseBranchKey;

    // Get record and percentage
    const records = JSON.parse(localStorage.getItem(`attendance_${courseBranchKey}_${date}`) || "[]");
    const record = records.find(r => r.regdNo === regdNo);
    const status = record ? record.status : 'absent';
    const statusText = status.toUpperCase();
    const statusColor = status === 'present' ? [0, 128, 0] : [255, 0, 0];
    const percentage = calculateStudentMonthlyPercentage();

    // Header
    doc.setFontSize(20);
    doc.text("Student Attendance Report", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${course} - ${branch}`, 105, 35, { align: 'center' });
    doc.text(`Date: ${date}`, 105, 45, { align: 'center' });
    doc.text(`Student: ${studentName} (${regdNo})`, 105, 55, { align: 'center' });

    // Table (single row)
    let yPos = 70;
    doc.setFontSize(10);
    doc.text('Student Name', 15, yPos);
    doc.text('Regd No.', 60, yPos);
    doc.text('Status', 100, yPos);
    doc.text('Percentage (%)', 140, yPos);

    // Draw header line
    doc.setLineWidth(0.5);
    doc.line(10, yPos + 2, 200, yPos + 2);

    // Data row
    yPos += 10;
    doc.text(studentName.substring(0, 20), 15, yPos); // Truncate if long
    doc.text(regdNo, 60, yPos);
    doc.setTextColor(...statusColor);
    doc.text(statusText, 100, yPos);
    doc.setTextColor(0, 0, 0); // Reset
    doc.text(`${percentage}%`, 140, yPos);

    // Footer
    yPos += 20;
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });

    // Save PDF
    const filename = `student_attendance_${course.replace(/ /g, '_')}_${branch.replace(/ /g, '_')}_${date}.pdf`;
    doc.save(filename);
}

// Event Listeners for Attendance
studentAttendanceDateInput.addEventListener("change", loadStudentAttendanceTable);
downloadStudentPdfBtn.addEventListener("click", () => {
    if (studentAttendanceDateInput.value && !downloadStudentPdfBtn.disabled) {
        downloadStudentAttendancePDF();
    } else {
        alert("Please select a valid date with your record.");
    }
});

// ------------------ Apply Complaint Logic ------------------
const submitComplaintBtn = document.getElementById("submitComplaintBtn");
const complaintMessage = document.getElementById("complaintMessage");
const complaintText = document.getElementById("complaintText");
const complaintPhoto = document.getElementById("complaintPhoto");

submitComplaintBtn.addEventListener("click", () => {
    const text = complaintText.value.trim();
    if (!text) {
        showComplaintMessage("Please describe your complaint.", "error");
        return;
    }

    // Get photo as base64 (optional)
    const file = complaintPhoto.files[0];
    let photoBase64 = null;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoBase64 = e.target.result; // base64 string
            saveComplaint(text, photoBase64);
        };
        reader.readAsDataURL(file);
    } else {
        // No photo, save immediately
        saveComplaint(text, null);
    }
});

function saveComplaint(text, photoBase64) {
    const courseBranchKey = window.studentCourseBranchKey;
    const studentName = localStorage.getItem("studentName");
    const regdNo = window.studentRegdNo;
    const course = localStorage.getItem("studentSelectedCourse");
    const branch = localStorage.getItem("studentSelectedBranch");
    const timestamp = new Date().toISOString();

    // Load existing complaints
    let complaints = JSON.parse(localStorage.getItem(`complaints_${courseBranchKey}`) || "[]");

    // Add new complaint
    complaints.push({
        name: studentName,
        regdNo: regdNo,
        course: course,
        branch: branch,
        text: text,
        photo: photoBase64, // base64 or null
        timestamp: timestamp
    });

    // Save back
    localStorage.setItem(`complaints_${courseBranchKey}`, JSON.stringify(complaints));

    // Clear form
    complaintText.value = "";
    complaintPhoto.value = "";

    // Show success
    showComplaintMessage("Complaint submitted successfully! It will be reviewed by your teacher.", "success");

    // Optional: Clear message after 5s
    setTimeout(() => {
        complaintMessage.textContent = "";
        complaintMessage.className = "";
    }, 5000);
}

function showComplaintMessage(msg, type) {
    complaintMessage.textContent = msg;
    complaintMessage.className = type; // 'success' or 'error' for styling
}

// ------------------ Utility Functions ------------------
// No additional modals needed, but add window resize listener for responsive
window.addEventListener("resize", () => {
    // Optional: Reload table if needed for mobile
});