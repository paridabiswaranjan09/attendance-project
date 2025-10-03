// --- Select elements ---
const loginTable = document.querySelector('.login-table'); // pehla table
const adminBtn = document.querySelector('.login-btns .admin');
const teacherBtn = document.querySelector('.login-btns .teacher');
const studentBtn = document.querySelector('.login-btns .student');

const adminLogin = document.getElementById('adminLogin');
const adminSignup = document.getElementById('adminSignup');
const teacherLogin = document.getElementById('teacherLogin');
const studentLogin = document.getElementById('studentLogin'); // NEW
const msgBox = document.getElementById('msgBox');
const mainLoginTable = document.querySelector(".login-table");

// NEW: Student Modal Elements
const studentCourseSelectionModal = document.getElementById("studentCourseSelectionModal");
const studentBranchSelectionModal = document.getElementById("studentBranchSelectionModal");
const studentCourseSelectionTableBody = document.getElementById("studentCourseSelectionTableBody");
const studentBranchSelectionTableBody = document.getElementById("studentBranchSelectionTableBody");
const studentSelectedCourseNameSpan = document.getElementById("studentSelectedCourseName");
const closeStudentCourseSelectionModalBtn = document.getElementById("closeStudentCourseSelectionModal");
const closeStudentBranchSelectionModalBtn = document.getElementById("closeStudentBranchSelectionModal");

// Load courses globally for student modal
let courses = JSON.parse(localStorage.getItem("courses") || "[]");

// --- Function to hide a table with smooth transition ---
function hideTable(table, callback) {
    if (!table) return;
    if (!table.classList.contains('show') && !table.classList.contains('hide')) {
        if (callback) callback();
        return;
    }
    table.classList.remove('show');
    table.classList.add('hide'); // start hide animation
    setTimeout(() => {
        if (callback) callback();
    }, 300); // match CSS transition duration
}

// --- Function to show a table ---
function showTable(tableToShow) {
    // Hide login-table and floating tables first
    hideTable(loginTable, () => {
        hideTable(adminLogin, () => {
            hideTable(adminSignup, () => {
                hideTable(teacherLogin, () => {
                    hideTable(studentLogin, () => { // NEW
                        tableToShow.classList.remove('hide');
                        tableToShow.classList.add('show');
                    });
                });
            });
        });
    });
}

// ------------------- Event Listeners -------------------

// Admin button click → show Admin login table
adminBtn.addEventListener('click', () => {
    mainLoginTable.classList.add("hide");
    showTable(adminLogin);
});

// Teacher button click → show Teacher login table
teacherBtn.addEventListener('click', () => {
    mainLoginTable.classList.add("hide");
    showTable(teacherLogin);
});

// NEW: Student button click → show Student login table
studentBtn.addEventListener('click', () => {
    mainLoginTable.classList.add("hide");
    showTable(studentLogin);
});

// ------------------- Admin Login -------------------
document.getElementById('adminLoginBtn').addEventListener('click', () => {
    const name = document.getElementById('adminName').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    if (!name || !pass) {
        showFloatingMessage("All fields mandatory!");
        return;
    }

    let user = localStorage.getItem(name);
    if (user && JSON.parse(user).pass === pass) {
        localStorage.setItem("adminPassword", pass); // save login password
        hideTable(adminLogin, () => {
            showFloatingMessage("Login successful!", () => {
                localStorage.setItem("adminName", name);
                window.location.href = "admin-dashboard.html";
            });
        });
    } else {
        showFloatingMessage("Invalid user/password. Please sign up first.");
    }
});

// Admin Signup button → show Admin signup table
document.getElementById('adminSignupBtn').addEventListener('click', () => {
    showTable(adminSignup);
});

// Create Admin Account
document.getElementById('createAccountBtn').addEventListener('click', () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const pass = document.getElementById('signupPass').value.trim();
    const confirm = document.getElementById('signupConfirm').value.trim();

    if (!name || !email || !phone || !pass || !confirm) {
        showFloatingMessage("All fields mandatory!");
        return;
    }
    if (pass !== confirm) {
        showFloatingMessage("Passwords do not match!");
        return;
    }

    // Save in localStorage
    localStorage.setItem(name, JSON.stringify({ name, email, phone, pass }));

    // Hide signup table, show message
    hideTable(adminSignup, () => {
        msgBox.innerHTML = "You are added! <button id='nextBtn'>Next</button>";
        msgBox.style.display = "block";

        // Add event listener for next button (use event delegation or recreate)
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                msgBox.style.display = "none";
                showTable(adminLogin);
            });
        }
    });
});

// ------------------ Teacher Login ------------------
document.getElementById("teacherLoginBtn").addEventListener("click", () => {
    const tName = document.getElementById("teacherName").value.trim();
    const tId = document.getElementById("teacherId").value.trim();

    if (!tName || !tId) {
        showFloatingMessage("All fields mandatory!");
        return;
    }

    // localStorage se teacher list lein
    let teachers = JSON.parse(localStorage.getItem("teachers") || "[]");

    // Check if teacher exists
    let found = teachers.some(teacher => teacher.name === tName && teacher.id === tId);

    if (!found) {
        showFloatingMessage("Teacher not added yet!");
        return;
    }
     
    // ✅ Teacher name save karo login ke time
    localStorage.setItem("teacherName", tName);
    // Login success
    showFloatingMessage("Login successful! Welcome " + tName, () => {
        window.location.href = "teacher-dashboard.html";
    });
});

// ------------------ NEW: Student Login ------------------
document.getElementById("studentLoginBtn").addEventListener("click", () => {
    const sName = document.getElementById("studentName").value.trim();
    const sRegdNo = document.getElementById("studentRegdNo").value.trim();

    if (!sName || !sRegdNo) {
        showFloatingMessage("All fields mandatory!");
        return;
    }

    // Check if student exists in ANY course-branch
    let studentExists = false;
    for (let course of courses) {
        if (course.branches && course.branches.length > 0) {
            for (let branch of course.branches) {
                const courseBranchKey = `${course.name}_${branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");
                let students = JSON.parse(localStorage.getItem(`students_${courseBranchKey}`) || "[]");
                if (students.some(student => student.name.toLowerCase() === sName.toLowerCase() && student.regdNo === sRegdNo)) {
                    studentExists = true;
                    break;
                }
            }
            if (studentExists) break;
        }
    }

    if (!studentExists) {
        showFloatingMessage("Invalid username and Regd No. Please contact admin.");
        return;
    }

    // Save student details temporarily
    localStorage.setItem("studentTempName", sName);
    localStorage.setItem("studentTempRegdNo", sRegdNo);

    // Open course selection modal
    openStudentCourseSelectionModal();
});

// NEW: Student Course Selection Modal
function openStudentCourseSelectionModal() {
    if (courses.length === 0) {
        showFloatingMessage("No courses available. Contact admin.");
        return;
    }
    studentCourseSelectionTableBody.innerHTML = "";
    courses.forEach((course) => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `<td>${course.name}</td>`;
        tr.addEventListener("click", () => {
            openStudentBranchSelectionModal(course);
        });
        studentCourseSelectionTableBody.appendChild(tr);
    });
    studentCourseSelectionModal.style.display = "flex";
}

// NEW: Student Branch Selection Modal
function openStudentBranchSelectionModal(course) {
    studentSelectedCourseNameSpan.textContent = course.name;
    studentBranchSelectionTableBody.innerHTML = "";
    if (!course.branches || course.branches.length === 0) {
        studentBranchSelectionTableBody.innerHTML = `<tr><td style="text-align:center;">No branches available</td></tr>`;
    } else {
        course.branches.forEach((branch) => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.innerHTML = `<td>${branch}</td>`;
            tr.addEventListener("click", () => {
                verifyStudentInCourseBranch(course.name, branch);
            });
            studentBranchSelectionTableBody.appendChild(tr);
        });
    }
    studentCourseSelectionModal.style.display = "none";
    studentBranchSelectionModal.style.display = "flex";
}

// NEW: Verify Student in Specific Course-Branch
function verifyStudentInCourseBranch(courseName, branch) {
    const sName = localStorage.getItem("studentTempName");
    const sRegdNo = localStorage.getItem("studentTempRegdNo");
    const courseBranchKey = `${courseName}_${branch}`.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");

    let students = JSON.parse(localStorage.getItem(`students_${courseBranchKey}`) || "[]");
    let enrolled = students.some(student => student.name.toLowerCase() === sName.toLowerCase() && student.regdNo === sRegdNo);

    if (!enrolled) {
        // Close modal and show error
        studentBranchSelectionModal.style.display = "none";
        showFloatingMessage("You are not enrolled in this course-branch. Select another.");
        return;
    }

    // Success: Save student details and selected course-branch
    localStorage.setItem("studentName", sName);
    localStorage.setItem("studentRegdNo", sRegdNo);
    localStorage.setItem("studentSelectedCourse", courseName);
    localStorage.setItem("studentSelectedBranch", branch);
    localStorage.setItem("studentCourseBranchKey", courseBranchKey);

    // Close modal
    studentBranchSelectionModal.style.display = "none";

    // Hide student login and show success message, then redirect
    hideTable(studentLogin, () => {
        showFloatingMessage(`Welcome ${sName}! Redirecting to dashboard...`, () => {
            window.location.href = "student-dashboard.html";
        });
    });
}

// NEW: Close Student Modals
closeStudentCourseSelectionModalBtn.addEventListener("click", () => {
    studentCourseSelectionModal.style.display = "none";
    // Clear temp data if modal closed without selection
    localStorage.removeItem("studentTempName");
    localStorage.removeItem("studentTempRegdNo");
});

closeStudentBranchSelectionModalBtn.addEventListener("click", () => {
    studentBranchSelectionModal.style.display = "none";
    localStorage.removeItem("studentTempName");
    localStorage.removeItem("studentTempRegdNo");
});

// NEW: Close modals on outside click
window.addEventListener("click", (event) => {
    if (event.target === studentCourseSelectionModal) {
        studentCourseSelectionModal.style.display = "none";
        localStorage.removeItem("studentTempName");
        localStorage.removeItem("studentTempRegdNo");
    }
    if (event.target === studentBranchSelectionModal) {
        studentBranchSelectionModal.style.display = "none";
        localStorage.removeItem("studentTempName");
        localStorage.removeItem("studentTempRegdNo");
    }
});

// ------------------- Floating message function -------------------
function showFloatingMessage(message, callback) {
    msgBox.innerHTML = message;
    msgBox.style.display = "block";
    setTimeout(() => {
        msgBox.style.display = "none";
        if (callback) callback();
    }, 2500);
}