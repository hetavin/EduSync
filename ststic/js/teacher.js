// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const mobileOverlay = document.querySelector('.mobile-overlay');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
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

// ===== Attendance System =====
let attendanceActive = false;
let detectedStudents = [];
let selectedClass = '';

const startAttendanceBtn = document.getElementById('startAttendanceBtn');
const classSelect = document.getElementById('classSelect');
const detectedList = document.getElementById('detectedList');
const detectedCount = document.getElementById('detectedCount');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');

// Sample student data
const studentDatabase = {
    'CS-A-3': [
        { id: 'STU001', name: 'John Doe', img: 'John+Doe' },
        { id: 'STU002', name: 'Jane Smith', img: 'Jane+Smith' },
        { id: 'STU004', name: 'Emily Brown', img: 'Emily+Brown' },
        { id: 'STU005', name: 'Michael Wilson', img: 'Michael+Wilson' },
        { id: 'STU006', name: 'Sarah Davis', img: 'Sarah+Davis' }
    ],
    'CS-B-2': [
        { id: 'STU003', name: 'Mike Johnson', img: 'Mike+Johnson' },
        { id: 'STU007', name: 'David Lee', img: 'David+Lee' }
    ],
    'IT-A-3': [
        { id: 'STU008', name: 'Lisa Anderson', img: 'Lisa+Anderson' },
        { id: 'STU009', name: 'Tom Martin', img: 'Tom+Martin' }
    ]
};

// Start/Stop Attendance
startAttendanceBtn.addEventListener('click', function() {
    if (!attendanceActive) {
        selectedClass = classSelect.value;
        if (!selectedClass) {
            showToast('Please select a class first', 'error');
            return;
        }
        
        attendanceActive = true;
        this.innerHTML = '<i class="fas fa-stop"></i> Stop Recognition';
        this.style.background = 'var(--red)';
        
        document.querySelector('.camera-status').textContent = 'Scanning for faces...';
        document.querySelector('.camera-info span').innerHTML = '<i class="fas fa-circle"></i> Scanning';
        document.querySelector('.camera-info').style.color = 'var(--orange)';
        
        classSelect.disabled = true;
        showToast('Attendance started', 'success');
        
        // Simulate face detection
        simulateFaceDetection();
    } else {
        stopAttendance();
    }
});

function stopAttendance() {
    attendanceActive = false;
    startAttendanceBtn.innerHTML = '<i class="fas fa-play"></i> Start Recognition';
    startAttendanceBtn.style.background = 'var(--blue)';
    
    document.querySelector('.camera-status').textContent = 'Camera ready - Select class and click start';
    document.querySelector('.camera-info span').innerHTML = '<i class="fas fa-circle"></i> Ready';
    document.querySelector('.camera-info').style.color = 'var(--green)';
    
    classSelect.disabled = false;
    showToast('Attendance stopped', 'info');
}

// Simulate face detection
function simulateFaceDetection() {
    if (!attendanceActive) return;
    
    const students = studentDatabase[selectedClass];
    if (!students || students.length === 0) return;
    
    const availableStudents = students.filter(s => !detectedStudents.find(d => d.id === s.id));
    if (availableStudents.length === 0) {
        showToast('All students detected!', 'success');
        return;
    }
    
    const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
    const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setTimeout(() => {
        if (attendanceActive) {
            addDetectedStudent(randomStudent);
            simulateFaceDetection();
        }
    }, randomDelay);
}

// Add detected student
function addDetectedStudent(student) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    detectedStudents.push({
        ...student,
        time: time
    });
    
    updateDetectedList();
    showToast(`Detected: ${student.name}`, 'success');
}

// Update detected list UI
function updateDetectedList() {
    if (detectedStudents.length === 0) {
        detectedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No students detected yet</h3>
                <p>Start camera to begin attendance</p>
            </div>
        `;
        clearBtn.disabled = true;
        submitBtn.disabled = true;
        detectedCount.textContent = '0 students marked present';
    } else {
        detectedList.innerHTML = detectedStudents.map(student => `
            <div class="detected-student">
                <img src="https://ui-avatars.com/api/?name=${student.img}&background=random&color=fff" alt="${student.name}">
                <div class="detected-student-info">
                    <h4>${student.name}</h4>
                    <p>${student.id}</p>
                </div>
                <span class="detected-student-time">${student.time}</span>
            </div>
        `).join('');
        
        clearBtn.disabled = false;
        submitBtn.disabled = false;
        detectedCount.textContent = `${detectedStudents.length} student${detectedStudents.length > 1 ? 's' : ''} marked present`;
    }
}

// Clear detected students
clearBtn.addEventListener('click', function() {
    if (confirm('Clear all detected students?')) {
        detectedStudents = [];
        updateDetectedList();
        showToast('Cleared all detections', 'info');
    }
});

// Submit attendance
submitBtn.addEventListener('click', function() {
    if (detectedStudents.length === 0) return;
    
    const className = classSelect.options[classSelect.selectedIndex].text;
    const count = detectedStudents.length;
    
    if (confirm(`Submit attendance for ${count} student${count > 1 ? 's' : ''} in ${className}?`)) {
        console.log('Submitting attendance:', {
            class: selectedClass,
            students: detectedStudents,
            timestamp: new Date().toISOString()
        });
        
        showToast(`Attendance submitted successfully for ${count} student${count > 1 ? 's' : ''}!`, 'success');
        
        // Reset
        detectedStudents = [];
        updateDetectedList();
        stopAttendance();
        classSelect.value = '';
    }
});

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        border-left: 4px solid ${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)'};
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        max-width: 400px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== Animations on Load =====
window.addEventListener('load', function() {
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

// ===== Logout =====
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            showToast('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    });
}

// ===== Escape Key Handler =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// ===== Initialize =====
console.log('EduSync Teacher Portal loaded! 👨‍🏫');
