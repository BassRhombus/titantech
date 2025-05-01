document.addEventListener('DOMContentLoaded', function() {
    const commissionForm = document.getElementById('commissionForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');

    if (commissionForm) {
        commissionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Collect form data
            const formData = {
                discordUsername: document.getElementById('discordUsername').value,
                email: document.getElementById('email').value,
                botType: document.getElementById('botType').value,
                botDescription: document.getElementById('botDescription').value,
                budget: document.getElementById('budget').value,
                timeframe: document.getElementById('timeframe').value,
                tosAgreement: document.getElementById('tosAgreement').checked
            };
            
            // Show loading state and set a loading message
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            formSuccess.style.display = 'none';
            formError.style.display = 'none';
            
            console.log('Submitting commission request:', formData);
            
            // Send the data to the server
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
                console.log('Commission submission successful:', data);
                // Show success message
                formSuccess.style.display = 'block';
                formError.style.display = 'none';
                formError.textContent = '';
                commissionForm.reset();
                
                // Scroll to top of form to see success message
                window.scrollTo({ top: formSuccess.offsetTop - 100, behavior: 'smooth' });
            })
            .catch((error) => {
                // Show error message with more details
                console.error('Error submitting commission request:', error);
                formSuccess.style.display = 'none';
                formError.style.display = 'block';
                formError.textContent = 'There was an error submitting your request: ' + error.message;
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }
});
