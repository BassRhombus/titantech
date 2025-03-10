// Load the mods data
document.addEventListener('DOMContentLoaded', function() {
    loadModsData();
    
    document.getElementById('generateBtn').addEventListener('click', generateConfig);
    document.getElementById('selectAllBtn').addEventListener('click', selectAllMods);
    document.getElementById('deselectAllBtn').addEventListener('click', deselectAllMods);
    document.getElementById('searchInput').addEventListener('input', filterMods);
});

async function loadModsData() {
    try {
        showLoading();
        const modsData = await fetch('ModINI/public/mods_details.json').then(response => response.json());
        window.modsData = modsData; // Store for filtering
        displayMods(modsData);
    } catch (error) {
        console.error('Error loading mods data:', error);
        document.getElementById('modsContainer').innerHTML = '<p>Error loading mods data. Please try again later.</p>';
    }
}

function displayMods(mods) {
    const container = document.getElementById('modsContainer');
    container.innerHTML = '';
    
    mods.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'mod-card';
        
        // Generate unique ID for each checkbox
        const checkboxId = `mod-${mod.sku.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        modCard.innerHTML = `
            <img src="${mod.icon}" alt="${mod.name}" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image'">
            <h2>${mod.name}</h2>
            <p>${mod.description}</p>
            <label class="checkbox-container">
                <span>Select this mod</span>
                <input type="checkbox" id="${checkboxId}" class="mod-checkbox" data-id="${mod.sku}" data-name="${mod.name}">
                <svg viewBox="0 0 100 100">
                    <path class="path" d="M20,55 L40,75 L77,27" />
                </svg>
            </label>
        `;
        
        container.appendChild(modCard);
    });
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

function selectAllMods() {
    document.querySelectorAll('.mod-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    updateSelectedCount();
}

function deselectAllMods() {
    document.querySelectorAll('.mod-checkbox').forEach(checkbox => {
        checkbox.checked = false;
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

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mod-checkbox')) {
        updateSelectedCount();
    }
});