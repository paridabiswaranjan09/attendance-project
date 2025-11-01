const API_URL = "http://localhost:5000/api";

// ------------------ Load Student Data on Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
    const studentName = localStorage.getItem("studentName") || "Student";
    const studentRegdNo = localStorage.getItem("studentRegdNo") || "";
    const selectedCourse = localStorage.getItem("studentSelectedCourse") || "";
    const selectedBranch = localStorage.getItem("studentSelectedBranch") || "";
    const courseBranchKey = localStorage.getItem("studentCourseBranchKey") || "";

    document.getElementById("studentNameDisplay").textContent = studentName;
    document.getElementById("studentCourseBranch").textContent = selectedCourse ? `${selectedCourse} - ${selectedBranch}` : "No course selected";

    document.getElementById("complaintStudentName").value = studentName;
    document.getElementById("complaintStudentRegdNo").value = studentRegdNo;

    const attendanceDateInput = document.getElementById("studentAttendanceDate");
    if (attendanceDateInput) {
        attendanceDateInput.value = new Date().toISOString().split('T')[0];
        loadStudentAttendanceTable();
    }

    if (!courseBranchKey) {
        alert("No course selected. Please login again.");
        window.location.href = "Login-Table.html";
        return;
    }

    window.studentCourseBranchKey = courseBranchKey;
    window.studentRegdNo = studentRegdNo;
});

// ------------------ Sections ------------------
const viewAttendanceSection = document.getElementById("viewAttendanceSection");
const applyComplaintSection = document.getElementById("applyComplaintSection");

document.getElementById("viewAttendanceBtn").addEventListener("click", () => {
    hideAllSections();
    viewAttendanceSection.style.display = "block";
    loadStudentAttendanceTable();
});

document.getElementById("applyComplaintBtn").addEventListener("click", () => {
    hideAllSections();
    applyComplaintSection.style.display = "block";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Login-Table.html";
});

function hideAllSections() {
    viewAttendanceSection.style.display = "none";
    applyComplaintSection.style.display = "none";
}

// ------------------ View Attendance Logic ------------------
const studentAttendanceDateInput = document.getElementById("studentAttendanceDate");
const studentAttendanceTableBody = document.getElementById("studentAttendanceTableBody");
const downloadStudentPdfBtn = document.getElementById("downloadStudentPdfBtn");

async function loadStudentAttendanceTable() {
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

    const res = await fetch(`${API_URL}/attendance/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentRegdNo: regdNo, course: localStorage.getItem("studentSelectedCourse"), branch: localStorage.getItem("studentSelectedBranch"), date })
    });
    const records = await res.json();
    const record = records.find(r => r.regdNo === regdNo);

    if (!record) {
        studentAttendanceTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No attendance record for this date</td></tr>';
        downloadStudentPdfBtn.disabled = true;
        downloadStudentPdfBtn.textContent = "No Data to Download";
        return;
    }

    const monthlyPercentage = calculateStudentMonthlyPercentage(records);

    studentAttendanceTableBody.innerHTML = `
        <tr>
            <td>${localStorage.getItem("studentName")}</td>
            <td>${regdNo}</td>
            <td><span class="status-${record.status}">${record.status.toUpperCase()}</span></td>
            <td>${monthlyPercentage}%</td>
        </tr>
    `;

    downloadStudentPdfBtn.disabled = false;
    downloadStudentPdfBtn.textContent = "Download PDF";
}

function calculateStudentMonthlyPercentage(records) {
    if (!records || records.length === 0) return 0;
    let presentCount = records.filter(r => r.status === "present").length;
    let totalCount = records.length;
    return totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
}

function downloadStudentAttendancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = studentAttendanceDateInput.value;
    const course = localStorage.getItem("studentSelectedCourse") || "";
    const branch = localStorage.getItem("studentSelectedBranch") || "";
    const studentName = localStorage.getItem("studentName") || "";
    const regdNo = window.studentRegdNo;

    fetch(`${API_URL}/attendance/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentRegdNo: regdNo, course, branch, date })
    }).then(res => res.json()).then(records => {
        const record = records.find(r => r.regdNo === regdNo);
        const status = record ? record.status : 'absent';
        const percentage = calculateStudentMonthlyPercentage(records);

        doc.setFontSize(20);
        doc.text("Student Attendance Report", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${course} - ${branch}`, 105, 35, { align: 'center' });
        doc.text(`Date: ${date}`, 105, 45, { align: 'center' });
        doc.text(`Student: ${studentName} (${regdNo})`, 105, 55, { align: 'center' });

        let yPos = 70;
        doc.setFontSize(10);
        doc.text('Student Name', 15, yPos);
        doc.text('Regd No.', 60, yPos);
        doc.text('Status', 100, yPos);
        doc.text('Percentage (%)', 140, yPos);

        doc.setLineWidth(0.5);
        doc.line(10, yPos + 2, 200, yPos + 2);

        yPos += 10;
        doc.text(studentName.substring(0, 20), 15, yPos);
        doc.text(regdNo, 60, yPos);
        doc.setTextColor(status === 'present' ? [0, 128, 0] : [255, 0, 0]);
        doc.text(status.toUpperCase(), 100, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(`${percentage}%`, 140, yPos);

        yPos += 20;
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });

        const filename = `student_attendance_${course}_${branch}_${date}.pdf`;
        doc.save(filename);
    });
}

studentAttendanceDateInput.addEventListener("change", loadStudentAttendanceTable);
downloadStudentPdfBtn.addEventListener("click", downloadStudentAttendancePDF);

// ------------------ Complaint Logic ------------------
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

    const file = complaintPhoto.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            saveComplaint(text, e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        saveComplaint(text, null);
    }
});

async function saveComplaint(text, photoBase64) {
    const courseBranchKey = window.studentCourseBranchKey;
    const studentName = localStorage.getItem("studentName");
    const regdNo = window.studentRegdNo;
    const course = localStorage.getItem("studentSelectedCourse");
    const branch = localStorage.getItem("studentSelectedBranch");
    const timestamp = new Date().toISOString();

    const complaint = {
        name: studentName,
        regdNo,
        course,
        branch,
        text,
        photo: photoBase64,
        timestamp,
    };

    const res = await fetch(`${API_URL}/complaints/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint),
    });
    const data = await res.json();

    if (data.success) {
        complaintText.value = "";
        complaintPhoto.value = "";
        showComplaintMessage("Complaint submitted successfully! It will be reviewed by your teacher.", "success");
        setTimeout(() => {
            complaintMessage.textContent = "";
            complaintMessage.className = "";
        }, 5000);
    } else {
        showComplaintMessage("Failed to submit complaint.", "error");
    }
}

function showComplaintMessage(msg, type) {
    complaintMessage.textContent = msg;
    complaintMessage.className = type;
}

// ------------------ Utility ------------------
window.addEventListener("resize", () => {
    // Add if you want to handle responsive
});

