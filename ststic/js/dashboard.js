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
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark');
        themeToggle.checked = true;
    }
}

// Theme toggle event
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
    
    // Hamburger animation
    this.classList.toggle('active');
});

// Close sidebar when clicking overlay
mobileOverlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
});

// ===== Tab Navigation System =====
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

// Close sidebar when resizing to desktop
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

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Search Functionality =====
const searchInput = document.querySelector('.search-container input');
const tableRows = document.querySelectorAll('.data-table tbody tr');

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow && searchTerm) {
                row.style.animation = 'fadeIn 0.3s ease';
            }
        });
        
        // Show "no results" message if needed
        const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
        if (visibleRows.length === 0 && searchTerm) {
            console.log('No results found');
        }
    });
}

// ===== Camera Recognition =====
const startBtn = document.querySelector('.btn-primary');
const cameraIcon = document.querySelector('.camera-icon i');
const cameraStatus = document.querySelector('.camera-status');
let isRecognizing = false;

if (startBtn && cameraIcon && cameraStatus) {
    startBtn.addEventListener('click', function() {
        if (!isRecognizing) {
            // Start recognition
            isRecognizing = true;
            this.disabled = true;
            this.style.opacity = '0.6';
            
            cameraIcon.className = 'fas fa-spinner fa-spin';
            cameraStatus.textContent = 'Initializing camera...';
            
            setTimeout(() => {
                cameraIcon.className = 'fas fa-camera-retro';
                cameraStatus.textContent = 'Recognition active - Ready to scan';
                cameraStatus.style.color = 'var(--green)';
                
                this.innerHTML = '<i class="fas fa-stop"></i> Stop Recognition';
                this.disabled = false;
                this.style.opacity = '1';
                this.style.background = 'var(--red)';
            }, 2000);
        } else {
            // Stop recognition
            isRecognizing = false;
            this.disabled = true;
            this.style.opacity = '0.6';
            
            cameraIcon.className = 'fas fa-spinner fa-spin';
            cameraStatus.textContent = 'Stopping camera...';
            
            setTimeout(() => {
                cameraIcon.className = 'fas fa-camera';
                cameraStatus.textContent = 'Awaiting facial recognition...';
                cameraStatus.style.color = '';
                
                this.innerHTML = '<i class="fas fa-play"></i> Start Recognition';
                this.disabled = false;
                this.style.opacity = '1';
                this.style.background = 'var(--blue)';
            }, 1500);
        }
    });
}

// ===== Export Button =====
const exportBtn = document.querySelector('.btn-secondary');
if (exportBtn && exportBtn.textContent.includes('Export')) {
    exportBtn.addEventListener('click', function() {
        const originalHTML = this.innerHTML;
        const originalBg = this.style.background;
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        this.disabled = true;
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Exported!';
            this.style.background = 'var(--green)';
            this.style.color = 'white';
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = originalBg;
                this.style.color = '';
                this.disabled = false;
            }, 2000);
        }, 1500);
    });
}

// ===== Notification Button =====
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
        // Add animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
        
        // Here you would show notification dropdown
        console.log('Notifications clicked');
    });
}

// ===== Profile Menu =====
const profileMenu = document.querySelector('.profile-menu');
if (profileMenu) {
    profileMenu.addEventListener('click', function() {
        // Here you would show profile dropdown
        console.log('Profile menu clicked');
    });
}

// ===== Table Row Actions =====
const actionButtons = document.querySelectorAll('.data-table .btn-icon');
actionButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        const studentName = row.querySelector('.student-name').textContent;
        
        console.log('Action clicked for:', studentName);
        
        // Add ripple effect
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

// ===== Card Animations on Load =====
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
    
    // Animate table rows
    setTimeout(() => {
        tableRows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 80);
        });
    }, 400);
    
    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 600);
    });
});

// ===== Real-time Clock (Optional) =====
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Update any time displays
    const timeElements = document.querySelectorAll('[data-time]');
    timeElements.forEach(el => {
        el.textContent = timeString;
    });
}

updateTime();
setInterval(updateTime, 60000);

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput?.focus();
    }
    
    // Ctrl/Cmd + D for dark mode toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        themeToggle.click();
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// ===== Smooth Stat Updates (Demo) =====
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// ===== Intersection Observer for Lazy Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// ===== Toast Notifications (Optional) =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    
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

// ===== Initialize =====
console.log('EduSync Dashboard loaded successfully! 🎓');
console.log('Theme:', body.classList.contains('dark') ? 'Dark' : 'Light');
console.log('Keyboard shortcuts: Cmd/Ctrl+K (Search), Cmd/Ctrl+D (Toggle theme)');

// ===== File Upload Handling =====
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const uploadBtn = document.getElementById('uploadBtn');
const studentTableBody = document.getElementById('studentTableBody');
const studentCount = document.getElementById('studentCount');
const exportTableBtn = document.getElementById('exportTable');
const studentSearch = document.getElementById('studentSearch');
const filterBtn = document.getElementById('filterBtn');
const filterMenu = document.getElementById('filterMenu');
const filterBatch = document.getElementById('filterBatch');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');

let currentFile = null;
let studentData = [];
let activeFilters = {
    batch: ''
};

if (uploadArea && fileInput) {
    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Remove file button
    removeFileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFileUpload();
    });

    // Upload button
    uploadBtn?.addEventListener('click', () => {
        if (currentFile) {
            processFile(currentFile);
        }
    });
}

// Handle file selection
function handleFileSelect(file) {
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
        showToast('Please select a valid Excel or CSV file', 'error');
        return;
    }

    currentFile = file;
    fileName.textContent = file.name;
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    uploadBtn.style.display = 'block';
}

// Reset file upload
function resetFileUpload() {
    currentFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    uploadBtn.style.display = 'none';
}

// Process uploaded file
function processFile(file) {
    const reader = new FileReader();
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    reader.onload = function(e) {
        try {
            let data = [];
            
            if (fileExt === '.csv') {
                data = parseCSV(e.target.result);
            } else {
                // For Excel files, you'd need a library like xlsx/SheetJS
                // This is a placeholder - add SheetJS library to parse Excel
                showToast('Excel parsing requires SheetJS library. Use CSV for now.', 'warning');
                resetFileUpload();
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Process';
                return;
            }

            if (data.length > 0) {
                studentData = data;
                populateFilters(data);
                displayStudents(data);
                showToast(`Successfully loaded ${data.length} students`, 'success');
                resetFileUpload();
            } else {
                showToast('No valid data found in file', 'error');
            }
        } catch (error) {
            showToast('Error processing file: ' + error.message, 'error');
        }
        
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Process';
    };

    if (fileExt === '.csv') {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

// Parse CSV file
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 6) {
            data.push({
                enrollment: values[0] || '',
                name: values[1] || '',
                email: values[2] || '',
                phone: values[3] || '',
                batch: values[4] || '',
                semester: values[5] || ''
            });
        }
    }

    return data;
}

// Populate filter dropdowns
function populateFilters(data) {
    const batches = [...new Set(data.map(s => s.batch))].sort();
    
    filterBatch.innerHTML = '<option value="">All Batches</option>';
    batches.forEach(batch => {
        if (batch) {
            const option = document.createElement('option');
            option.value = batch;
            option.textContent = batch;
            filterBatch.appendChild(option);
        }
    });
}

// Display students in table with filters applied
function displayStudents(data) {
    studentTableBody.innerHTML = '';
    
    let filteredData = data;
    
    // Apply filters
    if (activeFilters.batch) {
        filteredData = filteredData.filter(s => s.batch === activeFilters.batch);
    }
    
    if (filteredData.length === 0) {
        studentTableBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-secondary);">
                    <i class="fas fa-filter" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.3;"></i>
                    <p>No students match the selected filters</p>
                    <p style="font-size: 13px; margin-top: 8px;">Try adjusting your filter criteria</p>
                </td>
            </tr>
        `;
        studentCount.textContent = '0';
        return;
    }
    
    filteredData.forEach((student, index) => {
        const originalIndex = data.indexOf(student);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="student-id">${student.enrollment}</span></td>
            <td><span class="student-name">${student.name}</span></td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.batch}</td>
            <td>${student.semester}</td>
            <td>
                <button class="btn-icon" onclick="editStudent(${originalIndex})" aria-label="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteStudent(${originalIndex})" aria-label="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        row.dataset.index = originalIndex;
        studentTableBody.appendChild(row);
    });
    
    studentCount.textContent = filteredData.length;
}

// Filter button toggle
if (filterBtn) {
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterMenu.classList.toggle('active');
    });
}

// Close filter menu when clicking outside
document.addEventListener('click', (e) => {
    if (filterMenu && !filterMenu.contains(e.target) && e.target !== filterBtn) {
        filterMenu.classList.remove('active');
    }
});

// Apply filters
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        activeFilters.batch = filterBatch.value;
        displayStudents(studentData);
        filterMenu.classList.remove('active');
        
        if (activeFilters.batch) {
            filterBtn.style.color = 'var(--blue)';
            showToast('Filter applied', 'success');
        }
    });
}

// Clear filters
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        activeFilters.batch = '';
        filterBatch.value = '';
        displayStudents(studentData);
        filterBtn.style.color = '';
        showToast('Filter cleared', 'info');
    });
}

// Search students
if (studentSearch) {
    studentSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = studentTableBody.querySelectorAll('tr:not(.no-data-row)');
        
        let visibleCount = 0;
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        // Update count display
        if (searchTerm && visibleCount === 0 && rows.length > 0) {
            if (!studentTableBody.querySelector('.no-results-row')) {
                const noResultsRow = document.createElement('tr');
                noResultsRow.className = 'no-results-row';
                noResultsRow.innerHTML = `
                    <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        <i class="fas fa-search" style="font-size: 36px; margin-bottom: 12px; display: block; opacity: 0.3;"></i>
                        <p>No students found matching "${searchTerm}"</p>
                    </td>
                `;
                studentTableBody.appendChild(noResultsRow);
            }
        } else {
            const noResultsRow = studentTableBody.querySelector('.no-results-row');
            if (noResultsRow) {
                noResultsRow.remove();
            }
        }
    });
}

// Export table data
if (exportTableBtn) {
    exportTableBtn.addEventListener('click', () => {
        if (studentData.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const csv = convertToCSV(studentData);
        downloadCSV(csv, 'students_export.csv');
        showToast('Data exported successfully', 'success');
    });
}

// Convert data to CSV
function convertToCSV(data) {
    const headers = ['Enrollment Number', 'Name', 'Email', 'Phone Number', 'Batch', 'Semester'];
    const rows = data.map(s => `${s.enrollment},${s.name},${s.email},${s.phone},${s.batch},${s.semester}`);
    return [headers.join(','), ...rows].join('\n');
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Edit student
window.editStudent = function(index) {
    const student = studentData[index];
    showToast(`Edit functionality for ${student.name}`, 'info');
};

// Delete student
window.deleteStudent = function(index) {
    if (confirm('Are you sure you want to delete this student?')) {
        studentData.splice(index, 1);
        populateFilters(studentData);
        displayStudents(studentData);
        showToast('Student deleted successfully', 'success');
    }
};

// ===== Faculty/Mentor Management =====
const facultyForm = document.getElementById('facultyForm');
const facultyType = document.getElementById('facultyType');
const facultyName = document.getElementById('facultyName');
const facultyEmail = document.getElementById('facultyEmail');
const facultyProfession = document.getElementById('facultyProfession');
const facultyClass = document.getElementById('facultyClass');
const classGroup = document.getElementById('classGroup');
const facultyGrid = document.getElementById('facultyGrid');
const facultyCount = document.getElementById('facultyCount');
const facultySearch = document.getElementById('facultySearch');
const facultyFilterBtn = document.getElementById('facultyFilterBtn');
const facultyFilterMenu = document.getElementById('facultyFilterMenu');
const filterFacultyType = document.getElementById('filterFacultyType');
const applyFacultyFiltersBtn = document.getElementById('applyFacultyFilters');
const clearFacultyFiltersBtn = document.getElementById('clearFacultyFilters');
const exportFacultyBtn = document.getElementById('exportFaculty');

let facultyData = [];
let activeFacultyFilter = '';

// Show/hide class field based on type
if (facultyType) {
    facultyType.addEventListener('change', () => {
        if (facultyType.value === 'mentor') {
            classGroup.style.display = 'block';
            facultyClass.required = true;
        } else {
            classGroup.style.display = 'none';
            facultyClass.required = false;
            facultyClass.value = '';
        }
    });
}

// Add faculty/mentor form submission
if (facultyForm) {
    facultyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newFaculty = {
            type: facultyType.value,
            name: facultyName.value.trim(),
            email: facultyEmail.value.trim(),
            profession: facultyProfession.value.trim(),
            class: facultyType.value === 'mentor' ? facultyClass.value.trim() : ''
        };
        
        facultyData.push(newFaculty);
        displayFaculty(facultyData);
        facultyForm.reset();
        classGroup.style.display = 'none';
        showToast(`${newFaculty.type === 'mentor' ? 'Mentor' : 'Faculty'} added successfully`, 'success');
    });
}

// Display faculty/mentors
function displayFaculty(data) {
    facultyGrid.innerHTML = '';
    
    let filteredData = data;
    
    // Apply filter
    if (activeFacultyFilter) {
        filteredData = filteredData.filter(f => f.type === activeFacultyFilter);
    }
    
    if (filteredData.length === 0) {
        facultyGrid.innerHTML = `
            <div class="no-faculty-message">
                <i class="fas fa-user-tie" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                <p>No ${activeFacultyFilter ? activeFacultyFilter : 'faculty or mentor'} found</p>
                <p style="font-size: 13px; margin-top: 8px; color: var(--text-secondary);">Add your first ${activeFacultyFilter || 'faculty or mentor'} using the form above</p>
            </div>
        `;
        facultyCount.textContent = '0';
        return;
    }
    
    const colors = ['007AFF', '34C759', 'FF9500', '5856D6', 'FF3B30', 'FF2D55', '32ADE6'];
    
    filteredData.forEach((faculty, index) => {
        const originalIndex = data.indexOf(faculty);
        const color = colors[index % colors.length];
        const card = document.createElement('div');
        card.className = 'faculty-card';
        card.innerHTML = `
            <span class="faculty-type-badge ${faculty.type}">${faculty.type}</span>
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=${color}&color=fff&size=128" alt="${faculty.name}">
            <h3>${faculty.name}</h3>
            <p class="faculty-role">${faculty.profession}</p>
            ${faculty.class ? `<p class="faculty-class"><i class="fas fa-users"></i> Class: ${faculty.class}</p>` : ''}
            <div class="faculty-contact">
                <span><i class="fas fa-envelope"></i> ${faculty.email}</span>
            </div>
            <div class="faculty-actions">
                <button class="btn-secondary" onclick="editFaculty(${originalIndex})" style="flex: 1;">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn-icon" onclick="deleteFaculty(${originalIndex})" aria-label="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        facultyGrid.appendChild(card);
    });
    
    facultyCount.textContent = filteredData.length;
}

// Search faculty
if (facultySearch) {
    facultySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const cards = facultyGrid.querySelectorAll('.faculty-card');
        
        let visibleCount = 0;
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
    });
}

// Faculty filter toggle
if (facultyFilterBtn) {
    facultyFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        facultyFilterMenu.classList.toggle('active');
    });
}

// Apply faculty filters
if (applyFacultyFiltersBtn) {
    applyFacultyFiltersBtn.addEventListener('click', () => {
        activeFacultyFilter = filterFacultyType.value;
        displayFaculty(facultyData);
        facultyFilterMenu.classList.remove('active');
        
        if (activeFacultyFilter) {
            facultyFilterBtn.style.color = 'var(--blue)';
            showToast('Filter applied', 'success');
        }
    });
}

// Clear faculty filters
if (clearFacultyFiltersBtn) {
    clearFacultyFiltersBtn.addEventListener('click', () => {
        activeFacultyFilter = '';
        filterFacultyType.value = '';
        displayFaculty(facultyData);
        facultyFilterBtn.style.color = '';
        showToast('Filter cleared', 'info');
    });
}

// Export faculty
if (exportFacultyBtn) {
    exportFacultyBtn.addEventListener('click', () => {
        if (facultyData.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        
        const csv = convertFacultyToCSV(facultyData);
        downloadCSV(csv, 'faculty_mentors_export.csv');
        showToast('Data exported successfully', 'success');
    });
}

// Convert faculty to CSV
function convertFacultyToCSV(data) {
    const headers = ['Type', 'Name', 'Email', 'Profession', 'Class'];
    const rows = data.map(f => `${f.type},${f.name},${f.email},${f.profession},${f.class || 'N/A'}`);
    return [headers.join(','), ...rows].join('\n');
}

// Edit faculty
window.editFaculty = function(index) {
    const faculty = facultyData[index];
    showToast(`Edit functionality for ${faculty.name}`, 'info');
};

// Delete faculty
window.deleteFaculty = function(index) {
    if (confirm('Are you sure you want to delete this faculty/mentor?')) {
        facultyData.splice(index, 1);
        displayFaculty(facultyData);
        showToast('Faculty/Mentor deleted successfully', 'success');
    }
};
