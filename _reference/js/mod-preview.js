/**
 * Preview functionality for the Mod Manager
 * This script ensures the preview box displays properly when mods are selected
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Preview handler loaded');
    
    // Global tracking of selected mods
    window.selectedModIds = window.selectedModIds || new Set();
    
    // Ensure the checkbox click handler is properly set up
    document.getElementById('modsContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('mod-checkbox')) {
            const modId = e.target.dataset.id;
            console.log('Checkbox clicked:', modId, e.target.checked);
            
            if (e.target.checked) {
                window.selectedModIds.add(modId);
            } else {
                window.selectedModIds.delete(modId);
            }
            updatePreview();
        }
    });
    
    // Set up preview toggle
    const previewHeader = document.querySelector('.preview-header');
    const toggleBtn = document.getElementById('togglePreview');
    const configPreview = document.getElementById('configPreview');
    
    if (previewHeader && toggleBtn) {
        previewHeader.addEventListener('click', function() {
            configPreview.classList.toggle('collapsed');
            toggleBtn.classList.toggle('collapsed');
        });
    }
    
    // Hook into select/deselect all buttons
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.mod-checkbox').forEach(checkbox => {
                checkbox.checked = true;
                window.selectedModIds.add(checkbox.dataset.id);
            });
            updatePreview();
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.mod-checkbox').forEach(checkbox => {
                checkbox.checked = false;
                window.selectedModIds.delete(checkbox.dataset.id);
            });
            updatePreview();
        });
    }
    
    // Initialize preview (hide it initially if no mods are selected)
    updatePreview();
});

/**
 * Updates the preview box based on selected mods
 */
function updatePreview() {
    console.log('Updating preview');
    
    const selectedMods = [];
    document.querySelectorAll('.mod-checkbox:checked').forEach(checkbox => {
        selectedMods.push({
            id: checkbox.dataset.id,
            name: checkbox.dataset.name
        });
    });
    
    const previewBox = document.getElementById('configPreview');
    const selectedCountSpan = document.getElementById('selectedCount');
    const previewCode = document.getElementById('previewCode');
    
    if (!previewBox || !selectedCountSpan || !previewCode) {
        console.error('Preview elements not found');
        return;
    }
    
    // Update selected count
    selectedCountSpan.textContent = selectedMods.length;
    
    // Generate preview content
    if (selectedMods.length === 0) {
        previewCode.innerHTML = '[PathOfTitans.Mods]\n# No mods selected';
        previewBox.style.display = 'none';
        console.log('Preview hidden - no mods selected');
    } else {
        let previewContent = '[PathOfTitans.Mods]\n';
        
        selectedMods.forEach(mod => {
            previewContent += `EnabledMods=${mod.id}\n#${mod.name}\n`;
        });
        
        previewCode.innerHTML = previewContent;
        previewBox.style.display = 'block';
        console.log('Preview shown with', selectedMods.length, 'mods');
    }
}
