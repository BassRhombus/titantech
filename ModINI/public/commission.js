document.addEventListener('DOMContentLoaded', function() {
    const commissionForm = document.getElementById('commissionForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');

    commissionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Collect form data
        const formData = {
            discordUsername: document.getElementById('discordUsername').value,
            email: document.getElementById('email').value,
            botType: document.getElementById('botType').value,
            botDescription: document.getElementById('botDescription').value,
            budget: document.getElementById('budget').value,
            timeframe: document.getElementById('timeframe').value
        };
        
        // Show loading state
        formSuccess.style.display = 'none';
        formError.style.display = 'none';
        
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
                throw new Error('Network response was not ok');
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
            console.error('Error:', error);
        });
    });
});
