// Server submission form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const submitForm = document.getElementById('serverSubmitForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const removeImageBtn = document.getElementById('removeImage');

    // Variables
    let selectedFile = null;

    // Image settings
    const MAX_WIDTH = 1000;
    const MAX_HEIGHT = 800;
    const QUALITY = 0.75;
    const TARGET_FILE_SIZE = 1 * 1024 * 1024; // 1MB

    // Add event listeners
    if (submitForm) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        dropArea.addEventListener('click', function() {
            fileInput.click();
        });

        dropArea.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFileSelect, false);
        removeImageBtn.addEventListener('click', removeImage, false);

        submitForm.addEventListener('submit', handleSubmit);
    }

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
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }

        dropArea.querySelector('.drop-instructions').innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Processing image...</p>
        `;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let scaleFactor = 1;
                if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
                    scaleFactor = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
                }

                const newWidth = Math.floor(img.width * scaleFactor);
                const newHeight = Math.floor(img.height * scaleFactor);

                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                const outputFormat = 'image/jpeg';

                compressImage(canvas, outputFormat, QUALITY, file.name)
                    .then(compressedFile => {
                        selectedFile = compressedFile;

                        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        const newSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
                        const reductionPercent = Math.round((1 - (compressedFile.size / file.size)) * 100);

                        dropArea.querySelector('.drop-instructions').innerHTML = `
                            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                            <p>Image processed: ${file.name}</p>
                            <span class="file-requirements">
                                Original: ${originalSizeMB}MB &rarr; Compressed: ${newSizeMB}MB (${reductionPercent}% smaller)<br>
                                Dimensions: ${newWidth}x${newHeight}px
                            </span>
                        `;

                        imagePreview.src = URL.createObjectURL(compressedFile);
                        imagePreview.classList.add('resized-preview');
                        previewContainer.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error processing image:', error);
                        dropArea.querySelector('.drop-instructions').innerHTML = `
                            <i class="fas fa-exclamation-triangle" style="color: var(--danger-color);"></i>
                            <p>Error processing image</p>
                            <span class="file-requirements">Please try a different image or a smaller file.</span>
                        `;
                    });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function compressImage(canvas, format, initialQuality, fileName) {
        const qualities = [initialQuality, initialQuality * 0.8, initialQuality * 0.5];
        let compressedFile = null;

        for (let quality of qualities) {
            try {
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, format, quality);
                });

                if (!blob) throw new Error('Failed to create blob');

                if (blob.size <= TARGET_FILE_SIZE || quality === qualities[qualities.length - 1]) {
                    compressedFile = new File([blob], fileName.replace(/\.\w+$/, '.jpg'), {
                        type: format,
                        lastModified: new Date().getTime()
                    });
                    break;
                }
            } catch (error) {
                console.error('Compression attempt failed:', error);
            }
        }

        if (!compressedFile) {
            throw new Error('Failed to compress image to required size');
        }

        return compressedFile;
    }

    function removeImage(e) {
        e.preventDefault();

        fileInput.value = '';
        selectedFile = null;

        previewContainer.style.display = 'none';
        imagePreview.src = '';

        dropArea.querySelector('.drop-instructions').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop your server logo/banner here or click to browse</p>
            <span class="file-requirements">Images will be automatically resized and compressed</span>
        `;
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please upload a server logo or banner image.');
            return;
        }

        // Validate terms
        const tosCheckbox = document.getElementById('tosAgreement');
        if (!tosCheckbox.checked) {
            alert('You must agree to the terms before submitting.');
            return;
        }

        // Build FormData
        const formData = new FormData();
        formData.append('imageFile', selectedFile);
        formData.append('name', document.getElementById('serverName').value.trim());
        formData.append('description', document.getElementById('serverDescription').value.trim());
        formData.append('discordInvite', document.getElementById('discordInvite').value.trim());
        formData.append('ownerDiscord', document.getElementById('ownerDiscord').value.trim());
        formData.append('serverIP', document.getElementById('serverIP').value.trim());
        formData.append('queryPort', document.getElementById('queryPort').value.trim());

        // Show loading state
        const submitBtn = submitForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Reset messages
        formSuccess.style.display = 'none';
        formError.style.display = 'none';

        fetch('/api/submit-server', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('The image is too large. Please try a smaller image.');
                }
                return response.text().then(text => {
                    try {
                        const jsonData = JSON.parse(text);
                        if (jsonData.errors) {
                            const messages = jsonData.errors.map(err => err.message).join(', ');
                            throw new Error(messages);
                        }
                        throw new Error(jsonData.message || 'Server error: ' + response.status);
                    } catch (parseErr) {
                        if (parseErr.message.includes('Server error') || parseErr.message.includes('too large')) throw parseErr;
                        throw new Error('Server error: ' + response.status);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            formSuccess.style.display = 'block';
            formSuccess.textContent = data.message || 'Your server has been submitted and is pending review by our team.';

            submitForm.reset();
            removeImage(new Event('click'));

            window.scrollTo({
                top: formSuccess.offsetTop - 100,
                behavior: 'smooth'
            });
        })
        .catch(error => {
            console.error('Error submitting server:', error);
            formError.style.display = 'block';
            formError.textContent = 'Error: ' + error.message;
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
});
