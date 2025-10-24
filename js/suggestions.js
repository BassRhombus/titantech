// Suggestions Page JavaScript

let suggestions = [];
let currentFilter = 'all';
let currentSort = 'popular';
let currentDiscordUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkDiscordAuth();
    loadSuggestions();
    setupEventListeners();
    setupCharacterCount();
});

// Check Discord authentication status
async function checkDiscordAuth() {
    try {
        const response = await fetch('/api/discord/user');
        const data = await response.json();

        if (data.success && data.user) {
            currentDiscordUser = data.user;
            displayDiscordUser(data.user);
        } else {
            displayDiscordLogin();
        }
    } catch (error) {
        console.error('Error checking Discord auth:', error);
        displayDiscordLogin();
    }
}

// Display Discord login button
function displayDiscordLogin() {
    const authSection = document.getElementById('discordAuthSection');
    if (authSection) {
        authSection.innerHTML = `
            <a href="/auth/discord" class="discord-login-btn">
                <i class="fab fa-discord"></i>
                Login with Discord
            </a>
            <p style="font-size: 0.9rem; color: #aaa; margin-top: 10px;">
                Login to moderate suggestions and comments
            </p>
        `;
    }
}

// Display Discord user info
function displayDiscordUser(user) {
    const authSection = document.getElementById('discordAuthSection');
    if (authSection) {
        const avatarUrl = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

        authSection.innerHTML = `
            <div class="discord-user-info">
                <img src="${avatarUrl}" alt="${user.username}" class="discord-avatar">
                <span class="discord-username">${user.username}#${user.discriminator}</span>
                ${user.isModerator ? '<span class="moderator-badge">Moderator</span>' : ''}
                <a href="/auth/discord/logout" class="discord-logout-btn">Logout</a>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('suggestionForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Filter and sort controls
    const filterSelect = document.getElementById('filterCategory');
    const sortSelect = document.getElementById('sortBy');

    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            displaySuggestions();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            displaySuggestions();
        });
    }
}

// Character count for textarea
function setupCharacterCount() {
    const textarea = document.getElementById('suggestionDescription');
    const charCount = document.getElementById('charCount');

    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    }
}

// Load suggestions from API
async function loadSuggestions() {
    const listContainer = document.getElementById('suggestionsList');

    try {
        const response = await fetch('/api/suggestions');

        if (!response.ok) {
            throw new Error('Failed to load suggestions');
        }

        suggestions = await response.json();
        displaySuggestions();

    } catch (error) {
        console.error('Error loading suggestions:', error);
        listContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load suggestions. Please try again later.</p>
            </div>
        `;
    }
}

// Display suggestions with current filter and sort
function displaySuggestions() {
    const listContainer = document.getElementById('suggestionsList');

    // Filter suggestions
    let filtered = suggestions;
    if (currentFilter !== 'all') {
        filtered = suggestions.filter(s => s.category === currentFilter);
    }

    // Sort suggestions
    filtered = sortSuggestions(filtered, currentSort);

    // Display
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>No suggestions found. Be the first to share your ideas!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map(suggestion => createSuggestionCard(suggestion)).join('');

    // Attach vote button listeners
    attachVoteListeners();

    // Attach comment listeners
    attachCommentListeners();

    // Attach delete button listeners (for moderators)
    attachDeleteListeners();
}

// Sort suggestions
function sortSuggestions(suggestions, sortBy) {
    const sorted = [...suggestions];

    switch (sortBy) {
        case 'popular':
            return sorted.sort((a, b) => b.votes - a.votes);
        case 'recent':
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        default:
            return sorted;
    }
}

// Create suggestion card HTML
function createSuggestionCard(suggestion) {
    const categoryClass = `category-${suggestion.category}`;
    const statusClass = `status-${suggestion.status || 'pending'}`;
    const votedClass = hasVoted(suggestion.id) ? 'voted' : '';
    const comments = suggestion.comments || [];
    const commentCount = comments.length;
    const isModerator = currentDiscordUser && currentDiscordUser.isModerator;

    return `
        <div class="suggestion-card" data-id="${suggestion.id}">
            <div class="suggestion-header">
                <div class="suggestion-title-group">
                    <h3 class="suggestion-title">${escapeHtml(suggestion.title)}</h3>
                    <div class="suggestion-meta">
                        <span class="suggestion-author">
                            <i class="fas fa-user"></i>
                            ${escapeHtml(suggestion.author || 'Anonymous')}
                        </span>
                        <span class="suggestion-date">
                            <i class="fas fa-clock"></i>
                            ${formatDate(suggestion.createdAt)}
                        </span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="category-badge ${categoryClass}">
                        ${getCategoryLabel(suggestion.category)}
                    </span>
                    ${isModerator ? `<button class="delete-btn delete-suggestion-btn" data-suggestion-id="${suggestion.id}">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>` : ''}
                </div>
            </div>

            <p class="suggestion-description">${escapeHtml(suggestion.description)}</p>

            <div class="suggestion-footer">
                <div class="vote-section">
                    <button class="vote-btn ${votedClass}" data-id="${suggestion.id}">
                        <i class="fas fa-arrow-up"></i>
                        Upvote
                    </button>
                    <span class="vote-count">${suggestion.votes || 0}</span>
                </div>
                ${suggestion.status && suggestion.status !== 'pending' ? `<span class="status-badge ${statusClass}">${getStatusLabel(suggestion.status)}</span>` : ''}
            </div>

            <div class="comments-section">
                <div class="comments-header">
                    <div class="comments-title">
                        <i class="fas fa-comments"></i>
                        <span>${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}</span>
                    </div>
                    <button class="toggle-comments-btn" data-suggestion-id="${suggestion.id}">
                        <span>Show Comments</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="comments-container" id="comments-${suggestion.id}">
                    <form class="comment-form" data-suggestion-id="${suggestion.id}">
                        <div class="comment-form-group">
                            <input type="text" class="comment-author-input" placeholder="Your name (optional)" maxlength="50">
                        </div>
                        <div class="comment-form-group">
                            <textarea class="comment-text-input" placeholder="Share your thoughts..." required maxlength="500"></textarea>
                        </div>
                        <button type="submit" class="comment-submit-btn">
                            <i class="fas fa-paper-plane"></i>
                            Post Comment
                        </button>
                    </form>
                    <div class="comments-list" id="comments-list-${suggestion.id}">
                        ${comments.length > 0 ? comments.map(comment => createCommentHTML(comment, suggestion.id)).join('') : '<div class="no-comments-message">No comments yet. Be the first to comment!</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('suggestionTitle').value.trim(),
        category: document.getElementById('suggestionCategory').value,
        description: document.getElementById('suggestionDescription').value.trim(),
        author: document.getElementById('suggestionAuthor').value.trim() || 'Anonymous'
    };

    // Validate
    if (!formData.title || !formData.category || !formData.description) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit suggestion');
        }

        const result = await response.json();

        // Show success message
        showMessage('Your suggestion has been submitted successfully!', 'success');

        // Reset form
        e.target.reset();
        document.getElementById('charCount').textContent = '0';

        // Reload suggestions
        await loadSuggestions();

        // Scroll to suggestions list
        document.querySelector('.suggestions-list-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    } catch (error) {
        console.error('Error submitting suggestion:', error);
        showMessage('Failed to submit suggestion. Please try again.', 'error');
    }
}

// Attach vote button listeners
function attachVoteListeners() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(btn => {
        btn.addEventListener('click', handleVote);
    });
}

// Handle voting
async function handleVote(e) {
    const button = e.currentTarget;
    const suggestionId = button.dataset.id;

    if (hasVoted(suggestionId)) {
        showMessage('You have already voted for this suggestion.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/vote`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to vote');
        }

        const result = await response.json();

        // Update local data
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
            suggestion.votes = result.votes;
        }

        // Mark as voted in local storage
        markAsVoted(suggestionId);

        // Re-display suggestions
        displaySuggestions();

    } catch (error) {
        console.error('Error voting:', error);
        showMessage('Failed to vote. Please try again.', 'error');
    }
}

// Check if user has voted for a suggestion
function hasVoted(suggestionId) {
    const voted = localStorage.getItem('voted_suggestions');
    if (!voted) return false;

    const votedIds = JSON.parse(voted);
    return votedIds.includes(suggestionId);
}

// Mark suggestion as voted
function markAsVoted(suggestionId) {
    let voted = localStorage.getItem('voted_suggestions');
    let votedIds = voted ? JSON.parse(voted) : [];

    if (!votedIds.includes(suggestionId)) {
        votedIds.push(suggestionId);
        localStorage.setItem('voted_suggestions', JSON.stringify(votedIds));
    }
}

// Show message to user
function showMessage(text, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${text}
    `;

    const form = document.getElementById('suggestionForm');
    form.parentNode.insertBefore(message, form);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        message.style.transition = 'opacity 0.3s ease';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

function getCategoryLabel(category) {
    const labels = {
        'features': 'New Features',
        'map-changes': 'Map Changes',
        'bugs': 'Bug Reports',
        'other': 'Other'
    };
    return labels[category] || category;
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'approved': 'Approved',
        'implemented': 'Implemented',
        'rejected': 'Rejected'
    };
    return labels[status] || status;
}

// =============================================================================
// Comments Functionality
// =============================================================================

// Create comment HTML
function createCommentHTML(comment, suggestionId) {
    const likedClass = hasLikedComment(suggestionId, comment.id) ? 'liked' : '';
    const isModerator = currentDiscordUser && currentDiscordUser.isModerator;

    return `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author-info">
                    <span class="comment-author">${escapeHtml(comment.author || 'Anonymous')}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                ${isModerator ? `<button class="delete-btn delete-comment-btn" data-suggestion-id="${suggestionId}" data-comment-id="${comment.id}">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-footer">
                <button class="comment-like-btn ${likedClass}" data-suggestion-id="${suggestionId}" data-comment-id="${comment.id}">
                    <i class="fas fa-heart"></i>
                    <span>Like</span>
                </button>
                <span class="comment-likes-count">${comment.likes || 0} ${(comment.likes || 0) === 1 ? 'like' : 'likes'}</span>
            </div>
        </div>
    `;
}

// Attach comment listeners
function attachCommentListeners() {
    // Toggle comments buttons
    const toggleButtons = document.querySelectorAll('.toggle-comments-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', handleToggleComments);
    });

    // Comment forms
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', handleCommentSubmit);
    });

    // Comment like buttons
    const likeButtons = document.querySelectorAll('.comment-like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', handleCommentLike);
    });
}

// Handle toggle comments
function handleToggleComments(e) {
    const button = e.currentTarget;
    const suggestionId = button.dataset.suggestionId;
    const container = document.getElementById(`comments-${suggestionId}`);
    const buttonText = button.querySelector('span');
    const icon = button.querySelector('i');

    if (container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        buttonText.textContent = 'Show Comments';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
        button.classList.remove('expanded');
    } else {
        container.classList.add('expanded');
        buttonText.textContent = 'Hide Comments';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        button.classList.add('expanded');
    }
}

// Handle comment submission
async function handleCommentSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const suggestionId = form.dataset.suggestionId;
    const authorInput = form.querySelector('.comment-author-input');
    const textInput = form.querySelector('.comment-text-input');

    const commentData = {
        text: textInput.value.trim(),
        author: authorInput.value.trim() || 'Anonymous'
    };

    if (!commentData.text) {
        return;
    }

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error('Failed to post comment');
        }

        const result = await response.json();

        // Reset form
        form.reset();

        // Reload suggestions to show new comment
        await loadSuggestions();

        // Keep comments expanded
        const container = document.getElementById(`comments-${suggestionId}`);
        const button = document.querySelector(`.toggle-comments-btn[data-suggestion-id="${suggestionId}"]`);
        if (container && button) {
            container.classList.add('expanded');
            const buttonText = button.querySelector('span');
            const icon = button.querySelector('i');
            buttonText.textContent = 'Hide Comments';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            button.classList.add('expanded');
        }

    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
    }
}

// Handle comment like
async function handleCommentLike(e) {
    e.preventDefault();

    const button = e.currentTarget;
    const suggestionId = button.dataset.suggestionId;
    const commentId = button.dataset.commentId;

    if (hasLikedComment(suggestionId, commentId)) {
        alert('You have already liked this comment.');
        return;
    }

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/comments/${commentId}/like`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to like comment');
        }

        const result = await response.json();

        // Mark as liked in local storage
        markCommentAsLiked(suggestionId, commentId);

        // Update the button and count
        button.classList.add('liked');
        const likesCount = button.parentElement.querySelector('.comment-likes-count');
        if (likesCount) {
            const likes = result.likes || 0;
            likesCount.textContent = `${likes} ${likes === 1 ? 'like' : 'likes'}`;
        }

    } catch (error) {
        console.error('Error liking comment:', error);
        alert('Failed to like comment. Please try again.');
    }
}

// Check if user has liked a comment
function hasLikedComment(suggestionId, commentId) {
    const liked = localStorage.getItem('liked_comments');
    if (!liked) return false;

    const likedComments = JSON.parse(liked);
    const key = `${suggestionId}-${commentId}`;
    return likedComments.includes(key);
}

// Mark comment as liked
function markCommentAsLiked(suggestionId, commentId) {
    let liked = localStorage.getItem('liked_comments');
    let likedComments = liked ? JSON.parse(liked) : [];

    const key = `${suggestionId}-${commentId}`;
    if (!likedComments.includes(key)) {
        likedComments.push(key);
        localStorage.setItem('liked_comments', JSON.stringify(likedComments));
    }
}

// =============================================================================
// Moderator Delete Functionality
// =============================================================================

// Attach delete button listeners
function attachDeleteListeners() {
    // Only if user is a moderator
    if (!currentDiscordUser || !currentDiscordUser.isModerator) {
        return;
    }

    // Delete suggestion buttons
    const deleteSuggestionButtons = document.querySelectorAll('.delete-suggestion-btn');
    deleteSuggestionButtons.forEach(btn => {
        btn.addEventListener('click', handleDeleteSuggestion);
    });

    // Delete comment buttons
    const deleteCommentButtons = document.querySelectorAll('.delete-comment-btn');
    deleteCommentButtons.forEach(btn => {
        btn.addEventListener('click', handleDeleteComment);
    });
}

// Handle suggestion deletion
async function handleDeleteSuggestion(e) {
    e.preventDefault();

    const button = e.currentTarget;
    const suggestionId = button.dataset.suggestionId;

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete suggestion');
        }

        const result = await response.json();

        // Show success message
        showMessage('Suggestion deleted successfully', 'success');

        // Reload suggestions
        await loadSuggestions();

    } catch (error) {
        console.error('Error deleting suggestion:', error);
        showMessage('Failed to delete suggestion. Please try again.', 'error');
    }
}

// Handle comment deletion
async function handleDeleteComment(e) {
    e.preventDefault();

    const button = e.currentTarget;
    const suggestionId = button.dataset.suggestionId;
    const commentId = button.dataset.commentId;

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/comments/${commentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }

        const result = await response.json();

        // Show success message
        showMessage('Comment deleted successfully', 'success');

        // Reload suggestions
        await loadSuggestions();

        // Keep comments expanded for this suggestion
        const container = document.getElementById(`comments-${suggestionId}`);
        const toggleButton = document.querySelector(`.toggle-comments-btn[data-suggestion-id="${suggestionId}"]`);
        if (container && toggleButton) {
            container.classList.add('expanded');
            const buttonText = toggleButton.querySelector('span');
            const icon = toggleButton.querySelector('i');
            buttonText.textContent = 'Hide Comments';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            toggleButton.classList.add('expanded');
        }

    } catch (error) {
        console.error('Error deleting comment:', error);
        showMessage('Failed to delete comment. Please try again.', 'error');
    }
}
