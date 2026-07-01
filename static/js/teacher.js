// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const mobileOverlay = document.querySelector('.mobile-overlay');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
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

        // Initialize attendance system when tab is switched
        if (targetTab === 'attendance') {
            setTimeout(initAttendanceSystem, 100);
        }

        // Load students when students tab is opened
        if (targetTab === 'students') {
            // Load daily attendance by default
            setTimeout(() => {
                if (typeof loadTeacherDailyAttendance === 'function') {
                    loadTeacherDailyAttendance();
                }
            }, 100);
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

// ===== Load Batches and Classes =====
let batchClassData = [];

function loadBatchesAndClasses() {

    fetch('/api/teacher/batch-classes')
        .then(response => response.json())
        .then(data => {

            batchClassData = data;

            const batchSelect =
                document.getElementById(
                    'attendanceBatch'
                );

            if (!batchSelect)
                return;

            batchSelect.innerHTML =
                '<option value="">Select batch</option>';

            const uniqueBatches =
                [...new Set(
                    data.map(
                        item => item.batch
                    )
                )];

            uniqueBatches.forEach(
                batch => {

                    const option =
                        document.createElement(
                            'option'
                        );

                    option.value = batch;
                    option.textContent = batch;

                    batchSelect.appendChild(
                        option
                    );

                }
            );

        })
        .catch(error => {

            console.error(
                'Error loading batches:',
                error
            );

        });


}

function loadClassesByBatch(batch) {

    const classSelect =
        document.getElementById(
            'attendanceClass'
        );

    if (!classSelect)
        return;

    classSelect.innerHTML =
        '<option value="">Select class</option>';

    if (!batch)
        return;

    const classes =
        batchClassData
            .filter(
                item =>
                    item.batch === batch
            )
            .map(
                item => item.class
            );

    const uniqueClasses =
        [...new Set(classes)];

    uniqueClasses.forEach(cls => {

        const option =
            document.createElement(
                'option'
            );

        option.value = cls;
        option.textContent = cls;

        classSelect.appendChild(
            option
        );

    });

}

// ===== New Attendance System =====
let uploadedImages = [];

function initAttendanceSystem() {
    const attendanceBatch = document.getElementById('attendanceBatch');
    const attendanceClass = document.getElementById('attendanceClass');
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

    // Load batches and classes
    loadBatchesAndClasses();

    // Set today's date
    if (attendanceDate) attendanceDate.valueAsDate = new Date();

    // Form validity check
    function checkFormValidity() {
        const isValid = attendanceBatch && attendanceBatch.value &&
            attendanceClass && attendanceClass.value &&
            attendanceDate && attendanceDate.value &&
            attendanceSlot && attendanceSlot.value &&
            uploadedImages.length > 0;
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
    freshUploadZone.addEventListener('click', function (e) {
        freshGroupImages.click();
    });

    // Drag over
    freshUploadZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        freshUploadZone.classList.add('drag-over');
    });

    // Drag leave
    freshUploadZone.addEventListener('dragleave', function (e) {
        freshUploadZone.classList.remove('drag-over');
    });

    // Drop
    freshUploadZone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        freshUploadZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            handleImageUpload(files);
            showToast(`${files.length} image(s) uploaded`, 'success');

            // Auto-start face detection after drag & drop
            setTimeout(() => {
                const currentBatch = document.getElementById('attendanceBatch');
                const currentClass = document.getElementById('attendanceClass');
                const currentDate = document.getElementById('attendanceDate');
                const currentSlot = document.getElementById('attendanceSlot');

                if (currentBatch.value && currentClass.value && currentDate.value && currentSlot.value) {
                    showToast('Processing attendance...', 'info');
                    startFaceDetection();
                }
            }, 500);
        }
    });

    // File input change
    freshGroupImages.addEventListener('change', function (e) {
        const files = Array.from(this.files);
        if (files.length > 0) {
            handleImageUpload(files);
            showToast(`${files.length} image(s) selected`, 'success');

            // Auto-start face detection after image selection
            setTimeout(() => {
                const currentBatch = document.getElementById('attendanceBatch');
                const currentClass = document.getElementById('attendanceClass');
                const currentDate = document.getElementById('attendanceDate');
                const currentSlot = document.getElementById('attendanceSlot');

                if (currentBatch.value && currentClass.value && currentDate.value && currentSlot.value) {
                    showToast('Processing attendance...', 'info');
                    startFaceDetection();
                }
            }, 500);
        }
    });

    // Date, batch, class, and slot change
    if (attendanceBatch) {
        const newAttendanceBatch = attendanceBatch.cloneNode(true);
        attendanceBatch.parentNode.replaceChild(newAttendanceBatch, attendanceBatch);
        document.getElementById('attendanceBatch').addEventListener('change', function () {
            loadClassesByBatch(this.value);
            checkFormValidity();
        });
    }

    if (attendanceClass) {
        const newAttendanceClass = attendanceClass.cloneNode(true);
        attendanceClass.parentNode.replaceChild(newAttendanceClass, attendanceClass);
        document.getElementById('attendanceClass').addEventListener('change', checkFormValidity);
    }

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
        const currentBatch = document.getElementById('attendanceBatch');
        const currentClass = document.getElementById('attendanceClass');
        const currentDate = document.getElementById('attendanceDate');
        const currentSlot = document.getElementById('attendanceSlot');

        if (!currentBatch.value || !currentClass.value || !currentDate.value || !currentSlot.value || uploadedImages.length === 0) {
            showToast('Please complete all steps', 'error');
            return;
        }

        showToast('Processing attendance...', 'info');
        const btn = document.getElementById('processBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('batch', currentBatch.value);
        formData.append('class', currentClass.value);
        formData.append('date', currentDate.value);
        formData.append('slot', currentSlot.value);
        
        // Append all images
        uploadedImages.forEach(image => {
            formData.append('images', image.file);
        });

        // Send to backend
        fetch('/teacher/processAttendance', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`✓ Attendance marked! ${data.present_count} students present`, 'success');
                displayBackendResults(data, currentBatch.value, currentClass.value, currentDate.value, currentSlot.value);
                
                // Auto reset after showing results
                setTimeout(() => {
                    if (confirm(`Attendance successfully recorded for ${data.present_count} students. Reset form?`)) {
                        resetAttendanceForm();
                    }
                }, 2000);
            } else {
                showToast(data.message || 'Processing failed', 'error');
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Start Facial Recognition';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error processing attendance', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play-circle"></i> Start Facial Recognition';
            }
        });
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
                resetAttendanceForm();
            }
        });
    }

    // Submit attendance - Keep for manual confirmation if needed
    const submitAttendance = document.getElementById('submitAttendance');
    if (submitAttendance) {
        const newSubmitAttendance = submitAttendance.cloneNode(true);
        submitAttendance.parentNode.replaceChild(newSubmitAttendance, submitAttendance);
        document.getElementById('submitAttendance').addEventListener('click', () => {
            showToast('Attendance already submitted!', 'info');
            resetAttendanceForm();
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
window.removeImageFromList = function (index) {
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

// Display results from backend
function displayBackendResults(data, batch, className, date, slot) {
    const resultsSection = document.getElementById('resultsSection');
    const step3Card = document.querySelector('#attendance .attendance-card:nth-child(3)');

    if (!resultsSection) return;

    if (step3Card) step3Card.style.display = 'none';
    resultsSection.style.display = 'block';

    const presentCount = data.present_count || 0;
    const totalFaces = data.total_faces_detected || 0;

    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = `${totalFaces} faces detected`;

    const resultsList = document.getElementById('resultsList');
    const presentStudents = data.present_students || [];
    
    // Add summary info
    const summaryHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;"><i class="fas fa-check-circle"></i> Attendance Marked Successfully</h3>
            <p style="margin: 5px 0; opacity: 0.9;"><i class="fas fa-calendar"></i> Date: ${date} | Slot: ${slot}</p>
            <p style="margin: 5px 0; opacity: 0.9;"><i class="fas fa-graduation-cap"></i> Batch: ${batch} | Class: ${className}</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold;"><i class="fas fa-users"></i> ${presentCount} Students Present</p>
        </div>
    `;
    
    resultsList.innerHTML = summaryHTML + presentStudents.map(enrollmentNo => `
        <div class="result-item">
            <div class="result-info">
                <img src="https://ui-avatars.com/api/?name=${enrollmentNo}&background=4CAF50&color=fff" 
                     alt="${enrollmentNo}" 
                     class="result-avatar">
                <div class="result-details">
                    <h4>${enrollmentNo}</h4>
                    <p>Enrollment No: ${enrollmentNo}</p>
                    <span class="detected-info"><i class="fas fa-check-circle"></i> Face Recognized & Attendance Marked</span>
                </div>
            </div>
            <span class="result-status present">PRESENT</span>
        </div>
    `).join('');

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Reset attendance form
function resetAttendanceForm() {
    const resultsSection = document.getElementById('resultsSection');
    const step3Card = document.querySelector('#attendance .attendance-card:nth-child(3)');
    const freshGroupImages = document.getElementById('groupImages');
    const currentBatch = document.getElementById('attendanceBatch');
    const currentClass = document.getElementById('attendanceClass');
    const currentDate = document.getElementById('attendanceDate');
    const currentSlot = document.getElementById('attendanceSlot');

    if (resultsSection) resultsSection.style.display = 'none';
    if (step3Card) step3Card.style.display = 'block';

    uploadedImages = [];
    if (freshGroupImages) freshGroupImages.value = '';
    if (currentBatch) currentBatch.selectedIndex = 0;
    if (currentClass) currentClass.innerHTML = '<option value="">Select class</option>';
    if (currentDate) currentDate.valueAsDate = new Date();
    if (currentSlot) currentSlot.value = '';
    
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    
    const processBtn = document.getElementById('processBtn');
    if (processBtn) processBtn.disabled = true;
    
    showToast('Form reset successfully', 'info');
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

// ===== Load Recent Activity =====
function loadRecentActivity() {
    const list = document.getElementById('recentActivity');
    if (!list) return;

    fetch('/api/teacher/recent-activity')
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.activities.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                        <p style="color: var(--text-secondary);">No recent activity</p>
                    </div>`;
                return;
            }

            const slotLabel = s => s.replace('slot', 'Lec ').replace('lab', 'Lab ');
            const statusColor = s => s === 'present' ? 'var(--green)' : 'var(--red)';

            list.innerHTML = data.activities.map(a => `
                <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border-color);">
                    <div style="width:40px;height:40px;border-radius:50%;background:var(--fill-secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fas fa-user-check" style="color:${statusColor(a.status)};"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:14px;">${a.name || a.enrollment_no}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${a.batch}-${a.class} &bull; ${slotLabel(a.time_slot)} &bull; ${a.date}</div>
                    </div>
                    <span style="font-size:12px;font-weight:600;color:${statusColor(a.status)};text-transform:uppercase;">${a.status}</span>
                </div>
            `).join('');
        })
        .catch(() => {
            list.innerHTML = `<p style="color:var(--red);padding:16px;">Failed to load activity</p>`;
        });
}

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

    // Initialize attendance system on load
    initAttendanceSystem();

    // Load recent activity
    loadRecentActivity();
});

// ===== Logout =====
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            showToast('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = '/logout';
            }, 1000);
        }
    });
}

// ===== Escape Key Handler =====
document.addEventListener('keydown', function (e) {
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

console.log('EduSync Teacher Portal loaded! 👨🏫');

// ===== Load Students Attendance =====
function loadStudentsAttendance() {

    const tableBody = document.getElementById("studentsTableBody");
    const batchFilter = document.getElementById("batchFilter");
    const classFilter = document.getElementById("classFilter");

    if (!tableBody) {
        console.error("studentsTableBody not found");
        return;
    }

    const batch = batchFilter?.value || "";
    const className = classFilter?.value || "";

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:40px;">
                <i class="fas fa-spinner fa-spin"></i><br><br>
                Loading attendance...
            </td>
        </tr>
    `;

    let url = '/api/teacher/getattendance';
    const params = [];
    if (batch) params.push(`batch=${encodeURIComponent(batch)}`);
    if (className) params.push(`class=${encodeURIComponent(className)}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response URL:', response.url);
            
            // Clone response to read it twice
            return response.clone().text().then(text => {
                console.log('Response text:', text.substring(0, 200));
                
                // Try to parse as JSON
                try {
                    const data = JSON.parse(text);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${data.message || 'Error'}`);
                    }
                    return data;
                } catch (e) {
                    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                        throw new Error('Received HTML instead of JSON. You may need to log in.');
                    }
                    throw new Error('Invalid JSON response');
                }
            });
        })
        .then(data => {
            console.log('Received data:', data);

            if (!data.success) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;">
                            ${data.message}
                        </td>
                    </tr>
                `;
                return;
            }

            // Populate filters
            if (data.batches && batchFilter && batchFilter.options.length === 1) {
                data.batches.forEach(batch => {
                    const option = document.createElement('option');
                    option.value = batch;
                    option.textContent = batch;
                    batchFilter.appendChild(option);
                });
            }

            if (data.classes && classFilter && classFilter.options.length === 1) {
                data.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls;
                    option.textContent = cls;
                    classFilter.appendChild(option);
                });
            }

            if (data.students.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;padding:40px;">
                            <i class="fas fa-users" style="font-size:48px;opacity:0.3;margin-bottom:16px;display:block;"></i>
                            <p style="color:var(--text-secondary);">No student records found</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = "";

            data.students.forEach(student => {

                const percentage = Number(student.attendance_percentage) || 0;

                let percentageClass = "low";

                if (percentage >= 75)
                    percentageClass = "high";
                else if (percentage >= 60)
                    percentageClass = "medium";

                tableBody.innerHTML += `
                    <tr>

                        <td>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <img
                                    src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff&size=40"
                                    width="40"
                                    height="40"
                                    style="border-radius:50%;">

                                <strong>${student.name}</strong>
                            </div>
                        </td>

                        <td>${student.enrollment_no}</td>

                        <td>
                            <span class="badge badge-info">
                                ${student.batch} - ${student.class}
                            </span>
                        </td>

                        <td>${student.total_classes}</td>

                        <td>
                            <span class="badge badge-success">
                                ${student.present_count}
                            </span>
                        </td>

                        <td>
                            <span class="badge badge-danger">
                                ${student.absent_count}
                            </span>
                        </td>

                        <td>
                            <span class="attendance-percentage ${percentageClass}">
                                <i class="fas fa-chart-line"></i> ${percentage.toFixed(1)}%
                            </span>
                        </td>

                    </tr>
                `;
            });

        })
        .catch(error => {

            console.error('Fetch error:', error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;color:var(--red);padding:40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>
                        <p style="color:var(--text-secondary);">Failed to load attendance</p>
                        <p style="color:var(--text-tertiary);font-size:12px;">${error.message}</p>
                    </td>
                </tr>
            `;
        });
}

// Export student data
function exportStudentData() {
    showToast('Export feature coming soon!', 'info');
}

// Setup filter listeners
window.addEventListener('load', function() {
    const batchFilter = document.getElementById('batchFilter');
    const classFilter = document.getElementById('classFilter');
    
    if (batchFilter) {
        batchFilter.addEventListener('change', loadStudentsAttendance);
    }
    
    if (classFilter) {
        classFilter.addEventListener('change', loadStudentsAttendance);
    }
});