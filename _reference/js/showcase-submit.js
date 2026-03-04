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
    
    // Image settings - these are critical for proper resizing
    const MAX_WIDTH = 1000;
    const MAX_HEIGHT = 800;
    const QUALITY = 0.75; // 75% quality for JPEG
    const TARGET_FILE_SIZE = 1 * 1024 * 1024; // Target 1MB for better upload reliability
    
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
        handleFiles(dt.files);
    }
    
    function handleFileSelect(e) {
        handleFiles(e.target.files);
    }
    
    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Show loading state in drop area
        dropArea.querySelector('.drop-instructions').innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Processing image...</p>
        `;
        
        // Read the file and process it
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create an image element to get dimensions
            const img = new Image();
            img.onload = function() {
                // Determine scaling factor
                let scaleFactor = 1;
                if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
                    scaleFactor = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
                }
                
                // Calculate new dimensions
                const newWidth = Math.floor(img.width * scaleFactor);
                const newHeight = Math.floor(img.height * scaleFactor);
                
                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Draw image on canvas with new dimensions
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Convert to file (reduced quality JPEG for maximum compatibility)
                const outputFormat = 'image/jpeg';
                
                // For reliability, we'll try up to 3 compression levels if needed
                compressImage(canvas, outputFormat, QUALITY, file.name)
                    .then(compressedFile => {
                        selectedFile = compressedFile;
                        
                        // Display file info
                        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        const newSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
                        const reductionPercent = Math.round((1 - (compressedFile.size / file.size)) * 100);
                        
                        dropArea.querySelector('.drop-instructions').innerHTML = `
                            <i class="fas fa-check-circle" style="color: #2F9E41;"></i>
                            <p>Image processed: ${file.name}</p>
                            <span class="file-requirements">
                                Original: ${originalSizeMB}MB → Compressed: ${newSizeMB}MB (${reductionPercent}% smaller)<br>
                                Dimensions: ${newWidth}x${newHeight}px
                            </span>
                        `;
                        
                        // Show preview
                        imagePreview.src = URL.createObjectURL(compressedFile);
                        imagePreview.classList.add('resized-preview');
                        previewContainer.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error processing image:', error);
                        dropArea.querySelector('.drop-instructions').innerHTML = `
                            <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                            <p>Error processing image</p>
                            <span class="file-requirements">Please try a different image or a smaller file.</span>
                        `;
                    });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Compress image with multiple attempts if needed
    async function compressImage(canvas, format, initialQuality, fileName) {
        // Try different quality levels if needed
        const qualities = [initialQuality, initialQuality * 0.8, initialQuality * 0.5];
        let compressedFile = null;
        
        for (let quality of qualities) {
            try {
                // Convert to blob
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, format, quality);
                });
                
                if (!blob) throw new Error("Failed to create blob");
                
                // Check if this compression is good enough
                if (blob.size <= TARGET_FILE_SIZE || quality === qualities[qualities.length - 1]) {
                    // Create file from blob
                    compressedFile = new File([blob], fileName.replace(/\.\w+$/, '.jpg'), {
                        type: format,
                        lastModified: new Date().getTime()
                    });
                    break;
                }
            } catch (error) {
                console.error('Compression attempt failed:', error);
                // Continue to next quality level
            }
        }
        
        if (!compressedFile) {
            throw new Error("Failed to compress image to required size");
        }
        
        return compressedFile;
    }
    
    function removeImage(e) {
        e.preventDefault();
        
        // Reset file input and selected file
        fileInput.value = '';
        selectedFile = null;
        
        // Hide preview
        previewContainer.style.display = 'none';
        imagePreview.src = '';
        
        // Reset drop area
        dropArea.querySelector('.drop-instructions').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop your image here or click to browse</p>
            <span class="file-requirements">Images will be automatically resized and compressed</span>
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
        formData.append('imageDescription', document.getElementById('imageDescription').value || '');
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
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('The image is still too large. Please try a smaller image.');
                }
                return response.text().then(text => {
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
            formError.textContent = 'Error: ' + error.message;
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
});