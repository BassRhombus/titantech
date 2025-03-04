// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
    }
    
    // Discord username copy functionality
    const discordUsernames = document.querySelectorAll('.discord-username');
    discordUsernames.forEach(function(element) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const username = this.getAttribute('data-username');
            navigator.clipboard.writeText(username)
                .then(() => {
                    // Show a temporary tooltip or change text
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        });
    });
    
    // FAQ accordion functionality (if exists)
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});