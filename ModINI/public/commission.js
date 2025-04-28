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
        
        // Here you would typically send the data to your server/backend
        // For now, we'll simulate a successful submission
        
        // Simulate sending data to server with a timeout
        setTimeout(() => {
            // Simulate successful submission
            const success = true; // Change to false to test error state
            
            if (success) {
                // Show success message
                formSuccess.style.display = 'block';
                formError.style.display = 'none';
                commissionForm.reset();
                
                // Optional: Scroll to top of form to see success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Show error message
                formSuccess.style.display = 'none';
                formError.style.display = 'block';
            }
        }, 1500);
        
        // In a real implementation you would use something like:
        /*
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
            formSuccess.style.display = 'block';
            formError.style.display = 'none';
            commissionForm.reset();
        })
        .catch((error) => {
            formSuccess.style.display = 'none';
            formError.style.display = 'block';
            console.error('Error:', error);
        });
        */
    });
});
