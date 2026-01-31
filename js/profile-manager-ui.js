/**
 * Profile Manager UI Module
 *
 * Shared frontend component for managing Discord-linked user profiles
 * across all INI generators (Commands.ini, Game.ini, Rules/MOTD).
 *
 * Usage:
 *   1. Include this script in your generator HTML
 *   2. Add the profile section HTML (see template below)
 *   3. Initialize with: ProfileManager.init('generator-type', callbacks)
 */

const ProfileManager = (function() {
  // Current user state
  let currentUser = null;
  let generatorType = null;
  let profiles = [];

  // Callbacks provided by the generator
  let callbacks = {
    getCurrentData: () => ({}),  // Function to get current generator state
    loadData: (data) => {},       // Function to load data into generator
    onSaveSuccess: () => {},      // Called after successful save
    onLoadSuccess: () => {}       // Called after successful load
  };

  /**
   * Initialize the profile manager
   * @param {string} type - Generator type: 'commands-ini', 'game-ini', or 'rules-motd'
   * @param {object} generatorCallbacks - Callbacks for interacting with the generator
   */
  async function init(type, generatorCallbacks) {
    generatorType = type;

    // Merge provided callbacks with defaults
    callbacks = { ...callbacks, ...generatorCallbacks };

    // Check if user is logged in
    await checkAuthStatus();

    // Setup event listeners
    setupEventListeners();
  }

  /**
   * Check Discord authentication status
   */
  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/discord/user');
      const data = await response.json();

      if (data.success && data.user) {
        currentUser = data.user;
        showAuthenticatedUI();
        await loadProfiles();
      } else {
        currentUser = null;
        showUnauthenticatedUI();
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      currentUser = null;
      showUnauthenticatedUI();
    }
  }

  /**
   * Show UI for authenticated users
   */
  function showAuthenticatedUI() {
    const profileSection = document.getElementById('profileSection');
    const loginPrompt = document.getElementById('loginPrompt');

    if (profileSection) {
      profileSection.style.display = 'flex';

      // Update user info display
      const discordUserEl = document.getElementById('discordUser');
      if (discordUserEl && currentUser) {
        discordUserEl.innerHTML = `
          <img src="${currentUser.avatarUrl}" alt="Avatar" class="discord-avatar">
          <span class="discord-username">${escapeHtml(currentUser.username)}</span>
        `;
      }
    }

    if (loginPrompt) {
      loginPrompt.style.display = 'none';
    }
  }

  /**
   * Show UI for unauthenticated users
   */
  function showUnauthenticatedUI() {
    const profileSection = document.getElementById('profileSection');
    const loginPrompt = document.getElementById('loginPrompt');

    if (profileSection) {
      profileSection.style.display = 'none';
    }

    if (loginPrompt) {
      loginPrompt.style.display = 'block';
    }
  }

  /**
   * Setup event listeners for profile UI
   */
  function setupEventListeners() {
    // Save profile button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', showSaveModal);
    }

    // Load profile button
    const loadBtn = document.getElementById('loadProfileBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', showLoadModal);
    }

    // Modal close buttons
    document.querySelectorAll('.profile-modal-close').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });

    // Close modal when clicking outside
    document.querySelectorAll('.profile-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModals();
        }
      });
    });

    // Save form submission
    const saveForm = document.getElementById('saveProfileForm');
    if (saveForm) {
      saveForm.addEventListener('submit', handleSaveProfile);
    }
  }

  /**
   * Load user's profiles from API
   */
  async function loadProfiles() {
    if (!currentUser || !generatorType) return;

    try {
      const response = await fetch(`/api/profiles/${generatorType}`);
      const data = await response.json();

      if (data.success) {
        profiles = data.profiles;
        updateProfileCount();
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      profiles = [];
    }
  }

  /**
   * Update profile count display
   */
  function updateProfileCount() {
    const countEl = document.getElementById('profileCount');
    if (countEl) {
      countEl.textContent = `${profiles.length}/10`;
    }
  }

  /**
   * Show save profile modal
   */
  function showSaveModal() {
    const modal = document.getElementById('saveProfileModal');
    if (modal) {
      modal.classList.add('active');
      const nameInput = document.getElementById('profileName');
      if (nameInput) {
        nameInput.value = '';
        nameInput.focus();
      }
    }
  }

  /**
   * Show load profile modal
   */
  async function showLoadModal() {
    await loadProfiles(); // Refresh profiles list

    const modal = document.getElementById('loadProfileModal');
    const listContainer = document.getElementById('profilesList');

    if (!modal || !listContainer) return;

    // Populate profiles list
    if (profiles.length === 0) {
      listContainer.innerHTML = `
        <p class="no-profiles-message">No saved profiles yet. Create one by clicking "Save Profile".</p>
      `;
    } else {
      listContainer.innerHTML = profiles.map(profile => `
        <div class="profile-item" data-profile-id="${profile.id}">
          <div class="profile-item-info">
            <span class="profile-item-name">${escapeHtml(profile.name)}</span>
            <span class="profile-item-date">Last updated: ${formatDate(profile.updatedAt)}</span>
          </div>
          <div class="profile-item-actions">
            <button class="btn btn-success btn-sm profile-load-btn" data-profile-id="${profile.id}">
              <i class="fas fa-folder-open"></i> Load
            </button>
            <button class="btn btn-danger btn-sm profile-delete-btn" data-profile-id="${profile.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');

      // Add event listeners for load buttons
      listContainer.querySelectorAll('.profile-load-btn').forEach(btn => {
        btn.addEventListener('click', () => handleLoadProfile(btn.dataset.profileId));
      });

      // Add event listeners for delete buttons
      listContainer.querySelectorAll('.profile-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteProfile(btn.dataset.profileId));
      });
    }

    modal.classList.add('active');
  }

  /**
   * Close all modals
   */
  function closeModals() {
    document.querySelectorAll('.profile-modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  /**
   * Handle save profile form submission
   */
  async function handleSaveProfile(e) {
    e.preventDefault();

    const nameInput = document.getElementById('profileName');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
      showNotification('Please enter a profile name', 'error');
      return;
    }

    // Get current generator data
    const data = callbacks.getCurrentData();

    try {
      const response = await fetch(`/api/profiles/${generatorType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, data })
      });

      const result = await response.json();

      if (result.success) {
        showNotification(`Profile "${name}" saved successfully!`, 'success');
        closeModals();
        await loadProfiles();
        callbacks.onSaveSuccess();
      } else {
        showNotification(result.message || 'Failed to save profile', 'error');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      showNotification('Error saving profile. Please try again.', 'error');
    }
  }

  /**
   * Handle loading a profile
   */
  async function handleLoadProfile(profileId) {
    try {
      const response = await fetch(`/api/profiles/${generatorType}/${profileId}`);
      const result = await response.json();

      if (result.success && result.profile) {
        // Load data into generator
        callbacks.loadData(result.profile.data);

        showNotification(`Profile "${result.profile.name}" loaded successfully!`, 'success');
        closeModals();
        callbacks.onLoadSuccess();
      } else {
        showNotification(result.message || 'Failed to load profile', 'error');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      showNotification('Error loading profile. Please try again.', 'error');
    }
  }

  /**
   * Handle deleting a profile
   */
  async function handleDeleteProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    const profileName = profile ? profile.name : 'this profile';

    if (!confirm(`Are you sure you want to delete "${profileName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${generatorType}/${profileId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        showNotification('Profile deleted successfully', 'success');
        await loadProfiles();
        // Refresh the modal content
        showLoadModal();
      } else {
        showNotification(result.message || 'Failed to delete profile', 'error');
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      showNotification('Error deleting profile. Please try again.', 'error');
    }
  }

  /**
   * Show notification message
   */
  function showNotification(message, type = 'info') {
    // Check if there's a notification container
    let container = document.getElementById('profileNotification');

    if (!container) {
      // Create notification container if it doesn't exist
      container = document.createElement('div');
      container.id = 'profileNotification';
      container.className = 'profile-notification';
      document.body.appendChild(container);
    }

    container.textContent = message;
    container.className = `profile-notification ${type} show`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      container.classList.remove('show');
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get the HTML template for profile management UI
   * Call this to get the HTML to inject into your generator page
   */
  function getTemplate() {
    return `
      <!-- Profile Management Section -->
      <div id="profileSection" class="profile-section" style="display: none;">
        <div id="discordUser" class="discord-user"></div>
        <div class="profile-actions">
          <button id="saveProfileBtn" class="btn btn-success">
            <i class="fas fa-save"></i> Save Profile
          </button>
          <button id="loadProfileBtn" class="btn btn-info">
            <i class="fas fa-folder-open"></i> Load Profile <span id="profileCount" class="profile-count"></span>
          </button>
        </div>
      </div>

      <!-- Login Prompt (shown when not authenticated) -->
      <div id="loginPrompt" class="login-prompt" style="display: none;">
        <a href="/auth/discord" class="btn btn-primary discord-login-btn">
          <i class="fab fa-discord"></i> Login with Discord to Save Profiles
        </a>
      </div>

      <!-- Save Profile Modal -->
      <div id="saveProfileModal" class="profile-modal-overlay">
        <div class="profile-modal">
          <div class="profile-modal-header">
            <h3>Save Profile</h3>
            <button class="profile-modal-close">&times;</button>
          </div>
          <form id="saveProfileForm">
            <div class="profile-form-group">
              <label for="profileName">Profile Name</label>
              <input type="text" id="profileName" placeholder="Enter a name for this profile" maxlength="50" required>
            </div>
            <div class="profile-modal-footer">
              <button type="button" class="btn btn-danger profile-modal-close">Cancel</button>
              <button type="submit" class="btn btn-success">
                <i class="fas fa-save"></i> Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Load Profile Modal -->
      <div id="loadProfileModal" class="profile-modal-overlay">
        <div class="profile-modal">
          <div class="profile-modal-header">
            <h3>Load Profile</h3>
            <button class="profile-modal-close">&times;</button>
          </div>
          <div id="profilesList" class="profiles-list">
            <!-- Profiles will be loaded here -->
          </div>
          <div class="profile-modal-footer">
            <button type="button" class="btn btn-danger profile-modal-close">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get the CSS styles for profile management UI
   */
  function getStyles() {
    return `
      /* Profile Section */
      .profile-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, rgba(0, 207, 255, 0.1) 0%, rgba(217, 79, 203, 0.1) 100%);
        border: 1px solid rgba(0, 207, 255, 0.3);
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .discord-user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .discord-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--neon-blue);
      }

      .discord-username {
        color: var(--light-color);
        font-weight: 600;
        font-family: 'Rajdhani', sans-serif;
      }

      .profile-actions {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
      }

      .profile-count {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-left: 4px;
      }

      /* Login Prompt */
      .login-prompt {
        text-align: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px dashed rgba(0, 207, 255, 0.3);
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .discord-login-btn {
        background: #5865F2 !important;
        box-shadow: 0 0 15px rgba(88, 101, 242, 0.4);
      }

      .discord-login-btn:hover {
        background: #4752C4 !important;
        box-shadow: 0 0 25px rgba(88, 101, 242, 0.6);
      }

      /* Profile Modal */
      .profile-modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        justify-content: center;
        align-items: center;
      }

      .profile-modal-overlay.active {
        display: flex;
      }

      .profile-modal {
        background: linear-gradient(135deg, #1A1A2B 0%, #0D0D14 100%);
        border: 2px solid var(--neon-blue);
        border-radius: 12px;
        padding: 1.5rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 207, 255, 0.3);
        animation: modalSlideIn 0.3s ease-out;
      }

      .profile-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0, 207, 255, 0.3);
      }

      .profile-modal-header h3 {
        color: var(--neon-blue);
        margin: 0;
        font-family: 'Rajdhani', sans-serif;
        text-transform: uppercase;
      }

      .profile-modal-close {
        background: none;
        border: none;
        color: #aaa;
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.3s;
        line-height: 1;
      }

      .profile-modal-close:hover {
        color: var(--neon-magenta);
      }

      .profile-form-group {
        margin-bottom: 1.5rem;
      }

      .profile-form-group label {
        display: block;
        color: #e0e0e0;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .profile-form-group input {
        width: 100%;
        padding: 10px;
        background-color: #252525;
        border: 1px solid #333;
        color: #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
      }

      .profile-form-group input:focus {
        outline: none;
        border-color: var(--neon-blue);
        box-shadow: 0 0 8px rgba(0, 207, 255, 0.3);
      }

      .profile-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(0, 207, 255, 0.3);
      }

      /* Profiles List */
      .profiles-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .no-profiles-message {
        text-align: center;
        color: #aaa;
        padding: 2rem;
      }

      .profile-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(0, 207, 255, 0.2);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        transition: all 0.3s ease;
      }

      .profile-item:hover {
        border-color: var(--neon-blue);
        box-shadow: 0 0 10px rgba(0, 207, 255, 0.2);
      }

      .profile-item-info {
        flex: 1;
      }

      .profile-item-name {
        display: block;
        color: var(--light-color);
        font-weight: 600;
        font-size: 1rem;
      }

      .profile-item-date {
        display: block;
        color: #888;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .profile-item-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 0.85rem;
      }

      /* Notification */
      .profile-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10002;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }

      .profile-notification.show {
        transform: translateX(0);
      }

      .profile-notification.success {
        background: linear-gradient(135deg, #28a745, #20c997);
      }

      .profile-notification.error {
        background: linear-gradient(135deg, #dc3545, #e83e8c);
      }

      .profile-notification.info {
        background: linear-gradient(135deg, #17a2b8, #00CFFF);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .profile-section {
          flex-direction: column;
          align-items: stretch;
        }

        .profile-actions {
          margin-left: 0;
          justify-content: center;
        }

        .profile-item {
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-item-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `;
  }

  // Public API
  return {
    init,
    checkAuthStatus,
    loadProfiles,
    getTemplate,
    getStyles,
    showNotification,
    getCurrentUser: () => currentUser,
    getProfiles: () => profiles
  };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileManager;
}
