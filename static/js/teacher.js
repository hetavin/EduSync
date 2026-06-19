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

        // Initialize attendance system when tab is switched
        if (targetTab === 'attendance') {
            setTimeout(initAttendanceSystem, 100);
        }
    });
});

// ===== Student Database =====
const studentDatabase = [
    { id: 'STU001', name: 'John Doe', img: 'John+Doe' },
    { id: 'STU002', name: 'Jane Smith', img: 'Jane+Smith' },
    { id: 'STU003', name: 'Mike Johnson', img: 'Mike+Johnson' },
    { id: 'STU004', name: 'Emily Brown', img: 'Emily+Brown' },
    { id: 'STU005', name: 'David Lee', img: 'David+Lee' },
    { id: 'STU006', name: 'Sarah Davis', img: 'Sarah+Davis' },
    { id: 'STU007', name: 'Tom Martin', img: 'Tom+Martin' },
    { id: 'STU008', name: 'Lisa Anderson', img: 'Lisa+Anderson' }
];

// ===== New Attendance System =====
let uploadedImages = [];

function initAttendanceSystem() {
    const attendanceDate = document.getElementById('attendanceDate');
    const attendanceSlot = document.getElementById('attendanceSlot');
    const uploadZone = document.getElementById('uploadZone');
    const groupImages = document.getElementById('groupImages');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const previewGrid = document.getElementById('previewGrid');
    const imageCount = document.getElementById('imageCount');
    const clearImages = document.getElementById('clearImages');
    const processBtn = document.getElementById('processBtn');
    const resultsSection = document.getElementById('resultsSection');

    if (!uploadZone || !groupImages) return;

    // Set today's date
    if (attendanceDate) attendanceDate.valueAsDate = new Date();

    // Form validity check
    function checkFormValidity() {
        const isValid = attendanceDate && attendanceDate.value && attendanceSlot && attendanceSlot.value && uploadedImages.length > 0;
        if (processBtn) processBtn.disabled = !isValid;
    }

    // Handle image upload
    function handleImageUpload(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push({
                    file: file,
                    url: e.target.result,
                    name: file.name
                });
                updateImagePreview();
                checkFormValidity();
            };
            reader.readAsDataURL(file);
        });
    }

    // Update image preview
    function updateImagePreview() {
        if (!imagePreviewContainer || !previewGrid || !imageCount) return;
        
        if (uploadedImages.length === 0) {
            imagePreviewContainer.style.display = 'none';
            return;
        }
        
        imagePreviewContainer.style.display = 'block';
        imageCount.textContent = uploadedImages.length;
        
        previewGrid.innerHTML = uploadedImages.map((img, index) => `
            <div class="preview-item">
                <img src="${img.url}" alt="${img.name}">
                <button class="remove-image-btn" onclick="removeImageFromList(${index})" type="button">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-name">${img.name}</div>
            </div>
        `).join('');
    }

    // Remove existing event listeners by cloning
    const newUploadZone = uploadZone.cloneNode(true);
    uploadZone.parentNode.replaceChild(newUploadZone, uploadZone);
    
    const newGroupImages = groupImages.cloneNode(true);
    groupImages.parentNode.replaceChild(newGroupImages, groupImages);

    // Get new references
    const freshUploadZone = document.getElementById('uploadZone');
    const freshGroupImages = document.getElementById('groupImages');

    // Click to upload
    freshUploadZone.addEventListener('click', function(e) {
        freshGroupImages.click();
    });

    // Drag over
    freshUploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        freshUploadZone.classList.add('drag-over');
    });

    // Drag leave
    freshUploadZone.addEventListener('dragleave', function(e) {
        freshUploadZone.classList.remove('drag-over');
    });

    // Drop
    freshUploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        freshUploadZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            handleImageUpload(files);
            showToast(`${files.length} image(s) uploaded`, 'success');
            
            // Auto-start face detection after drag & drop
            setTimeout(() => {
                const currentDate = document.getElementById('attendanceDate');
                const currentSlot = document.getElementById('attendanceSlot');
                
                if (currentDate.value && currentSlot.value) {
                    showToast('Starting face detection...', 'info');
                    setTimeout(() => {
                        startFaceDetection();
                    }, 500);
                }
            }, 300);
        }
    });

    // File input change
    freshGroupImages.addEventListener('change', function(e) {
        const files = Array.from(this.files);
        if (files.length > 0) {
            handleImageUpload(files);
            showToast(`${files.length} image(s) selected`, 'success');
            
            // Auto-start face detection after image selection
            setTimeout(() => {
                const currentDate = document.getElementById('attendanceDate');
                const currentSlot = document.getElementById('attendanceSlot');
                
                if (currentDate.value && currentSlot.value) {
                    showToast('Starting face detection...', 'info');
                    setTimeout(() => {
                        startFaceDetection();
                    }, 500);
                }
            }, 300);
        }
    });

    // Date and slot change
    if (attendanceDate) {
        const newAttendanceDate = attendanceDate.cloneNode(true);
        attendanceDate.parentNode.replaceChild(newAttendanceDate, attendanceDate);
        document.getElementById('attendanceDate').addEventListener('change', checkFormValidity);
    }

    if (attendanceSlot) {
        const newAttendanceSlot = attendanceSlot.cloneNode(true);
        attendanceSlot.parentNode.replaceChild(newAttendanceSlot, attendanceSlot);
        document.getElementById('attendanceSlot').addEventListener('change', checkFormValidity);
    }

    // Clear all images
    if (clearImages) {
        const newClearImages = clearImages.cloneNode(true);
        clearImages.parentNode.replaceChild(newClearImages, clearImages);
        document.getElementById('clearImages').addEventListener('click', () => {
            if (confirm('Remove all uploaded images?')) {
                uploadedImages = [];
                freshGroupImages.value = '';
                updateImagePreview();
                checkFormValidity();
                showToast('All images cleared', 'info');
            }
        });
    }

    // Process attendance - Face Detection
    function startFaceDetection() {
        const currentDate = document.getElementById('attendanceDate');
        const currentSlot = document.getElementById('attendanceSlot');
        
        if (!currentDate.value || !currentSlot.value || uploadedImages.length === 0) {
            showToast('Please complete all steps', 'error');
            return;
        }
        
        showToast('Detecting faces in images...', 'info');
        const btn = document.getElementById('processBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting Faces...';
        }
        
        // Simulate face detection process
        setTimeout(() => {
            const detectedStudents = detectFacesInImages(uploadedImages);
            displayResults(detectedStudents);
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Start Facial Recognition';
            }
            showToast(`${detectedStudents.filter(s => s.status === 'present').length} faces detected!`, 'success');
        }, 2500);
    }

    // Process attendance button - Face Detection
    if (processBtn) {
        const newProcessBtn = processBtn.cloneNode(true);
        processBtn.parentNode.replaceChild(newProcessBtn, processBtn);
        document.getElementById('processBtn').addEventListener('click', () => {
            startFaceDetection();
        });
    }

    // Cancel results
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        document.getElementById('cancelBtn').addEventListener('click', () => {
            if (confirm('Discard attendance results?')) {
                const results = document.getElementById('resultsSection');
                const step3Card = document.querySelector('#attendance .attendance-card:nth-child(3)');
                
                if (results) results.style.display = 'none';
                if (step3Card) step3Card.style.display = 'block';
                
                uploadedImages = [];
                freshGroupImages.value = '';
                updateImagePreview();
                checkFormValidity();
                showToast('Results discarded', 'info');
            }
        });
    }

    // Submit attendance
    const submitAttendance = document.getElementById('submitAttendance');
    if (submitAttendance) {
        const newSubmitAttendance = submitAttendance.cloneNode(true);
        submitAttendance.parentNode.replaceChild(newSubmitAttendance, submitAttendance);
        document.getElementById('submitAttendance').addEventListener('click', () => {
            const currentDate = document.getElementById('attendanceDate');
            const currentSlot = document.getElementById('attendanceSlot');
            const presentCount = document.getElementById('presentCount').textContent;
            
            if (confirm(`Submit attendance for ${presentCount} students on ${currentDate.value} (${currentSlot.options[currentSlot.selectedIndex].text})?`)) {
                showToast('Attendance submitted successfully!', 'success');
                
                setTimeout(() => {
                    const results = document.getElementById('resultsSection');
                    const step3Card = document.querySelector('#attendance .attendance-card:nth-child(3)');
                    
                    if (results) results.style.display = 'none';
                    if (step3Card) step3Card.style.display = 'block';
                    
                    uploadedImages = [];
                    freshGroupImages.value = '';
                    currentSlot.value = '';
                    updateImagePreview();
                    checkFormValidity();
                    document.querySelector('[data-tab="students"]').click();
                }, 1500);
            }
        });
    }
}

// Simulate face detection from images
function detectFacesInImages(images) {
    // Simulate detecting random number of students from each image
    const detectedStudents = [];
    const detectedIds = new Set();
    
    images.forEach((img, imgIndex) => {
        // Simulate 2-4 faces per image
        const facesInImage = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < facesInImage; i++) {
            const availableStudents = studentDatabase.filter(s => !detectedIds.has(s.id));
            if (availableStudents.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * availableStudents.length);
            const student = availableStudents[randomIndex];
            
            detectedStudents.push({
                ...student,
                status: 'present',
                detectedIn: img.name,
                confidence: (Math.random() * 10 + 90).toFixed(1) + '%'
            });
            
            detectedIds.add(student.id);
        }
    });
    
    // Add some absent students
    const absentStudents = studentDatabase.filter(s => !detectedIds.has(s.id));
    absentStudents.forEach(student => {
        detectedStudents.push({
            ...student,
            status: 'absent',
            detectedIn: 'N/A',
            confidence: 'N/A'
        });
    });
    
    return detectedStudents;
}

// Remove image (global function)
window.removeImageFromList = function(index) {
    uploadedImages.splice(index, 1);
    
    const groupImages = document.getElementById('groupImages');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const previewGrid = document.getElementById('previewGrid');
    const imageCount = document.getElementById('imageCount');
    const processBtn = document.getElementById('processBtn');
    const attendanceDate = document.getElementById('attendanceDate');
    const attendanceSlot = document.getElementById('attendanceSlot');
    
    if (groupImages) groupImages.value = '';
    
    if (uploadedImages.length === 0) {
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    } else {
        if (imageCount) imageCount.textContent = uploadedImages.length;
        if (previewGrid) {
            previewGrid.innerHTML = uploadedImages.map((img, idx) => `
                <div class="preview-item">
                    <img src="${img.url}" alt="${img.name}">
                    <button class="remove-image-btn" onclick="removeImageFromList(${idx})" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-name">${img.name}</div>
                </div>
            `).join('');
        }
    }
    
    if (processBtn && attendanceDate && attendanceSlot) {
        const isValid = attendanceDate.value && attendanceSlot.value && uploadedImages.length > 0;
        processBtn.disabled = !isValid;
    }
    
    showToast('Image removed', 'info');
}

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const step3Card = document.querySelector('#attendance .attendance-card:nth-child(3)');
    
    if (!resultsSection) return;
    
    // Hide Step 3 section when displaying results
    if (step3Card) {
        step3Card.style.display = 'none';
    }
    
    resultsSection.style.display = 'block';
    
    const presentCount = results.filter(s => s.status === 'present').length;
    const absentCount = results.filter(s => s.status === 'absent').length;
    
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = results.map(student => `
        <div class="result-item">
            <div class="result-info">
                <img src="https://ui-avatars.com/api/?name=${student.img}&background=random&color=fff" 
                     alt="${student.name}" 
                     class="result-avatar">
                <div class="result-details">
                    <h4>${student.name}</h4>
                    <p>${student.id}</p>
                    ${student.status === 'present' ? `<span class="detected-info"><i class="fas fa-image"></i> Detected in: ${student.detectedIn} (${student.confidence})</span>` : ''}
                </div>
            </div>
            <span class="result-status ${student.status}">${student.status.toUpperCase()}</span>
        </div>
    `).join('');
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Initialize attendance system on load
    initAttendanceSystem();
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

console.log('EduSync Teacher Portal loaded! 👨🏫');
