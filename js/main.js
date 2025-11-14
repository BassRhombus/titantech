// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            // Toggle both classes to ensure menu opens and hamburger animates
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Mobile dropdown toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Only handle dropdown on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling to document click handler
                const dropdown = this.closest('.dropdown');
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close mobile menu when clicking a link (except dropdown toggles)
    const navItems = document.querySelectorAll('.nav-links li a:not(.dropdown-toggle)');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Close dropdowns when clicking outside (desktop only)
    document.addEventListener('click', function(e) {
        // Only run on desktop to avoid interfering with mobile menu
        if (window.innerWidth > 768) {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });

    // Ensure dropdowns are not stuck open on page load
    const allDropdowns = document.querySelectorAll('.dropdown');
    allDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
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