// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const mobileOverlay = document.querySelector('.mobile-overlay');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
} else if (savedTheme === 'light') {
    body.classList.remove('dark');
    themeToggle.checked = false;
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark');
        themeToggle.checked = true;
    }
}

themeToggle.addEventListener('change', function () {
    if (this.checked) {
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
});

// ===== Mobile Menu =====
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');

hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    this.classList.toggle('active');
});

mobileOverlay.addEventListener('click', function () {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
});

// ===== Tab Navigation =====
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        const targetTab = this.getAttribute('data-tab');

        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        tabContents.forEach(tab => tab.classList.remove('active'));
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
            targetContent.classList.add('active');

            targetContent.style.opacity = '0';
            targetContent.style.transform = 'translateY(10px)';
            setTimeout(() => {
                targetContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }, 10);
        }

        const navText = this.querySelector('span').textContent;
        document.querySelector('.page-title').textContent = navText;

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// ===== Real-time Clock =====
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

updateTime();
setInterval(updateTime, 1000);

// ===== Animations on Load =====
window.addEventListener('load', function () {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// ===== Logout Confirmation =====
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/logout';
        }
    });
}

// ===== Notification Button =====
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function () {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
}

// ===== View All Attendance Button =====
const viewAllBtn = document.getElementById('viewAllAttendanceBtn');
if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function () {
        const attendanceNavItem = document.querySelector('.nav-item[data-tab="attendance"]');
        if (attendanceNavItem) {
            attendanceNavItem.click();
        }
    });
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        themeToggle.click();
    }
});

// ===== Responsive Adjustments =====
let resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }, 250);
});

// ===== Load Student Data =====
const timeSlotLabels = {
    'slot1': '9:00 AM - 9:55 AM',
    'slot2': '9:55 AM - 10:50 AM',
    'slot3': '11:00 AM - 11:55 AM',
    'slot4': '11:55 AM - 12:50 PM',
    'slot5': '1:20 PM - 2:15 PM',
    'slot6': '2:15 PM - 3:10 PM',
    'lab1': '9:00 AM - 10:50 AM (Lab)',
    'lab2': '11:00 AM - 12:50 PM (Lab)',
    'lab3': '1:20 PM - 3:10 PM (Lab)'
};

function loadStudentProfile() {
    fetch('/api/student/profile')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.student) {
                const student = data.student;

                document.getElementById('studentName').textContent = student.name;
                document.getElementById('studentId').textContent = student.enrollment_no;

                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff&size=128`;
                document.getElementById('studentAvatar').src = avatarUrl;

                const firstName = student.name.split(' ')[1];
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${firstName}!`;

                document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff&size=256`;
                document.getElementById('profileName').textContent = student.name;
                document.getElementById('profileStudentId').textContent = `Student ID: ${student.enrollment_no}`;

                document.getElementById('infoName').textContent = student.name;
                document.getElementById('infoEmail').textContent = student.email;
                document.getElementById('infoPhone').textContent = student.phone_number;
                document.getElementById('infoEnrollment').textContent = student.enrollment_no;

                document.getElementById('infoDepartment').textContent = student.department;
                document.getElementById('infoYear').textContent = student.batch;
                document.getElementById('infoSection').textContent = student.class;
            }
        })
        .catch(error => console.error('Error loading profile:', error));
}

function loadAttendanceStats() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    fetch(`/api/student/attendance/monthly?month=${currentMonth}&year=${currentYear}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attendance && data.attendance.length > 0) {
                let presentCount = 0;

                data.attendance.forEach(record => {
                    ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3'].forEach(slot => {
                        if (record[slot] === 'present') presentCount++;
                    });
                });

                const percentage = ((presentCount * 100) / 120).toFixed(2);

                const monthPercentageEl = document.getElementById('currentMonthPercentage');
                const monthLabelEl = document.getElementById('currentMonthLabel');
                const presentDaysEl = document.getElementById('presentDays');

                if (monthPercentageEl) monthPercentageEl.textContent = `${percentage}%`;
                if (monthLabelEl) monthLabelEl.textContent = `${monthNames[currentMonth - 1]} Attendance`;
                if (presentDaysEl) presentDaysEl.textContent = presentCount;
            } else {
                const monthPercentageEl = document.getElementById('currentMonthPercentage');
                const monthLabelEl = document.getElementById('currentMonthLabel');
                const presentDaysEl = document.getElementById('presentDays');

                if (monthPercentageEl) monthPercentageEl.textContent = '0.00%';
                if (monthLabelEl) monthLabelEl.textContent = `${monthNames[currentMonth - 1]} Attendance`;
                if (presentDaysEl) presentDaysEl.textContent = '0';
            }
        })
        .catch(error => console.error('Error loading stats:', error));
}

function loadRecentAttendance() {
    fetch('/api/student/attendance/recent')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attendance) {
                const container = document.getElementById('recentAttendanceList');

                if (data.attendance.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 48px;">
                            <i class="fas fa-calendar-alt" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i>
                            <p style="color: var(--text-secondary);">No recent attendance records</p>
                        </div>
                    `;
                    return;
                }

                let html = '';
                data.attendance.forEach(record => {
                    const statusClass = record.status === 'present' ? 'success' : 'error';
                    const statusText = record.status === 'present' ? 'Present' : 'Absent';
                    const timeLabel = timeSlotLabels[record.time_slot] || record.time_slot;

                    html += `
                        <div class="attendance-item">
                            <div class="attendance-date">
                                <span class="day">${record.day}</span>
                                <span class="date">${record.display_date}</span>
                            </div>
                            <div class="attendance-details">
                                <p class="attendance-time">${timeLabel}</p>
                                <p class="attendance-status">Check-in</p>
                            </div>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    `;
                });

                container.innerHTML = html;

                const items = container.querySelectorAll('.attendance-item');
                items.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * 80);
                });
            }
        })
        .catch(error => console.error('Error loading recent attendance:', error));
}

// ===== Attendance View Management =====
let currentAttendanceView = 'monthly';

function switchAttendanceView(view) {
    currentAttendanceView = view;

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach((btn, idx) => {
        if ((view === 'daily' && idx === 0) || (view === 'monthly' && idx === 1) || (view === 'yearly' && idx === 2)) {
            btn.style.background = 'var(--blue)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'var(--fill-secondary)';
            btn.style.color = 'var(--text-primary)';
        }
    });

    document.getElementById('dailyView').style.display = 'none';
    document.getElementById('monthlyView').style.display = 'none';
    document.getElementById('yearlyView').style.display = 'none';

    if (view === 'daily') {
        document.getElementById('dailyView').style.display = 'block';
        document.getElementById('attendanceSubtitle').textContent = 'View daily attendance';
        loadDailyAttendance();
    } else if (view === 'monthly') {
        document.getElementById('monthlyView').style.display = 'block';
        const month = document.getElementById('monthlyMonth').value;
        const year = document.getElementById('monthlyYear').value;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        document.getElementById('attendanceSubtitle').textContent = `${monthNames[month - 1]} ${year}`;
        loadMonthlyAttendance();
    } else if (view === 'yearly') {
        document.getElementById('yearlyView').style.display = 'block';
        const year = document.getElementById('yearlyYear').value;
        document.getElementById('attendanceSubtitle').textContent = `Year ${year}`;
        loadYearlyAttendance();
    }
}

function loadDailyAttendance() {
    const date = document.getElementById('dailyDate')?.value || new Date().toISOString().split('T')[0];
    const tbody = document.getElementById('dailyTableBody');

    tbody.innerHTML = '<tr><td colspan="11" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    fetch(`/api/student/attendance/daily?date=${date}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attendance && data.attendance.length > 0) {
                const getStatusBadge = (status) => {
                    if (!status || status === null) return '<span class="badge bg-secondary" style="padding: 4px 8px; border-radius: 4px; background: var(--fill-secondary); color: var(--text-secondary); font-size: 12px;">-</span>';
                    if (status === 'present') return '<span class="badge bg-success" style="padding: 4px 8px; border-radius: 4px; background: var(--green); color: white; font-size: 12px;">P</span>';
                    if (status === 'absent') return '<span class="badge bg-danger" style="padding: 4px 8px; border-radius: 4px; background: var(--red); color: white; font-size: 12px;">A</span>';
                    if (status === 'holiday') return '<span class="badge bg-primary" style="padding: 4px 8px; border-radius: 4px; background: var(--blue); color: white; font-size: 12px;">H</span>';
                    return '<span class="badge bg-secondary" style="padding: 4px 8px; border-radius: 4px; background: var(--fill-secondary); color: var(--text-secondary); font-size: 12px;">-</span>';
                };

                let html = '';
                data.attendance.forEach(record => {
                    const dateObj = new Date(record.date);
                    let dailyTotal = 0;

                    ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3'].forEach(slot => {
                        if (record[slot] === 'present') dailyTotal++;
                    });

                    html += `
                        <tr>
                            <td><strong>${dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></td>
                            <td>${getStatusBadge(record.slot1)}</td>
                            <td>${getStatusBadge(record.slot2)}</td>
                            <td>${getStatusBadge(record.slot3)}</td>
                            <td>${getStatusBadge(record.slot4)}</td>
                            <td>${getStatusBadge(record.slot5)}</td>
                            <td>${getStatusBadge(record.slot6)}</td>
                            <td>${getStatusBadge(record.lab1)}</td>
                            <td>${getStatusBadge(record.lab2)}</td>
                            <td>${getStatusBadge(record.lab3)}</td>
                            <td><strong style="color: ${dailyTotal > 0 ? 'var(--green)' : 'var(--red)'}">${dailyTotal}</strong></td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            } else {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 48px;"><i class="fas fa-calendar-check" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i><p style="color: var(--text-secondary);">No attendance for this date</p></td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading daily attendance:', error);
            tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--red);">Error loading data</td></tr>';
        });
}

function loadMonthlyAttendance() {
    const month = document.getElementById('monthlyMonth')?.value || new Date().getMonth() + 1;
    const year = document.getElementById('monthlyYear')?.value || new Date().getFullYear();
    const tbody = document.getElementById('monthlyTableBody');

    tbody.innerHTML = '<tr><td colspan="11" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('attendanceSubtitle').textContent = `${monthNames[month - 1]} ${year}`;

    fetch(`/api/student/attendance/monthly?month=${month}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attendance && data.attendance.length > 0) {
                const getStatusBadge = (status) => {
                    if (!status || status === null) return '<span class="badge bg-secondary" style="padding: 4px 8px; border-radius: 4px; background: var(--fill-secondary); color: var(--text-secondary); font-size: 12px;">-</span>';
                    if (status === 'present') return '<span class="badge bg-success" style="padding: 4px 8px; border-radius: 4px; background: var(--green); color: white; font-size: 12px;">P</span>';
                    if (status === 'absent') return '<span class="badge bg-danger" style="padding: 4px 8px; border-radius: 4px; background: var(--red); color: white; font-size: 12px;">A</span>';
                    if (status === 'holiday') return '<span class="badge bg-primary" style="padding: 4px 8px; border-radius: 4px; background: var(--blue); color: white; font-size: 12px;">H</span>';
                    return '<span class="badge bg-secondary" style="padding: 4px 8px; border-radius: 4px; background: var(--fill-secondary); color: var(--text-secondary); font-size: 12px;">-</span>';
                };

                let html = '';
                data.attendance.forEach(record => {
                    const dateObj = new Date(record.date);
                    let dailyTotal = 0;

                    ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'lab1', 'lab2', 'lab3'].forEach(slot => {
                        if (record[slot] === 'present') dailyTotal++;
                    });

                    html += `
                        <tr>
                            <td><strong>${dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></td>
                            <td>${getStatusBadge(record.slot1)}</td>
                            <td>${getStatusBadge(record.slot2)}</td>
                            <td>${getStatusBadge(record.slot3)}</td>
                            <td>${getStatusBadge(record.slot4)}</td>
                            <td>${getStatusBadge(record.slot5)}</td>
                            <td>${getStatusBadge(record.slot6)}</td>
                            <td>${getStatusBadge(record.lab1)}</td>
                            <td>${getStatusBadge(record.lab2)}</td>
                            <td>${getStatusBadge(record.lab3)}</td>
                            <td><strong style="color: ${dailyTotal > 0 ? 'var(--green)' : 'var(--red)'}">${dailyTotal}</strong></td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            } else {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 48px;"><i class="fas fa-calendar-check" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i><p style="color: var(--text-secondary);">No attendance for this month</p></td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading monthly attendance:', error);
            tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--red);">Error loading data</td></tr>';
        });
}

function loadYearlyAttendance() {
    const year = document.getElementById('yearlyYear')?.value || new Date().getFullYear();
    const tbody = document.getElementById('yearlyTableBody');

    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    document.getElementById('attendanceSubtitle').textContent = `Year ${year}`;

    fetch(`/api/student/attendance/yearly?year=${year}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.yearly) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

                let html = '';
                let hasData = false;

                monthNames.forEach((monthName, idx) => {
                    const percentage = data.yearly[monthKeys[idx]];
                    if (percentage !== null && percentage !== undefined) {
                        hasData = true;
                        let color = 'var(--red)';
                        if (percentage >= 75) color = 'var(--green)';
                        else if (percentage >= 60) color = 'var(--orange)';

                        html += `
                            <tr>
                                <td><strong>${monthName}</strong></td>
                                <td><strong style="color: ${color}">${percentage}%</strong></td>
                            </tr>
                        `;
                    } else {
                        html += `
                            <tr>
                                <td><strong>${monthName}</strong></td>
                                <td style="color: var(--text-tertiary);">-</td>
                            </tr>
                        `;
                    }
                });

                tbody.innerHTML = html;

                if (!hasData) {
                    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; padding: 48px;"><i class="fas fa-calendar-check" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i><p style="color: var(--text-secondary);">No attendance for this year</p></td></tr>';
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; padding: 48px;"><i class="fas fa-calendar-check" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i><p style="color: var(--text-secondary);">No attendance for this year</p></td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading yearly attendance:', error);
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--red);">Error loading data</td></tr>';
        });
}

function loadAvailableYears() {
    fetch('/api/student/attendance/years')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.years) {
                const monthlyYearSelect = document.getElementById('monthlyYear');
                const yearlyYearSelect = document.getElementById('yearlyYear');
                const currentYear = new Date().getFullYear();

                if (monthlyYearSelect) {
                    monthlyYearSelect.innerHTML = '';
                    data.years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === currentYear) option.selected = true;
                        monthlyYearSelect.appendChild(option);
                    });
                }

                if (yearlyYearSelect) {
                    yearlyYearSelect.innerHTML = '';
                    data.years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === currentYear) option.selected = true;
                        yearlyYearSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(error => console.error('Error loading years:', error));
}

function loadAttendanceHistory() {
    const now = new Date();
    const monthSelect = document.getElementById('monthlyMonth');
    if (monthSelect) {
        monthSelect.value = now.getMonth() + 1;
    }

    const dailyDateInput = document.getElementById('dailyDate');
    if (dailyDateInput) {
        dailyDateInput.value = now.toISOString().split('T')[0];
    }

    loadAvailableYears();

    setTimeout(() => {
        loadMonthlyAttendance();
    }, 500);
}

// Load all data on page load
window.addEventListener('DOMContentLoaded', function () {
    loadStudentProfile();
    loadAttendanceStats();
    loadRecentAttendance();
    loadAttendanceHistory();

    document.getElementById('dailyDate')?.addEventListener('change', loadDailyAttendance);
    document.getElementById('monthlyMonth')?.addEventListener('change', loadMonthlyAttendance);
    document.getElementById('monthlyYear')?.addEventListener('change', loadMonthlyAttendance);
    document.getElementById('yearlyYear')?.addEventListener('change', loadYearlyAttendance);
});
