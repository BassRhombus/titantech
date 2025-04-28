document.addEventListener('DOMContentLoaded', function() {
    const commissionForm = document.getElementById('commissionForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');

    commissionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Submitting...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = {
            discordUsername: document.getElementById('discordUsername').value,
            email: document.getElementById('email').value,
            botType: document.getElementById('botType').value,
            botDescription: document.getElementById('botDescription').value,
            budget: document.getElementById('budget').value,
            timeframe: document.getElementById('timeframe').value
        };
        
        // Hide any previous messages
        formSuccess.style.display = 'none';
        formError.style.display = 'none';
        
        console.log('Submitting commission request from mod manager:', formData);
        
        // Send data to server
        fetch('/api/commission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) {
                // Get more details from the error response
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
            // Show success message
            formSuccess.style.display = 'block';
            formError.style.display = 'none';
            commissionForm.reset();
            
            // Scroll to top of form to see success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch((error) => {
            // Show error message
            formSuccess.style.display = 'none';
            formError.style.display = 'block';
            formError.textContent = 'Error: ' + error.message;
            console.error('Error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    });
});
