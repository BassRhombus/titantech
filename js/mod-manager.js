// Load the mods data
document.addEventListener('DOMContentLoaded', function() {
    loadModsData();
    
    // Set up auto-refresh every 10 minutes (600,000 ms)
    setInterval(loadModsData, 600000);
    
    document.getElementById('generateBtn').addEventListener('click', generateConfig);
    document.getElementById('selectAllBtn').addEventListener('click', selectAllMods);
    document.getElementById('deselectAllBtn').addEventListener('click', deselectAllMods);
    document.getElementById('searchInput').addEventListener('input', filterMods);
});

// Add this global variable at the top of your file, after the DOMContentLoaded event listener
let selectedModIds = new Set();

async function loadModsData() {
    try {
        showLoading();
        // Load from local file which is kept updated by the update-mods.js script
        const response = await fetch('ModINI/public/mods_details.json');
        const modsData = await response.json();
        
        window.modsData = modsData; // Store for filtering
        displayMods(modsData);
        updateLastRefreshed(); // Update the timestamp
    } catch (error) {
        console.error('Error loading mods data:', error);
        document.getElementById('modsContainer').innerHTML = '<p>Error loading mods data. Please try again later.</p>';
    }
}

/**
 * Updates the last refreshed timestamp display
 */
function updateLastRefreshed(source = '') {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    // Create or update the timestamp element
    let timestampDiv = document.getElementById('lastRefreshed');
    if (!timestampDiv) {
        // Create the element if it doesn't exist
        timestampDiv = document.createElement('div');
        timestampDiv.id = 'lastRefreshed';
        timestampDiv.className = 'refresh-info';
        
        // Insert it after the search bar
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.insertAdjacentElement('afterend', timestampDiv);
        }
    }
    
    timestampDiv.innerHTML = `<i class="fas fa-sync-alt"></i> Last updated: ${dateString} ${timeString} ${source}`;
}

// Update the displayMods function to preserve selections
function displayMods(mods) {
    const container = document.getElementById('modsContainer');
    container.innerHTML = '';
    
    mods.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'mod-card';
        
        // Generate unique ID for each checkbox
        const checkboxId = `mod-${mod.sku.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // Check if this mod was previously selected
        const isChecked = selectedModIds.has(mod.sku) ? 'checked' : '';
        
        modCard.innerHTML = `
            <img src="${mod.icon}" alt="${mod.name}" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image'">
            <h2>${mod.name}</h2>
            <p>${mod.description}</p>
            <label class="checkbox-container">
                <span>Select this mod</span>
                <input type="checkbox" id="${checkboxId}" class="mod-checkbox" data-id="${mod.sku}" data-name="${mod.name}" ${isChecked}>
                <svg viewBox="0 0 100 100">
                    <path class="path" d="M20,55 L40,75 L77,27" />
                </svg>
            </label>
        `;
        
        container.appendChild(modCard);
    });
    
    // Update the count to reflect current selections
    updateSelectedCount();
}

function filterMods() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!window.modsData) return;
    
    const filteredMods = window.modsData.filter(mod => 
        mod.name.toLowerCase().includes(searchTerm) || 
        mod.description.toLowerCase().includes(searchTerm)
    );
    
    displayMods(filteredMods);
}

// Update selectAllMods function
function selectAllMods() {
    const checkboxes = document.querySelectorAll('.mod-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        selectedModIds.add(checkbox.dataset.id);
    });
    updateSelectedCount();
}

// Update deselectAllMods function
function deselectAllMods() {
    document.querySelectorAll('.mod-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        selectedModIds.delete(checkbox.dataset.id);
    });
    updateSelectedCount();
}

function generateConfig() {
    const selectedMods = [];
    document.querySelectorAll('.mod-checkbox:checked').forEach(checkbox => {
        selectedMods.push({
            id: checkbox.dataset.id,
            name: checkbox.dataset.name
        });
    });
    
    if (selectedMods.length === 0) {
        alert('Please select at least one mod.');
        return;
    }
    
    let configContent = '[PathOfTitans.Mods]\n';
    
    selectedMods.forEach(mod => {
        configContent += `EnabledMods=${mod.id}\n#${mod.name}\n`;
    });
    
    downloadConfig(configContent, 'GameUserSettings.ini');
}

function downloadConfig(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = filename;
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    
    setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
    }, 100);
}

// Show loading indicator
function showLoading() {
    const container = document.getElementById('modsContainer');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading mods...</p>
        </div>
    `;
}

// Update count of selected mods
function updateSelectedCount() {
    const count = document.querySelectorAll('.mod-checkbox:checked').length;
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.textContent = count > 0 ? `Generate Config (${count})` : 'Generate Config';
}

// Update the click handler to track selections
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mod-checkbox')) {
        // Update our tracking Set when checkboxes are clicked
        const modId = e.target.dataset.id;
        if (e.target.checked) {
            selectedModIds.add(modId);
        } else {
            selectedModIds.delete(modId);
        }
        updateSelectedCount();
    }
});