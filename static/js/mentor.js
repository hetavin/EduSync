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


$(document).ready(function () {

    $.get("/profile", function (data) {

        $("#mentorName").text(data.name);

        const initials = data.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');

        $("#mentorAvatar").attr(
            "src",
            `https://ui-avatars.com/api/?name=${initials}&background=34C759&color=fff&size=128`
        );

    }).fail(function (xhr) {

        console.log(xhr);

    });

});

// ===== Modal Management =====
const addStudentModal = document.getElementById('addStudentModal');
const editStudentModal = document.getElementById('editStudentModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Close Modals
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
    });
});

if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        closeModal(addStudentModal);
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', function() {
        closeModal(editStudentModal);
    });
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// ===== Add Student Form =====
const addStudentForm = document.getElementById('addStudentForm');

addStudentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentId').value,
        email: document.getElementById('studentEmail').value,
        phone: document.getElementById('studentPhone').value,
        class: document.getElementById('studentClass').value,
        year: document.getElementById('studentYear').value,
        dob: document.getElementById('studentDOB').value,
        roll: document.getElementById('studentRoll').value,
        address: document.getElementById('studentAddress').value,
        emergencyContact: document.getElementById('emergencyContact').value
    };
    
    console.log('Adding new student:', formData);
    
    // Add student to table
    addStudentToTable(formData);
    
    // Show success message
    showToast('Student added successfully!', 'success');
    
    // Close modal and reset form
    closeModal(addStudentModal);
    addStudentForm.reset();
});

// ===== View Student Details =====
const viewBtns = document.querySelectorAll('.view-btn');

viewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const studentName = row.querySelector('.student-info span').textContent;
        console.log('Viewing details for:', studentName);
        showToast('Opening student details...', 'info');
    });
});

// ===== Edit Student =====
const editBtns = document.querySelectorAll('.edit-btn');

editBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const cells = row.querySelectorAll('td');
        const studentId = cells[0].querySelector('.student-id').textContent;
        const studentName = cells[1].querySelector('.student-info span').textContent;
        const studentEmail = cells[2].textContent;
        const studentPhone = cells[3].textContent;
        const studentClass = cells[5].textContent;
        const studentYear = cells[6].textContent;
        
        // Populate edit form
        document.getElementById('editStudentName').value = studentName;
        document.getElementById('editStudentId').value = studentId;
        document.getElementById('editStudentEmail').value = studentEmail;
        document.getElementById('editStudentPhone').value = studentPhone;
        document.getElementById('editStudentClass').value = studentClass;
        
        // Map year text to value
        const yearMap = {'1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4'};
        document.getElementById('editStudentYear').value = yearMap[studentYear] || '1';
        
        editStudentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Edit Student Form
const editStudentForm = document.getElementById('editStudentForm');

if (editStudentForm) {
    editStudentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('editStudentId').value;
        const updatedData = {
            name: document.getElementById('editStudentName').value,
            email: document.getElementById('editStudentEmail').value,
            phone: document.getElementById('editStudentPhone').value,
            class: document.getElementById('editStudentClass').value,
            year: document.getElementById('editStudentYear').value
        };
        
        // Find and update the row
        const rows = document.querySelectorAll('#studentsTableBody tr');
        rows.forEach(row => {
            const rowId = row.querySelector('.student-id').textContent;
            if (rowId === studentId) {
                const cells = row.querySelectorAll('td');
                const yearText = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][parseInt(updatedData.year)];
                
                // Update cells
                cells[1].querySelector('.student-info span').textContent = updatedData.name;
                cells[1].querySelector('img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedData.name)}&background=random&color=fff`;
                cells[1].querySelector('img').alt = updatedData.name;
                cells[2].textContent = updatedData.email;
                cells[3].textContent = updatedData.phone;
                cells[5].textContent = updatedData.class;
                cells[6].textContent = yearText;
                
                row.setAttribute('data-class', updatedData.class);
                row.setAttribute('data-year', updatedData.year);
            }
        });
        
        showToast('Student updated successfully!', 'success');
        closeModal(editStudentModal);
    });
}

// ===== Class & Year Filters =====
const classFilter = document.getElementById('classFilter');
const yearFilter = document.getElementById('yearFilter');

if (classFilter) {
    classFilter.addEventListener('change', filterStudents);
}

if (yearFilter) {
    yearFilter.addEventListener('change', filterStudents);
}

function filterStudents() {
    const selectedClass = classFilter ? classFilter.value : 'all';
    const selectedBatch = yearFilter ? yearFilter.value : 'all';
    const rows = document.querySelectorAll('#studentsTableBody tr');
    
    rows.forEach(row => {
        const rowClass = row.getAttribute('data-class');
        const rowBatch = row.querySelector('td:nth-child(5)').textContent.trim(); // Get batch from table
        
        const classMatch = selectedClass === 'all' || rowClass === selectedClass;
        const batchMatch = selectedBatch === 'all' || rowBatch === selectedBatch;
        
        if (classMatch && batchMatch) {
            row.style.display = '';
            row.style.animation = 'fadeIn 0.3s ease';
        } else {
            row.style.display = 'none';
        }
    });
}

// ===== Search Functionality =====
const searchInput = document.querySelector('.search-container input');
const studentTableSearch = document.getElementById('studentTableSearch');

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#studentsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Student table search
if (studentTableSearch) {
    studentTableSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#studentsTableBody tr');
        
        let visibleCount = 0;
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
    });
}

// ===== Export Students =====
const exportStudentsBtn = document.getElementById('exportStudents');

if (exportStudentsBtn) {
    exportStudentsBtn.addEventListener('click', function() {
        const rows = document.querySelectorAll('#studentsTableBody tr');
        if (rows.length === 0) {
            showToast('No students to export', 'warning');
            return;
        }
        
        let csvContent = 'Enrollment Number,Name,Email,Phone Number,Batch,Class,Year\n';
        
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = row.querySelectorAll('td');
                const enrollment = cells[0].textContent.trim();
                const name = cells[1].querySelector('span').textContent.trim();
                const email = cells[2].textContent.trim();
                const phone = cells[3].textContent.trim();
                const batch = cells[4].textContent.trim();
                const classInfo = cells[5].textContent.trim();
                const year = cells[6].textContent.trim();
                
                csvContent += `${enrollment},${name},${email},${phone},${batch},${classInfo},${year}\n`;
            }
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Students exported successfully!', 'success');
    });
}

// ===== Add Student to Table =====
function addStudentToTable(data) {
    const tbody = document.getElementById('studentsTableBody');
    const row = document.createElement('tr');
    row.setAttribute('data-class', data.class);
    row.setAttribute('data-year', data.year);
    
    const yearText = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][parseInt(data.year)];
    const currentYear = new Date().getFullYear();
    const batch = currentYear - parseInt(data.year) + 1;
    
    row.innerHTML = `
        <td><span class="student-id">${data.roll || data.id}</span></td>
        <td>
            <div class="student-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff" alt="${data.name}">
                <span>${data.name}</span>
            </div>
        </td>
        <td>${data.email}</td>
        <td>${data.phone}</td>
        <td>${data.batch}</td>
        <td>${data.class}</td>
        <td>${data.department}</td>
        <td>
            <button class="btn-icon edit-btn" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon view-btn" title="View Details">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    row.style.opacity = '0';
    tbody.insertBefore(row, tbody.firstChild);
    
    setTimeout(() => {
        row.style.transition = 'opacity 0.5s ease';
        row.style.opacity = '1';
    }, 10);
    
    attachRowEventListeners(row);
}

// Attach event listeners to dynamically added rows
function attachRowEventListeners(row) {
    const editBtn = row.querySelector('.edit-btn');
    const viewBtn = row.querySelector('.view-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const cells = row.querySelectorAll('td');
            const studentId = cells[0].querySelector('.student-id').textContent;
            const studentName = cells[1].querySelector('.student-info span').textContent;
            const studentEmail = cells[2].textContent;
            const studentPhone = cells[3].textContent;
            const studentBatch = cells[4].textContent;
            const studentDepartment = cells[6].textContent;
            
            document.getElementById('editStudentName').value = studentName;
            document.getElementById('editStudentId').value = studentId;
            document.getElementById('editStudentEmail').value = studentEmail;
            document.getElementById('editStudentPhone').value = studentPhone;
            document.getElementById('editStudentClass').value = studentClass;
            document.getElementById('editStudentBatch').value = studentBatch;
            document.getElementById('editStudentClass').value = studentDepartment;
            
            editStudentModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            const studentName = row.querySelector('.student-info span').textContent;
            showToast(`Viewing details for ${studentName}`, 'info');
        });
    }
}

$(document).ready(function () {
    loadStudents();
});

async function loadStudents() {

    try {

        const response = await fetch("/displayStudents");

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        // Students Table
        const tbody = document.getElementById("studentsTableBody");
        tbody.innerHTML = "";

        // Face ID Dropdown
        if (faceStudentSelect) {
            faceStudentSelect.innerHTML =
                '<option value="">Select Student</option>';
        }

        data.students.forEach(student => {

            // Add to Table
            addStudentToTable({
                roll: student.enrollment_no,
                name: student.name,
                email: student.email,
                phone: student.phone_number,
                batch: student.batch,
                class: student.class,
                department: student.department
            });

            // Add to Face ID Dropdown
            if (faceStudentSelect) {

                const option = document.createElement("option");

                option.value = student.enrollment_no;

                option.textContent =
                    `${student.enrollment_no} - ${student.name} (${student.department})`;

                faceStudentSelect.appendChild(option);
            }

        });

        // Student Count
        document.getElementById("studentCount").textContent = data.count;
        
        document.getElementById("totalstudentCount").textContent = data.totalcount;

        // No Students Found
        if (data.count === 0) {
            showToast("No students found", "warning");
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load students. Please try again later.",
            "error"
        );

    }
}

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
                window.location.href = '/logout';
            }, 1000);
        }
    });
}

// ===== Register Face ID Functionality =====
const faceStudentSelect = document.getElementById('faceStudentSelect');
const selectedStudentInfo = document.getElementById('selectedStudentInfo');
const selectedStudentAvatar = document.getElementById('selectedStudentAvatar');
const selectedStudentName = document.getElementById('selectedStudentName');
const selectedStudentEnrollment = document.getElementById('selectedStudentEnrollment');
const selectedStudentYear = document.getElementById('selectedStudentYear');
const faceUploadDropzone = document.getElementById('faceUploadDropzone');
const faceImageInput = document.getElementById('faceImageInput');
const uploadCard = document.getElementById('uploadCard');
const uploadedImagesCard = document.getElementById('uploadedImagesCard');
const uploadedImagesGrid = document.getElementById('uploadedImagesGrid');
const uploadedCount = document.getElementById('uploadedCount');
const validationMessage = document.getElementById('validationMessage');
const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
const clearAllImagesBtn = document.getElementById('clearAllImagesBtn');
const registerFaceBtn = document.getElementById('registerFaceBtn');

let selectedStudent = null;
let uploadedImages = [];
let registeredStudents = [];

// Student selection
if (faceStudentSelect) {
    faceStudentSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
            const selectedText = this.options[this.selectedIndex].text;
            const parts = selectedText.split(' - ');
            const enrollment = parts[0];
            const nameYear = parts[1].split(' (');
            const name = nameYear[0];
            const year = nameYear[1].replace(')', '');
            
            selectedStudent = {
                enrollment: enrollment,
                name: name
            };
            
            selectedStudentAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff&size=128`;
            selectedStudentName.textContent = name;
            selectedStudentEnrollment.textContent = `Enrollment: ${enrollment}`;
            selectedStudentInfo.style.display = 'block';
            
            if (faceUploadDropzone) {
                faceUploadDropzone.classList.remove('disabled');
            }
            
            showToast(`Student ${name} selected`, 'info');
        } else {
            selectedStudentInfo.style.display = 'none';
            if (faceUploadDropzone) {
                faceUploadDropzone.classList.add('disabled');
            }
        }
    });
}

// Upload dropzone click
if (faceUploadDropzone) {
    faceUploadDropzone.addEventListener('click', function() {
        if (!selectedStudent) {
            showToast('Please select a student first', 'warning');
            return;
        }
        if (uploadedImages.length >= 5) {
            showToast('Maximum 5 images allowed', 'warning');
            return;
        }
        faceImageInput.click();
    });
    
    // Drag and drop
    faceUploadDropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (selectedStudent && uploadedImages.length < 5) {
            this.classList.add('dragover');
        }
    });
    
    faceUploadDropzone.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    faceUploadDropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        if (!selectedStudent) {
            showToast('Please select a student first', 'warning');
            return;
        }
        
        const files = e.dataTransfer.files;
        handleImageFiles(files);
    });
}

// File input change
if (faceImageInput) {
    faceImageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleImageFiles(files);
        this.value = ''; // Reset input
    });
}

// Add more images button
if (addMoreImagesBtn) {
    addMoreImagesBtn.addEventListener('click', function() {
        if (uploadedImages.length >= 5) {
            showToast('Maximum 5 images allowed', 'warning');
            return;
        }
        faceImageInput.click();
    });
}

// Handle image files
function handleImageFiles(files) {
    const remainingSlots = 5 - uploadedImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    if (files.length > remainingSlots) {
        showToast(`Only ${remainingSlots} more image(s) can be added (max 5 total)`, 'warning');
    }
    
    for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast(`${file.name} is not a valid image file`, 'error');
            continue;
        }
        
        // Read file
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.push({
                name: file.name,
                data: e.target.result
            });
            
            // Switch to uploaded images view
            if (uploadCard && uploadedImagesCard) {
                uploadCard.style.display = 'none';
                uploadedImagesCard.style.display = 'block';
            }
            
            displayUploadedImages();
            updateValidation();
        };
        reader.readAsDataURL(file);
    }
    
    if (filesToProcess > 0) {
        showToast(`${filesToProcess} image(s) added successfully`, 'success');
    }
}

// Display uploaded images
function displayUploadedImages() {
    uploadedImagesGrid.innerHTML = '';
    
    uploadedImages.forEach((img, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'captured-image-item';
        imageItem.innerHTML = `
            <img src="${img.data}" alt="${img.name}">
            <button class="remove-capture" onclick="removeUploadedImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        uploadedImagesGrid.appendChild(imageItem);
    });
    
    uploadedCount.textContent = uploadedImages.length;
    
    // Update add more button state
    if (uploadedImages.length >= 5 && addMoreImagesBtn) {
        addMoreImagesBtn.disabled = true;
        addMoreImagesBtn.style.opacity = '0.5';
    } else if (addMoreImagesBtn) {
        addMoreImagesBtn.disabled = false;
        addMoreImagesBtn.style.opacity = '1';
    }
}

// Update validation message
function updateValidation() {
    const count = uploadedImages.length;
    
    if (count < 2) {
        validationMessage.className = 'validation-alert warning';
        validationMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Please upload ${2 - count} more image(s) to register (minimum 2 required)</span>
        `;
        validationMessage.style.display = 'flex';
        registerFaceBtn.style.display = 'none';
    } else if (count >= 2 && count <= 5) {
        validationMessage.className = 'validation-alert success';
        validationMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Perfect! ${count} image(s) uploaded. Ready to register Face ID</span>
        `;
        validationMessage.style.display = 'flex';
        registerFaceBtn.style.display = 'block';
    }
}

// Remove uploaded image
window.removeUploadedImage = function(index) {
    uploadedImages.splice(index, 1);
    
    if (uploadedImages.length === 0) {
        // Switch back to upload view
        if (uploadCard && uploadedImagesCard) {
            uploadCard.style.display = 'block';
            uploadedImagesCard.style.display = 'none';
        }
    } else {
        displayUploadedImages();
        updateValidation();
    }
    
    showToast('Image removed', 'info');
};

// Clear all uploads
if (clearAllImagesBtn) {
    clearAllImagesBtn.addEventListener('click', function() {
        if (uploadedImages.length === 0) {
            showToast('No images to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all uploaded images?')) {
            uploadedImages = [];
            
            // Switch back to upload view
            if (uploadCard && uploadedImagesCard) {
                uploadCard.style.display = 'block';
                uploadedImagesCard.style.display = 'none';
            }
            
            showToast('All images cleared', 'success');
        }
    });
}

// Register face ID
if (registerFaceBtn) {
    registerFaceBtn.addEventListener('click', function() {
        if (uploadedImages.length < 2) {
            showToast('Please upload at least 2 images', 'warning');
            return;
        }
        
        if (uploadedImages.length > 5) {
            showToast('Maximum 5 images allowed', 'warning');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering Face ID...';
        
        setTimeout(() => {
            // Add to registered students
            const registeredStudent = {
                enrollment: selectedStudent.enrollment,
                name: selectedStudent.name,
                year: selectedStudent.year,
                images: [...uploadedImages],
                imageCount: uploadedImages.length,
                registeredDate: new Date().toLocaleDateString()
            };
            
            registeredStudents.push(registeredStudent);
            displayRegisteredStudents();
            
            // Remove registered student from selection dropdown
            removeStudentFromSelection(selectedStudent.enrollment);
            
            showToast(`Face ID registered successfully for ${selectedStudent.name} with ${uploadedImages.length} images!`, 'success');
            
            uploadedImages = [];
            selectedStudent = null;
            faceStudentSelect.value = '';
            selectedStudentInfo.style.display = 'none';
            
            // Switch back to upload view
            if (uploadCard && uploadedImagesCard) {
                uploadCard.style.display = 'block';
                uploadedImagesCard.style.display = 'none';
            }
            
            if (faceUploadDropzone) {
                faceUploadDropzone.classList.add('disabled');
            }
            
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-check-circle"></i> Register Face ID';
        }, 2000);
    });
}

// Display registered students
function displayRegisteredStudents() {
    const registeredStudentsSection = document.getElementById('registeredStudentsSection');
    const registeredStudentsTable = document.getElementById('registeredStudentsTable');
    const registeredCount = document.getElementById('registeredCount');
    
    if (!registeredStudentsSection || !registeredStudentsTable) return;
    
    registeredStudentsSection.style.display = 'block';
    
    if (registeredStudents.length === 0) {
        registeredStudentsTable.innerHTML = `
            <tr class="no-data-row">
                <td colspan="6" style="text-align: center; padding: 48px;">
                    <i class="fas fa-user-slash" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                    <p style="color: var(--text-secondary);">No students registered yet</p>
                </td>
            </tr>
        `;
        registeredCount.textContent = '0';
    } else {
        registeredStudentsTable.innerHTML = '';
        registeredStudents.forEach((student, index) => {
            const row = document.createElement('tr');
            row.onclick = () => showStudentImages(index);
            row.innerHTML = `
                <td><span class="student-id">${student.enrollment}</span></td>
                <td>
                    <div class="student-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff" alt="${student.name}">
                        <span>${student.name}</span>
                    </div>
                </td>
                <td>${student.year}</td>
                <td>
                    <span class="image-count-badge">
                        <i class="fas fa-images"></i>
                        ${student.imageCount}
                    </span>
                </td>
                <td>${student.registeredDate}</td>
                <td>
                    <button class="btn-icon" onclick="event.stopPropagation(); deleteRegisteredStudent(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            registeredStudentsTable.appendChild(row);
        });
        registeredCount.textContent = registeredStudents.length;
    }
}

// Show student images in modal
function showStudentImages(index) {
    const student = registeredStudents[index];
    const modal = document.getElementById('studentImagesModal');
    const modalStudentName = document.getElementById('modalStudentName');
    const modalStudentInfo = document.getElementById('modalStudentInfo');
    const modalImagesGrid = document.getElementById('modalImagesGrid');
    
    if (!modal) return;
    
    modalStudentName.textContent = `${student.name} - Face ID Images`;
    
    modalStudentInfo.innerHTML = `
        <div class="modal-student-info">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=007AFF&color=fff&size=160" alt="${student.name}">
            <div class="modal-student-details">
                <h3>${student.name}</h3>
                <p><i class="fas fa-id-card"></i> ${student.enrollment}</p>
                <p><i class="fas fa-graduation-cap"></i> ${student.year}</p>
                <p><i class="fas fa-images"></i> ${student.imageCount} images registered</p>
                <p><i class="fas fa-calendar"></i> Registered on ${student.registeredDate}</p>
            </div>
        </div>
    `;
    
    modalImagesGrid.innerHTML = '';
    student.images.forEach((img, imgIndex) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'modal-image-item';
        imageItem.innerHTML = `
            <img src="${img.data}" alt="${student.name} - Image ${imgIndex + 1}">
            <span class="image-number">${imgIndex + 1}</span>
        `;
        modalImagesGrid.appendChild(imageItem);
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Delete registered student
window.deleteRegisteredStudent = function(index) {
    const student = registeredStudents[index];
    if (confirm(`Are you sure you want to delete Face ID registration for ${student.name}?`)) {
        // Add student back to selection dropdown
        addStudentBackToSelection(student);
        
        registeredStudents.splice(index, 1);
        displayRegisteredStudents();
        showToast('Face ID registration deleted', 'success');
    }
};

// Search registered students
const registeredSearch = document.getElementById('registeredSearch');
if (registeredSearch) {
    registeredSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#registeredStudentsTable tr:not(.no-data-row)');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Remove student from selection dropdown after registration
function removeStudentFromSelection(enrollment) {
    const options = faceStudentSelect.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === enrollment) {
            option.remove();
        }
    });
}

// Add student back to selection dropdown after deleting registration
function addStudentBackToSelection(student) {
    const option = document.createElement('option');
    option.value = student.enrollment;
    option.textContent = `${student.enrollment} - ${student.name} (${student.year})`;
    
    // Insert in sorted order (optional, for better UX)
    const options = Array.from(faceStudentSelect.options).slice(1); // Skip first "Select Student" option
    let inserted = false;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].value > student.enrollment) {
            faceStudentSelect.insertBefore(option, options[i]);
            inserted = true;
            break;
        }
    }
    
    if (!inserted) {
        faceStudentSelect.appendChild(option);
    }
}

// ===== Initialize =====
console.log('EduSync Mentor Portal loaded! 👨‍🏫');


// ===== Import Students Functionality =====
const importStudentsBtn = document.getElementById('importStudentsBtn');
const importStudentsModal = document.getElementById('importStudentsModal');
const importUploadArea = document.getElementById('importUploadArea');
const importFileInput = document.getElementById('importFileInput');
const importFileInfo = document.getElementById('importFileInfo');
const importFileName = document.getElementById('importFileName');
const importFileSize = document.getElementById('importFileSize');
const removeImportFile = document.getElementById('removeImportFile');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const processImportBtn = document.getElementById('processImportBtn');

let selectedImportFile = null;

// Open import modal
if (importStudentsBtn) {
    importStudentsBtn.addEventListener('click', function() {
        importStudentsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Cancel import
if (cancelImportBtn) {
    cancelImportBtn.addEventListener('click', function() {
        closeModal(importStudentsModal);
        resetImportForm();
    });
}

// Upload area click
if (importUploadArea) {
    importUploadArea.addEventListener('click', function() {
        importFileInput.click();
    });
    
    // Drag and drop
    importUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    importUploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    importUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImportFile(files[0]);
        }
    });
}

// File input change
if (importFileInput) {
    importFileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImportFile(e.target.files[0]);
        }
    });
}

// Handle import file
function handleImportFile(file) {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showToast('Please upload a valid CSV or Excel file', 'error');
        return;
    }
    
    selectedImportFile = file;
    importFileName.textContent = file.name;
    importFileSize.textContent = formatFileSize(file.size);
    importUploadArea.style.display = 'none';
    importFileInfo.style.display = 'flex';
    processImportBtn.disabled = false;
    
    showToast('File selected successfully', 'success');
}

// Remove import file
if (removeImportFile) {
    removeImportFile.addEventListener('click', function(e) {
        e.stopPropagation();
        resetImportForm();
    });
}

// Reset import form
function resetImportForm() {
    selectedImportFile = null;
    importFileInput.value = '';
    importUploadArea.style.display = 'block';
    importFileInfo.style.display = 'none';
    processImportBtn.disabled = true;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Process import

if (processImportBtn) {

    processImportBtn.addEventListener('click', function () {

        if (!selectedImportFile) {
            showToast('Please select a file first', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedImportFile);

        processImportBtn.disabled = true;
        processImportBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Processing...';

        $.ajax({
            url: '/api/mentor/updateClass',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,

            success: function (response) {

                showToast(
                    response.message ||
                    `${response.inserted} students imported successfully`,
                    'success'
                );

                closeModal(importStudentsModal);
                resetImportForm();

                loadStudents();
            },

            error: function (xhr) {

                let message = 'Import failed';

                if (
                    xhr.responseJSON &&
                    xhr.responseJSON.message
                ) {
                    message = xhr.responseJSON.message;
                }

                showToast(message, 'error');
            },

            complete: function () {

                processImportBtn.disabled = false;

                processImportBtn.innerHTML =
                    '<i class="fas fa-check"></i> Import Students';
            }
        });

    });

}


// if (processImportBtn) {
//     processImportBtn.addEventListener('click', function() {
//         if (!selectedImportFile) {
//             showToast('Please select a file first', 'warning');
//             return;
//         }
        
//         this.disabled = true;
//         this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
//         const fileExtension = '.' + selectedImportFile.name.split('.').pop().toLowerCase();
        
//         if (fileExtension === '.csv') {
//             processCSVFile(selectedImportFile);
//         } else {
//             showToast('Excel file processing requires additional library. Use CSV format.', 'warning');
//             this.disabled = false;
//             this.innerHTML = '<i class="fas fa-check"></i> Import Students';
//         }
//     });
// }

// // Process CSV file
// function processCSVFile(file) {
//     const reader = new FileReader();
    
//     reader.onload = function(e) {
//         const text = e.target.result;
//         const lines = text.split('\n').filter(line => line.trim());
        
//         if (lines.length < 2) {
//             showToast('File is empty or has no data', 'error');
//             processImportBtn.disabled = false;
//             processImportBtn.innerHTML = '<i class="fas fa-check"></i> Import Students';
//             return;
//         }
        
//         const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
//         const requiredFields = ['name', 'email', 'phone', 'class', 'year'];
//         const missingFields = requiredFields.filter(field => 
//             !headers.some(h => h.includes(field.replace(' ', '')))
//         );
        
//         if (missingFields.length > 0) {
//             showToast(`Missing required columns: ${missingFields.join(', ')}`, 'error');
//             processImportBtn.disabled = false;
//             processImportBtn.innerHTML = '<i class="fas fa-check"></i> Import Students';
//             return;
//         }
        
//         let importedCount = 0;
        
//         for (let i = 1; i < lines.length; i++) {
//             const values = parseCSVLine(lines[i]);
//             if (values.length < headers.length) continue;
            
//             const studentData = {};
//             headers.forEach((header, index) => {
//                 studentData[header] = values[index]?.trim() || '';
//             });
            
//             // Map CSV data to student object
//             const student = {
//                 name: studentData.name || studentData['student name'] || '',
//                 email: studentData.email || '',
//                 phone: studentData.phone || studentData['phone number'] || '',
//                 class: studentData.class || '',
//                 year: studentData.year || '',
//                 roll: studentData['roll number'] || studentData.rollnumber || studentData.roll || `EN${new Date().getFullYear()}${String(i).padStart(3, '0')}`,
//                 address: studentData.address || '',
//                 dob: studentData['date of birth'] || studentData.dob || '',
//                 emergencyContact: studentData['emergency contact'] || studentData.emergencycontact || ''
//             };
            
//             if (student.name && student.email) {
//                 addStudentToTable(student);
//                 importedCount++;
//             }
//         }
        
//         showToast(`Successfully imported ${importedCount} student(s)!`, 'success');
//         closeModal(importStudentsModal);
//         resetImportForm();
//         processImportBtn.disabled = false;
//         processImportBtn.innerHTML = '<i class="fas fa-check"></i> Import Students';
//     };
    
//     reader.onerror = function() {
//         showToast('Error reading file', 'error');
//         processImportBtn.disabled = false;
//         processImportBtn.innerHTML = '<i class="fas fa-check"></i> Import Students';
//     };
    
//     reader.readAsText(file);
// }

// // Parse CSV line (handles quoted values)
// function parseCSVLine(line) {
//     const result = [];
//     let current = '';
//     let inQuotes = false;
    
//     for (let i = 0; i < line.length; i++) {
//         const char = line[i];
        
//         if (char === '"') {
//             inQuotes = !inQuotes;
//         } else if (char === ',' && !inQuotes) {
//             result.push(current);
//             current = '';
//         } else {
//             current += char;
//         }
//     }
    
//     result.push(current);
//     return result;
// }

// ===== Attendance Details Functionality =====

// Attendance Search
const attendanceSearch = document.getElementById('attendanceSearch');
if (attendanceSearch) {
    attendanceSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#attendanceTableBody tr');
        
        let visibleCount = 0;
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        updateAttendanceSummary();
    });
}

// Attendance Class Filter
const attendanceClassFilter = document.getElementById('attendanceClassFilter');
if (attendanceClassFilter) {
    attendanceClassFilter.addEventListener('change', function() {
        filterAttendanceTable();
    });
}

// Attendance Month Filter
const attendanceMonthFilter = document.getElementById('attendanceMonthFilter');
if (attendanceMonthFilter) {
    attendanceMonthFilter.addEventListener('change', function() {
        filterAttendanceTable();
        // Clear date range when month is selected
        document.getElementById('attendanceDateFrom').value = '';
        document.getElementById('attendanceDateTo').value = '';
    });
}

// Date Range Filter
const attendanceDateFrom = document.getElementById('attendanceDateFrom');
const attendanceDateTo = document.getElementById('attendanceDateTo');
const applyDateRangeBtn = document.getElementById('applyDateRangeBtn');
const clearDateRangeBtn = document.getElementById('clearDateRangeBtn');

if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', function() {
        const fromDate = attendanceDateFrom.value;
        const toDate = attendanceDateTo.value;
        
        if (!fromDate || !toDate) {
            showToast('Please select both from and to dates', 'warning');
            return;
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            showToast('From date cannot be after to date', 'error');
            return;
        }
        
        // Clear month filter when date range is applied
        if (attendanceMonthFilter) {
            attendanceMonthFilter.value = '';
        }
        
        filterAttendanceTable();
        showToast(`Showing attendance from ${fromDate} to ${toDate}`, 'success');
    });
}

if (clearDateRangeBtn) {
    clearDateRangeBtn.addEventListener('click', function() {
        attendanceDateFrom.value = '';
        attendanceDateTo.value = '';
        filterAttendanceTable();
        showToast('Date range filter cleared', 'info');
    });
}

// Filter Attendance Table
function filterAttendanceTable() {
    const selectedClass = attendanceClassFilter ? attendanceClassFilter.value : 'all';
    const selectedMonth = attendanceMonthFilter ? attendanceMonthFilter.value : '';
    const fromDate = attendanceDateFrom ? attendanceDateFrom.value : '';
    const toDate = attendanceDateTo ? attendanceDateTo.value : '';
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    
    rows.forEach(row => {
        const rowClass = row.querySelector('td:nth-child(3)').textContent.trim();
        
        const classMatch = selectedClass === 'all' || rowClass === selectedClass;
        
        // For now, we'll show all rows since we're showing monthly summary
        // In a real app, you'd filter based on actual date data
        if (classMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateAttendanceSummary();
}

// Update Attendance Summary
function updateAttendanceSummary() {
    const visibleRows = Array.from(document.querySelectorAll('#attendanceTableBody tr'))
        .filter(row => row.style.display !== 'none');
    
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    
    visibleRows.forEach(row => {
        const presentCell = row.querySelector('td:nth-child(6)');
        const absentCell = row.querySelector('td:nth-child(7)');
        const lateCell = row.querySelector('td:nth-child(8)');
        
        if (presentCell) totalPresent += parseInt(presentCell.textContent) || 0;
        if (absentCell) totalAbsent += parseInt(absentCell.textContent) || 0;
        if (lateCell) totalLate += parseInt(lateCell.textContent) || 0;
    });
    
    const total = totalPresent + totalAbsent;
    const percentage = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0;
    
    const totalPresentCount = document.getElementById('totalPresentCount');
    const totalAbsentCount = document.getElementById('totalAbsentCount');
    const totalLateCount = document.getElementById('totalLateCount');
    const attendancePercentage = document.getElementById('attendancePercentage');
    
    if (totalPresentCount) totalPresentCount.textContent = totalPresent;
    if (totalAbsentCount) totalAbsentCount.textContent = totalAbsent;
    if (totalLateCount) totalLateCount.textContent = totalLate;
    if (attendancePercentage) attendancePercentage.textContent = percentage + '%';
}

// Export Attendance
const exportAttendance = document.getElementById('exportAttendance');
if (exportAttendance) {
    exportAttendance.addEventListener('click', function() {
        const rows = document.querySelectorAll('#attendanceTableBody tr');
        let visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
        
        if (visibleRows.length === 0) {
            showToast('No attendance data to export', 'warning');
            return;
        }
        
        let csvContent = 'Enrollment No,Student Name,Class,Month,Total Days,Present,Absent,Late,Attendance %\\n';
        
        visibleRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const enrollment = cells[0].textContent.trim();
            const name = cells[1].querySelector('span').textContent.trim();
            const classInfo = cells[2].textContent.trim();
            const month = cells[3].textContent.trim();
            const totalDays = cells[4].textContent.trim();
            const present = cells[5].textContent.trim();
            const absent = cells[6].textContent.trim();
            const late = cells[7].textContent.trim();
            const percentage = cells[8].textContent.trim();
            
            csvContent += `${enrollment},${name},${classInfo},${month},${totalDays},${present},${absent},${late},${percentage}\\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Attendance data exported successfully!', 'success');
    });
}

// View Attendance Details
const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
const viewAttendanceDetailsModal = document.getElementById('viewAttendanceDetailsModal');
const detailsStudentName = document.getElementById('detailsStudentName');
const detailsStudentInfo = document.getElementById('detailsStudentInfo');
const detailsAttendanceTable = document.getElementById('detailsAttendanceTable');

// Attach event listeners to view details buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.view-details-btn')) {
        const btn = e.target.closest('.view-details-btn');
        const studentId = btn.getAttribute('data-student');
        const row = btn.closest('tr');
        const studentName = row.querySelector('.student-info span').textContent;
        const classInfo = row.querySelector('td:nth-child(3)').textContent;
        const month = row.querySelector('td:nth-child(4)').textContent;
        
        showAttendanceDetails(studentId, studentName, classInfo, month);
    }
});

function showAttendanceDetails(studentId, studentName, classInfo, month) {
    if (!viewAttendanceDetailsModal) return;
    
    detailsStudentName.textContent = `${studentName} - Attendance Details`;
    detailsStudentInfo.textContent = `${studentId} | ${classInfo} | ${month}`;
    
    // In a real app, you'd fetch actual day-by-day data
    // For now, we'll show sample data
    detailsAttendanceTable.innerHTML = generateSampleAttendanceDetails();
    
    viewAttendanceDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function generateSampleAttendanceDetails() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const statuses = ['present', 'present', 'late', 'absent', 'present'];
    const times = ['09:15 AM', '09:10 AM', '09:35 AM', '-', '09:08 AM'];
    
    let html = '';
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayOfWeek = days[date.getDay()];
        const status = statuses[i];
        const time = times[i];
        
        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${dayOfWeek}</td>
                <td><span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                <td>${time}</td>
                <td>
                    <button class="btn-icon edit-attendance-btn" title="Edit Attendance" 
                            data-date="${date.toISOString().split('T')[0]}" 
                            data-status="${status}" 
                            data-time="${time.replace(' AM', '').replace(' PM', '')}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    return html;
}

// Edit Attendance
const editAttendanceModal = document.getElementById('editAttendanceModal');
const editAttendanceForm = document.getElementById('editAttendanceForm');
const editAttendanceStudent = document.getElementById('editAttendanceStudent');
const editAttendanceDate = document.getElementById('editAttendanceDate');
const editAttendanceStatus = document.getElementById('editAttendanceStatus');
const editAttendanceTime = document.getElementById('editAttendanceTime');
const editAttendanceNotes = document.getElementById('editAttendanceNotes');
const cancelAttendanceEdit = document.getElementById('cancelAttendanceEdit');

let currentEditingRow = null;

// Open edit attendance modal
document.addEventListener('click', function(e) {
    if (e.target.closest('.edit-attendance-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.edit-attendance-btn');
        currentEditingRow = btn.closest('tr');
        
        const date = btn.getAttribute('data-date');
        const status = btn.getAttribute('data-status');
        const time = btn.getAttribute('data-time');
        
        // Get student name from details modal title or from parent row
        let studentName = 'Student';
        if (detailsStudentName) {
            studentName = detailsStudentName.textContent.split(' - ')[0];
        }
        
        editAttendanceStudent.value = studentName;
        editAttendanceDate.value = date;
        editAttendanceStatus.value = status;
        editAttendanceTime.value = time && time !== '-' ? time : '';
        editAttendanceNotes.value = '';
        
        editAttendanceModal.classList.add('active');
    }
});

// Cancel edit attendance
if (cancelAttendanceEdit) {
    cancelAttendanceEdit.addEventListener('click', function() {
        closeModal(editAttendanceModal);
        currentEditingRow = null;
    });
}

// Submit edit attendance form
if (editAttendanceForm) {
    editAttendanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newStatus = editAttendanceStatus.value;
        const newTime = editAttendanceTime.value;
        const notes = editAttendanceNotes.value;
        
        if (currentEditingRow) {
            // Update the row
            const statusCell = currentEditingRow.querySelector('td:nth-child(3)');
            const timeCell = currentEditingRow.querySelector('td:nth-child(4)');
            
            if (statusCell) {
                statusCell.innerHTML = `<span class="status-badge ${newStatus}">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span>`;
            }
            
            if (timeCell) {
                timeCell.textContent = newTime && newStatus !== 'absent' ? formatTime(newTime) : '-';
            }
            
            // Update button data attributes
            const editBtn = currentEditingRow.querySelector('.edit-attendance-btn');
            if (editBtn) {
                editBtn.setAttribute('data-status', newStatus);
                editBtn.setAttribute('data-time', newTime);
            }
        }
        
        showToast('Attendance updated successfully!', 'success');
        closeModal(editAttendanceModal);
        currentEditingRow = null;
        
        // Update summary
        updateAttendanceSummary();
    });
}

// Format time (convert 09:15 to 09:15 AM)
function formatTime(time) {
    if (!time) return '-';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

// Initialize attendance summary on page load
if (document.getElementById('attendance-details')) {
    updateAttendanceSummary();
}

console.log('Attendance Details functionality loaded! 📊');

// ===== All Students Tab - Add Student Button =====
const addStudentBtn = document.getElementById('addStudentBtn');
if (addStudentBtn) {
    addStudentBtn.addEventListener('click', function() {
        addStudentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// ===== Delete Student Functionality =====
document.addEventListener('click', function(e) {
    if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const row = btn.closest('tr');
        const studentName = row.querySelector('.student-info span').textContent;
        const studentId = row.querySelector('.student-id').textContent;
        
        if (confirm(`Are you sure you want to delete ${studentName} (${studentId})?\n\nThis action cannot be undone.`)) {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.remove();
                showToast(`${studentName} has been deleted successfully`, 'success');
                updateStudentCount();
            }, 300);
        }
    }
});

// Update student count in dashboard
function updateStudentCount() {
    const totalStudents = document.querySelectorAll('#studentsTableBody tr').length;
    const dashboardCount = document.querySelector('.stat-value');
    if (dashboardCount) {
        dashboardCount.textContent = totalStudents;
    }
}

// Make Edit buttons work for dynamically added rows
function attachRowEventListeners(row) {
    const editBtn = row.querySelector('.edit-btn');
    const viewBtn = row.querySelector('.view-btn');
    const deleteBtn = row.querySelector('.delete-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const cells = row.querySelectorAll('td');
            const studentId = cells[0].querySelector('.student-id').textContent;
            const studentName = cells[1].querySelector('.student-info span').textContent;
            const studentEmail = cells[2].textContent;
            const studentPhone = cells[3].textContent;
            const studentBatch = cells[4].textContent;
            const studentClass = cells[5].textContent;
            const studentDepartment = cells[6].textContent;
            
            document.getElementById('editStudentName').value = studentName;
            document.getElementById('editStudentId').value = studentId;
            document.getElementById('editStudentEmail').value = studentEmail;
            document.getElementById('editStudentPhone').value = studentPhone;
            document.getElementById('editStudentClass').value = studentClass;
            document.getElementById('editStudentBatch').value = studentBatch;
            document.getElementById('editStudentDepartment').value = studentDepartment;
                    
            
            editStudentModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            const studentName = row.querySelector('.student-info span').textContent;
            const studentId = row.querySelector('.student-id').textContent;
            const studentEmail = row.querySelector('td:nth-child(3)').textContent;
            const studentPhone = row.querySelector('td:nth-child(4)').textContent;
            const studentBatch = row.querySelector('td:nth-child(5)').textContent;
            const studentClass = row.querySelector('td:nth-child(6)').textContent;
            const studentDepartment = row.querySelector('td:nth-child(7)').textContent;
            
            const detailsHTML = `
                <div style="padding: 20px; background: var(--fill-tertiary); border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=007AFF&color=fff&size=100" 
                             alt="${studentName}" 
                             style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--blue);">
                        <div>
                            <h3 style="font-size: 24px; color: var(--text-primary); margin-bottom: 8px;">${studentName}</h3>
                            <p style="color: var(--text-secondary); font-size: 14px;"><strong>ID:</strong> ${studentId}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 12px; margin-bottom: 4px;">Email</p>
                            <p style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${studentEmail}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 12px; margin-bottom: 4px;">Phone</p>
                            <p style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${studentPhone}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 12px; margin-bottom: 4px;">Class</p>
                            <p style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${studentClass}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 12px; margin-bottom: 4px;">Batch</p>
                            <p style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${studentBatch}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 12px; margin-bottom: 4px;">Department</p>
                            <p style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${studentDepartment}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Create a temporary modal for viewing details
            const viewModal = document.createElement('div');
            viewModal.className = 'modal active';
            viewModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>Student Details</h2>
                        <button class="close-modal" onclick="this.closest('.modal').remove(); document.body.style.overflow = '';">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${detailsHTML}
                    </div>
                </div>
            `;
            document.body.appendChild(viewModal);
            document.body.style.overflow = 'hidden';
            
            viewModal.addEventListener('click', function(e) {
                if (e.target === viewModal) {
                    viewModal.remove();
                    document.body.style.overflow = '';
                }
            });
        });
    }
}

// Re-attach event listeners to existing rows
document.querySelectorAll('#studentsTableBody tr').forEach(row => {
    attachRowEventListeners(row);
});

console.log('All Students tab buttons are now fully functional! 🎯');
