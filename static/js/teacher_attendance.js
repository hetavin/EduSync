// ===== Teacher Attendance Management =====

let currentStudentView = 'daily';

// ===== Switch Student Tab =====
function switchStudentTab(tab) {
    const buttons = document.querySelectorAll('#students .tab-btn');
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

    currentStudentView = tab;

    if (tab === 'daily') {
        document.getElementById('dailyAttendanceSection').style.display = 'block';
        loadTeacherDailyAttendance();
    } else if (tab === 'monthly') {
        document.getElementById('monthlyAttendanceSection').style.display = 'block';
        loadTeacherMonthlyAttendance();
    }
}

// ===== Daily Attendance =====
function loadTeacherDailyAttendance() {
    const date = document.getElementById('dailyDate')?.value || new Date().toISOString().split('T')[0];
    const batch = document.getElementById('dailyBatch')?.value || '';
    const classVal = document.getElementById('dailyClass')?.value || '';
    const search = document.getElementById('dailySearch')?.value || '';

    const tbody = document.getElementById('dailyAttendanceBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/api/teacher/attendance/daily?date=${date}&batch=${batch}&class=${classVal}&search=${search}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;color:var(--red);">${data.message}</td></tr>`;
                return;
            }

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
                tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;">No students found</td></tr>';
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
                        <td><span class="badge badge-info">${s.batch}-${s.class}</span></td>
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
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--red);">Error loading data</td></tr>';
        });
}

// ===== Monthly Attendance =====
function loadTeacherMonthlyAttendance() {
    const year = document.getElementById('monthlyYear')?.value || new Date().getFullYear().toString();
    const tbody = document.getElementById('monthlyAttendanceBody');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="17" style="text-align:center;">
                <i class="fas fa-spinner fa-spin"></i> Loading...
            </td>
        </tr>
    `;

    fetch(`/api/teacher/attendance/monthly?year=${year}`)
        .then(res => res.json())
        .then(data => {

            if (!data.success) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="17" style="text-align:center;color:var(--red);">
                            ${data.message}
                        </td>
                    </tr>
                `;
                return;
            }

            if (data.students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="17" style="text-align:center;">
                            No students found
                        </td>
                    </tr>
                `;
                return;
            }

            const months = [
                "jan","feb","mar","apr","may","jun",
                "jul","aug","sep","oct","nov","dec"
            ];

            tbody.innerHTML = data.students.map(s => {

                const avg = parseFloat(s.avg_attendance) || 0;
                
                let statusClass = 'danger';
                let statusText = 'Low';
                if (avg >= 90) {
                    statusClass = 'success';
                    statusText = 'Excellent';
                } else if (avg >= 75) {
                    statusClass = 'warning';
                    statusText = 'Good';
                }

                const monthColumns = months.map(month => {

                    const value = parseFloat(s[month]);

                    if (isNaN(value) || !s[month]) {
                        return `<td style="color:var(--text-tertiary);">-</td>`;
                    }

                    let color = "var(--red)";

                    if (value >= 75) {
                        color = "var(--green)";
                    } else if (value >= 60) {
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
                                onclick="viewStudentDetail('${s.enrollment_no}')"
                                style="
                                    padding:6px 12px;
                                    background:var(--blue);
                                    color:#fff;
                                    border:none;
                                    border-radius:6px;
                                    cursor:pointer;
                                ">
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
                    <td colspan="17" style="text-align:center;color:var(--red);">
                        Error loading data
                    </td>
                </tr>
            `;
        });
}

// ===== Student Detail Attendance =====
function viewStudentDetail(enrollment) {
    currentStudentView = 'student-detail';
    document.getElementById('dailyAttendanceSection').style.display = 'none';
    document.getElementById('monthlyAttendanceSection').style.display = 'none';
    document.getElementById('studentDetailSection').style.display = 'block';

    document.getElementById('currentEnrollment').value = enrollment;

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

    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/api/teacher/attendance/student-detail?enrollment=${enrollment}&month=${month}&year=${year}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;color:var(--red);">${data.message}</td></tr>`;
                return;
            }

            const student = data.student;
            const infoDiv = document.getElementById('studentInfo');
            if (infoDiv) {
                const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                infoDiv.innerHTML = `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin: 24px; color: white; display: flex; gap: 24px; align-items: center;">
                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">${initials}</div>
                        <div style="flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div>
                                <div style="opacity: 0.8; font-size: 12px; margin-bottom: 4px;"><i class="fas fa-id-card"></i> Enrollment</div>
                                <div style="font-weight: 600; font-size: 16px;">${student.enrollment_no}</div>
                            </div>
                            <div>
                                <div style="opacity: 0.8; font-size: 12px; margin-bottom: 4px;"><i class="fas fa-user"></i> Name</div>
                                <div style="font-weight: 600; font-size: 16px;">${student.name}</div>
                            </div>
                            <div>
                                <div style="opacity: 0.8; font-size: 12px; margin-bottom: 4px;"><i class="fas fa-layer-group"></i> Batch</div>
                                <div style="font-weight: 600; font-size: 16px;">${student.batch}</div>
                            </div>
                            <div>
                                <div style="opacity: 0.8; font-size: 12px; margin-bottom: 4px;"><i class="fas fa-chalkboard"></i> Class</div>
                                <div style="font-weight: 600; font-size: 16px;">${student.class}</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (data.attendance.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">No attendance records for this month</td></tr>';
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
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--red);">Error loading data</td></tr>';
        });
}

function closeStudentDetail() {
    currentStudentView = 'monthly';
    document.getElementById('studentDetailSection').style.display = 'none';
    document.getElementById('monthlyAttendanceSection').style.display = 'block';
}

// ===== Initialize Event Listeners =====
window.addEventListener('load', function() {
    const dateInput = document.getElementById('dailyDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Load years from database
    loadAvailableYears();

    document.getElementById('dailyDate')?.addEventListener('change', loadTeacherDailyAttendance);
    document.getElementById('dailyBatch')?.addEventListener('change', loadTeacherDailyAttendance);
    document.getElementById('dailyClass')?.addEventListener('change', loadTeacherDailyAttendance);
    document.getElementById('dailySearch')?.addEventListener('input', debounceTeacher(loadTeacherDailyAttendance, 500));
    
    document.getElementById('monthlyYear')?.addEventListener('change', loadTeacherMonthlyAttendance);
    document.getElementById('detailMonth')?.addEventListener('change', () => {
        const enrollment = document.getElementById('currentEnrollment')?.value;
        if (enrollment) loadStudentDetailAttendance(enrollment);
    });
    document.getElementById('detailYear')?.addEventListener('change', () => {
        const enrollment = document.getElementById('currentEnrollment')?.value;
        if (enrollment) loadStudentDetailAttendance(enrollment);
    });
});

// Load available years from database
function loadAvailableYears() {
    fetch('/api/teacher/attendance/years')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.years) {
                const monthlyYearSelect = document.getElementById('monthlyYear');
                const detailYearSelect = document.getElementById('detailYear');
                const currentYear = new Date().getFullYear();

                if (monthlyYearSelect) {
                    monthlyYearSelect.innerHTML = '';
                    data.years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === currentYear) {
                            option.selected = true;
                        }
                        monthlyYearSelect.appendChild(option);
                    });
                }

                if (detailYearSelect) {
                    detailYearSelect.innerHTML = '';
                    data.years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === currentYear) {
                            option.selected = true;
                        }
                        detailYearSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(err => {
            console.error('Error loading years:', err);
        });
}

function debounceTeacher(func, wait) {
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
