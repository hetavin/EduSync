// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const mobileOverlay = document.querySelector('.mobile-overlay');

// Check for saved theme preference
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

themeToggle.addEventListener('change', function() {
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

hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    this.classList.toggle('active');
});

mobileOverlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
});

// ===== Tab Navigation =====
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetTab = this.getAttribute('data-tab');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(tab => tab.classList.remove('active'));
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
            targetContent.classList.add('active');
            
            // Animate tab content
            targetContent.style.opacity = '0';
            targetContent.style.transform = 'translateY(10px)';
            setTimeout(() => {
                targetContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }, 10);
        }
        
        // Update page title
        const navText = this.querySelector('span').textContent;
        document.querySelector('.page-title').textContent = navText;
        
        // Close mobile menu
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
window.addEventListener('load', function() {
    // Animate stat cards
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
    
    // Animate attendance items
    const attendanceItems = document.querySelectorAll('.attendance-item');
    attendanceItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 400 + (index * 80));
    });
    
    // Animate progress ring
    const progressRing = document.querySelector('.progress-ring-fill');
    if (progressRing) {
        progressRing.style.strokeDashoffset = '314';
        setTimeout(() => {
            progressRing.style.strokeDashoffset = '23.55';
        }, 800);
    }
});

// ===== Logout Confirmation =====
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/logout';
        }
    });
}

// ===== Notification Button =====
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
        console.log('Notifications clicked');
    });
}

// ===== Export Button =====
const exportBtn = document.querySelector('.btn-secondary');
if (exportBtn && exportBtn.textContent.includes('Export')) {
    exportBtn.addEventListener('click', function() {
        const originalHTML = this.innerHTML;
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        this.disabled = true;
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
            this.style.background = 'var(--green)';
            this.style.color = 'white';
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = '';
                this.style.color = '';
                this.disabled = false;
            }, 2000);
        }, 1500);
    });
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + D for dark mode toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        themeToggle.click();
    }
});

// ===== Smooth Table Row Hover =====
const tableRows = document.querySelectorAll('.data-table tbody tr');
tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.01)';
    });
    
    row.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Schedule Class Hover =====
const scheduleClasses = document.querySelectorAll('.schedule-class');
scheduleClasses.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(4px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Responsive Adjustments =====
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }, 250);
});

// ===== Initialize =====
console.log('EduSync Student Portal loaded! 🎓');
console.log('Welcome, Student!');

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
                
                // Update sidebar profile
                document.getElementById('studentName').textContent = student.name;
                document.getElementById('studentId').textContent = student.enrollment_no;
                
                // Update avatar
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff&size=128`;
                document.getElementById('studentAvatar').src = avatarUrl;
                
                // Update welcome message
                const firstName = student.name.split(' ')[0];
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${firstName}!`;
                
                // Update profile tab - Header
                document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff&size=256`;
                document.getElementById('profileName').textContent = student.name;
                document.getElementById('profileStudentId').textContent = `Student ID: ${student.enrollment_no}`;
                
                // Update personal information
                document.getElementById('infoName').textContent = student.name;
                document.getElementById('infoEmail').textContent = student.email;
                document.getElementById('infoPhone').textContent = student.phone_number;
                document.getElementById('infoEnrollment').textContent = student.enrollment_no;
                
                // Update academic information
                document.getElementById('infoDepartment').textContent = student.department;
                document.getElementById('infoYear').textContent = student.batch;
                document.getElementById('infoSection').textContent = student.class;
            }
        })
        .catch(error => console.error('Error loading profile:', error));
}

function loadAttendanceStats() {
    fetch('/api/student/attendance/stats')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.stats) {
                const stats = data.stats;
                
                // Update dashboard stats
                document.getElementById('overallAttendance').textContent = `${stats.overall_percentage}%`;
                document.getElementById('presentDays').textContent = `${stats.monthly_present} Days`;
                document.getElementById('absentDays').textContent = `${stats.monthly_absent} Days`;
                
                // Update monthly overview
                const now = new Date();
                const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
                document.getElementById('currentMonthYear').textContent = monthYear;
                document.getElementById('monthlyAttendance').textContent = `${stats.monthly_percentage}%`;
                document.getElementById('monthlyPresent').textContent = `Present: ${stats.monthly_present}`;
                document.getElementById('monthlyAbsent').textContent = `Absent: ${stats.monthly_absent}`;
                
                // Update progress circle
                const circumference = 314;
                const offset = circumference - (stats.monthly_percentage / 100) * circumference;
                const progressCircle = document.getElementById('progressCircle');
                if (progressCircle) {
                    progressCircle.style.strokeDashoffset = offset;
                }
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
                
                // Animate items
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

function loadAttendanceHistory() {
    fetch('/api/student/attendance/history')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.history) {
                const tbody = document.getElementById('attendanceHistoryBody');
                
                if (data.history.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 48px;">
                                <i class="fas fa-calendar-check" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px; display: block;"></i>
                                <p style="color: var(--text-secondary);">No attendance history available</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                let html = '';
                data.history.forEach(record => {
                    const statusClass = record.status === 'present' ? 'success' : 'error';
                    const statusText = record.status === 'present' ? 'Present' : 'Absent';
                    const timeLabel = timeSlotLabels[record.time_slot] || record.time_slot;
                    
                    html += `
                        <tr>
                            <td>${record.date}</td>
                            <td>${record.day}</td>
                            <td>${timeLabel}</td>
                            <td>N/A</td>
                            <td>N/A</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;
                });
                
                tbody.innerHTML = html;
            }
        })
        .catch(error => console.error('Error loading attendance history:', error));
}

// Load all data on page load
window.addEventListener('DOMContentLoaded', function() {
    loadStudentProfile();
    loadAttendanceStats();
    loadRecentAttendance();
    loadAttendanceHistory();
});
