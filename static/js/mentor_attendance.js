// ===== Mentor Attendance Management =====

let currentView = 'daily'; // daily, monthly, student-detail

// ===== Daily Attendance =====
function loadDailyAttendance() {
    const date = document.getElementById('dailyDate')?.value || new Date().toISOString().split('T')[0];
    const batch = document.getElementById('dailyBatch')?.value || '';
    const classVal = document.getElementById('dailyClass')?.value || '';
    const search = document.getElementById('dailySearch')?.value || '';

    const tbody = document.getElementById('dailyAttendanceBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="14" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/api/mentor/attendance/daily?date=${date}&batch=${batch}&class=${classVal}&search=${search}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                tbody.innerHTML = `<tr><td colspan="14" class="text-center text-danger">${data.message}</td></tr>`;
                return;
            }

            // Populate filters
            if (data.batches) {
                const batchSelect = document.getElementById('dailyBatch');
                if (batchSelect && batchSelect.options.length === 1) {
                    data.batches.forEach(b => {
                        batchSelect.innerHTML += `<option value="${b}">${b}</option>`;
                    });
                }
            }

            if (data.classes) {
                const classSelect = document.getElementById('dailyClass');
                if (classSelect && classSelect.options.length === 1) {
                    data.classes.forEach(c => {
                        classSelect.innerHTML += `<option value="${c}">${c}</option>`;
                    });
                }
            }

            if (data.students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="14" class="text-center">No students found</td></tr>';
                return;
            }

            tbody.innerHTML = data.students.map(s => {
                const getStatusBadge = (status) => {
                    if (!status || status === null) return '<span class="badge bg-secondary">-</span>';
                    if (status === 'present') return '<span class="badge bg-success">P</span>';
                    if (status === 'absent') return '<span class="badge bg-danger">A</span>';
                    if (status === 'holiday') return '<span class="badge bg-primary">H</span>';
                    return '<span class="badge bg-secondary">-</span>';
                };

                let presentCount = 0;
                let conductedCount = 0;
                
                ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3'].forEach(slot => {
                    if (s[slot]) {
                        conductedCount++;
                        if (s[slot] === 'present') presentCount++;
                    }
                });

                return `
                    <tr>
                        <td>${s.enrollment_no}</td>
                        <td>${s.name}</td>
                        <td><span class="badge bg-info">${s.batch}-${s.class}</span></td>
                        <td>${getStatusBadge(s.slot1)}</td>
                        <td>${getStatusBadge(s.slot2)}</td>
                        <td>${getStatusBadge(s.slot3)}</td>
                        <td>${getStatusBadge(s.slot4)}</td>
                        <td>${getStatusBadge(s.slot5)}</td>
                        <td>${getStatusBadge(s.slot6)}</td>
                        <td>${getStatusBadge(s.lab1)}</td>
                        <td>${getStatusBadge(s.lab2)}</td>
                        <td>${getStatusBadge(s.lab3)}</td>
                    </tr>
                `;
            }).join('');

            // Summary removed as per requirement
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="14" class="text-center text-danger">Error loading data</td></tr>';
        });
}



// ===== Monthly Attendance =====
function loadMonthlyAttendance() {
    const year = document.getElementById('monthlyYear')?.value || new Date().getFullYear().toString();
    const tbody = document.getElementById('monthlyAttendanceBody');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="15" class="text-center">
                <i class="fas fa-spinner fa-spin"></i> Loading...
            </td>
        </tr>
    `;

    fetch(`/api/mentor/attendance/monthly?year=${year}`)
        .then(res => res.json())
        .then(data => {

            if (!data.success) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="15" class="text-center text-danger">
                            ${data.message}
                        </td>
                    </tr>
                `;
                return;
            }

            if (data.students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="15" class="text-center">
                            No students found
                        </td>
                    </tr>
                `;
                return;
            }

            const months = [
                "jan", "feb", "mar", "apr", "may", "jun",
                "jul", "aug", "sep", "oct", "nov", "dec"
            ];

            tbody.innerHTML = data.students.map(s => {

                const monthColumns = months.map(month => {

                    const value = parseFloat(s[month]);

                    if (isNaN(value)) {
                        return `<td style="color:#999;">-</td>`;
                    }

                    let color = "var(--red)";

                    if (value >= 90) {
                        color = "var(--green)";
                    } else if (value >= 75) {
                        color = "var(--orange)";
                    }

                    return `
                        <td>
                            <strong style="color:${color}">
                                ${value.toFixed(2)}%
                            </strong>
                        </td>
                    `;
                }).join("");

                return `
                    <tr>
                        <td>${s.enrollment_no}</td>
                        <td>${s.name}</td>

                        ${monthColumns}

                        <td>
                            <button class="btn btn-view"
                                onclick="viewStudentDetail('${s.enrollment_no}')">
                                <i class="fas fa-eye"></i>
                                View Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");

        })
        .catch(err => {
            console.error(err);

            tbody.innerHTML = `
                <tr>
                    <td colspan="15" class="text-center text-danger">
                        Error loading data
                    </td>
                </tr>
            `;
        });
}

// ===== Student Detail Attendance =====
function viewStudentDetail(enrollment) {
    currentView = 'student-detail';
    document.getElementById('dailyAttendanceSection').style.display = 'none';
    document.getElementById('monthlyAttendanceSection').style.display = 'none';
    document.getElementById('studentDetailSection').style.display = 'block';

    // Store enrollment for month/year changes
    document.getElementById('currentEnrollment').value = enrollment;

    // Set current month and year
    const now = new Date();
    document.getElementById('detailMonth').value = now.getMonth() + 1;
    document.getElementById('detailYear').value = now.getFullYear();

    loadStudentDetailAttendance(enrollment);
}

function loadStudentDetailAttendance(enrollment) {
    const month = document.getElementById('detailMonth')?.value || new Date().getMonth() + 1;
    const year = document.getElementById('detailYear')?.value || new Date().getFullYear();

    const tbody = document.getElementById('studentDetailBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="11" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/api/mentor/attendance/student-detail?enrollment=${enrollment}&month=${month}&year=${year}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">${data.message}</td></tr>`;
                return;
            }

            // Display student info with attractive design
            const student = data.student;
            const infoDiv = document.getElementById('studentInfo');
            if (infoDiv) {
                const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                infoDiv.innerHTML = `
                    <div class="student-info-header">
                        <div class="student-info-avatar">${initials}</div>
                        <div class="student-info-details">
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-id-card"></i> Enrollment</span>
                                <span class="info-value">${student.enrollment_no}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-user"></i> Full Name</span>
                                <span class="info-value">${student.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-layer-group"></i> Batch</span>
                                <span class="info-value">${student.batch}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-chalkboard"></i> Class</span>
                                <span class="info-value">${student.class}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-building"></i> Department</span>
                                <span class="info-value">${student.department || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (data.attendance.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="text-center">No attendance records for this month</td></tr>';
                return;
            }

                const getStatusBadge = (status) => {
                    if (!status || status === null) return '<span class="badge bg-secondary">-</span>';
                    if (status === 'present') return '<span class="badge bg-success">P</span>';
                    if (status === 'absent') return '<span class="badge bg-danger">A</span>';
                    if (status === 'holiday') return '<span class="badge bg-primary">H</span>';
                    return '<span class="badge bg-secondary">-</span>';
                };

            tbody.innerHTML = data.attendance.map(a => {
                const date = new Date(a.date);
                let dailyTotal = 0;
                let dailyConducted = 0;

                ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3'].forEach(slot => {
                    if (a[slot]) {
                        dailyConducted++;
                        if (a[slot] === 'present') {
                            dailyTotal++;
                        }
                    }
                });

                return `
                    <tr>
                        <td><strong>${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></td>
                        <td>${getStatusBadge(a.slot1)}</td>
                        <td>${getStatusBadge(a.slot2)}</td>
                        <td>${getStatusBadge(a.slot3)}</td>
                        <td>${getStatusBadge(a.slot4)}</td>
                        <td>${getStatusBadge(a.slot5)}</td>
                        <td>${getStatusBadge(a.slot6)}</td>
                        <td>${getStatusBadge(a.lab1)}</td>
                        <td>${getStatusBadge(a.lab2)}</td>
                        <td>${getStatusBadge(a.lab3)}</td>
                        <td><strong style="color: ${dailyTotal > 0 ? 'var(--green)' : 'var(--red)'}">${dailyTotal}</strong></td>
                    </tr>
                `;
            }).join('');

            // Summary removed as per requirement
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Error loading data</td></tr>';
        });
}

function closeStudentDetail() {
    currentView = 'monthly';
    document.getElementById('studentDetailSection').style.display = 'none';
    document.getElementById('monthlyAttendanceSection').style.display = 'block';
}

// ===== Tab Switching =====
function switchAttendanceTab(tab) {
    // Update button styles
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach((btn, idx) => {
        if ((tab === 'daily' && idx === 0) || (tab === 'monthly' && idx === 1)) {
            btn.style.background = 'var(--blue)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'var(--fill-secondary)';
            btn.style.color = 'var(--text-primary)';
        }
    });

    document.getElementById('dailyAttendanceSection').style.display = 'none';
    document.getElementById('monthlyAttendanceSection').style.display = 'none';
    document.getElementById('studentDetailSection').style.display = 'none';

    if (tab === 'daily') {
        document.getElementById('dailyAttendanceSection').style.display = 'block';
        loadDailyAttendance();
    } else if (tab === 'monthly') {
        document.getElementById('monthlyAttendanceSection').style.display = 'block';
        loadMonthlyAttendance();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const dateInput = document.getElementById('dailyDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Set current year for monthly view
    const monthlyYearSelect = document.getElementById('monthlyYear');
    const currentYear = new Date().getFullYear().toString();
    if (monthlyYearSelect) {
        // Check if current year exists in options
        const yearExists = Array.from(monthlyYearSelect.options).some(option => option.value === currentYear);
        if (yearExists) {
            monthlyYearSelect.value = currentYear;
        }
    }

    // Load default view
    loadDailyAttendance();

    // Event listeners for filters
    document.getElementById('dailyDate')?.addEventListener('change', loadDailyAttendance);
    document.getElementById('dailyBatch')?.addEventListener('change', loadDailyAttendance);
    document.getElementById('dailyClass')?.addEventListener('change', loadDailyAttendance);
    document.getElementById('dailySearch')?.addEventListener('input', debounce(loadDailyAttendance, 500));
    
    document.getElementById('monthlyYear')?.addEventListener('change', loadMonthlyAttendance);
    document.getElementById('detailMonth')?.addEventListener('change', () => {
        const enrollment = document.getElementById('currentEnrollment')?.value;
        if (enrollment) loadStudentDetailAttendance(enrollment);
    });
    document.getElementById('detailYear')?.addEventListener('change', () => {
        const enrollment = document.getElementById('currentEnrollment')?.value;
        if (enrollment) loadStudentDetailAttendance(enrollment);
    });
});

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
