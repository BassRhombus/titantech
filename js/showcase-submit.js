// Showcase submission form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const submitForm = document.getElementById('showcaseSubmitForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const removeImageBtn = document.getElementById('removeImage');
    
    // Variables
    let selectedFile = null;
    
    // Add event listeners
    if (submitForm) {
        // File drop area events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Make the drop area clickable to trigger file input
        dropArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFileSelect, false);
        removeImageBtn.addEventListener('click', removeImage, false);
        
        // Form submission
        submitForm.addEventListener('submit', handleSubmit);
    }
    
    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    function handleFileSelect(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    function handleFiles(files) {
        if (files[0]) {
            // Check file type
            const file = files[0];
            const fileType = file.type;
            
            if (!fileType.match('image.*')) {
                alert('Please select an image file (JPEG, PNG, or GIF).');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB. Please select a smaller image.');
                return;
            }
            
            selectedFile = file;
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.style.display = 'block';
                
                // Add drop area instruction that file is selected
                dropArea.querySelector('.drop-instructions').innerHTML = `
                    <i class="fas fa-check-circle" style="color: #2F9E41;"></i>
                    <p>Image selected: ${file.name}</p>
                    <span class="file-requirements">Click to select a different image</span>
                `;
            };
            reader.readAsDataURL(file);
        }
    }
    
    function removeImage(e) {
        e.preventDefault();
        
        // Reset file input
        fileInput.value = '';
        selectedFile = null;
        
        // Hide preview
        previewContainer.style.display = 'none';
        imagePreview.src = '';
        
        // Reset drop area
        dropArea.querySelector('.drop-instructions').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop your image here or click to browse</p>
            <span class="file-requirements">JPEG, PNG or GIF (Max 5MB)</span>
        `;
    }
    
    function handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!selectedFile) {
            alert('Please select an image to upload.');
            return;
        }
        
        // Create FormData
        const formData = new FormData();
        formData.append('imageFile', selectedFile);
        formData.append('imageTitle', document.getElementById('imageTitle').value);
        formData.append('imageDescription', document.getElementById('imageDescription').value);
        formData.append('authorName', document.getElementById('authorName').value);
        
        // Show loading state
        const submitBtn = submitForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitBtn.disabled = true;
        
        // Reset messages
        formSuccess.style.display = 'none';
        formError.style.display = 'none';
        
        // Submit form
        fetch('/api/showcase/submit', {
            method: 'POST',
            body: formData, // No need to set Content-Type with FormData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Server response:', text);
                    try {
                        const jsonData = JSON.parse(text);
                        throw new Error(jsonData.message || 'Server error: ' + response.status);
                    } catch (e) {
                        throw new Error('Server error: ' + response.status);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Submission successful:', data);
            
            // Show success message
            formSuccess.style.display = 'block';
            formSuccess.textContent = data.message || 'Your image has been submitted successfully! It will be reviewed by our team before being published.';
            
            // Reset form
            submitForm.reset();
            removeImage(new Event('click'));
            
            // Scroll to top of form
            window.scrollTo({
                top: formSuccess.offsetTop - 100,
                behavior: 'smooth'
            });
        })
        .catch(error => {
            console.error('Error submitting showcase item:', error);
            
            // Show error message
            formError.style.display = 'block';
            formError.textContent = 'Error: ' + (error.message || 'Failed to submit. Please try again later.');
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
});