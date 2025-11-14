// Reusable Category Checkbox Handler
// Allows users to click a category header checkbox to select/deselect all permissions in that category

/**
 * Creates a category checkbox header that controls all permissions within that category
 * @param {string} category - The category name
 * @param {HTMLElement} categoryDiv - The container div for this category
 * @returns {HTMLElement} - The category header element with checkbox
 */
function createCategoryCheckboxHeader(category, categoryDiv) {
    // Create category header with checkbox
    const categoryHeader = document.createElement('div');
    categoryHeader.style.display = 'flex';
    categoryHeader.style.alignItems = 'center';
    categoryHeader.style.gap = '10px';
    categoryHeader.style.marginBottom = '0.5rem';
    categoryHeader.style.cursor = 'pointer';

    const categoryCheckbox = document.createElement('input');
    categoryCheckbox.type = 'checkbox';
    categoryCheckbox.className = 'category-checkbox';
    categoryCheckbox.id = `cat-${category.replace(/\s/g, '-')}`;
    categoryCheckbox.style.width = '18px';
    categoryCheckbox.style.height = '18px';
    categoryCheckbox.style.cursor = 'pointer';
    categoryCheckbox.style.accentColor = 'var(--primary-color)';

    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = category;
    categoryTitle.style.margin = '0';
    categoryTitle.style.cursor = 'pointer';

    // Toggle all permissions in category when checkbox is clicked
    categoryCheckbox.addEventListener('change', (e) => {
        const permCheckboxes = categoryDiv.querySelectorAll('.permission-checkbox');
        permCheckboxes.forEach(cb => {
            cb.checked = e.target.checked;
        });

        // Trigger any additional checks (like creator mode permissions)
        if (typeof checkCreatorModePermissions === 'function') {
            checkCreatorModePermissions();
        }
    });

    // Also allow clicking the title to toggle
    categoryTitle.addEventListener('click', () => {
        categoryCheckbox.checked = !categoryCheckbox.checked;
        categoryCheckbox.dispatchEvent(new Event('change'));
    });

    categoryHeader.appendChild(categoryCheckbox);
    categoryHeader.appendChild(categoryTitle);

    return categoryHeader;
}

/**
 * Updates the category checkbox state based on individual permission selections
 * Shows checked, unchecked, or indeterminate state
 * @param {string} category - The category name
 * @param {HTMLElement} categoryDiv - The container div for this category
 */
function updateCategoryCheckboxState(category, categoryDiv) {
    const categoryCheckbox = categoryDiv.querySelector('.category-checkbox');
    const permCheckboxes = categoryDiv.querySelectorAll('.permission-checkbox');
    const checkedCount = Array.from(permCheckboxes).filter(cb => cb.checked).length;

    if (checkedCount === 0) {
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = false;
    } else if (checkedCount === permCheckboxes.length) {
        categoryCheckbox.checked = true;
        categoryCheckbox.indeterminate = false;
    } else {
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = true;
    }
}

/**
 * Attaches change listeners to permission checkboxes to update category checkbox state
 * @param {HTMLElement} categoryDiv - The container div for this category
 * @param {string} category - The category name
 * @param {Function} additionalCallback - Optional callback function to run when permission changes
 */
function attachPermissionChangeListeners(categoryDiv, category, additionalCallback = null) {
    const permCheckboxes = categoryDiv.querySelectorAll('.permission-checkbox');

    permCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCategoryCheckboxState(category, categoryDiv);

            // Run additional callback if provided
            if (additionalCallback && typeof additionalCallback === 'function') {
                additionalCallback();
            }

            // Also check for creator mode permissions if function exists
            if (typeof checkCreatorModePermissions === 'function') {
                checkCreatorModePermissions();
            }
        });
    });
}

/**
 * Complete setup for a category with checkbox header functionality
 * Call this after adding all permission checkboxes to a category div
 * @param {string} category - The category name
 * @param {HTMLElement} categoryDiv - The container div for this category
 * @param {Function} additionalCallback - Optional callback for when permissions change
 * @returns {HTMLElement} - The created category header element
 */
function setupCategoryCheckbox(category, categoryDiv, additionalCallback = null) {
    // Create and prepend the header
    const header = createCategoryCheckboxHeader(category, categoryDiv);
    categoryDiv.insertBefore(header, categoryDiv.firstChild);

    // Attach listeners to all permission checkboxes
    attachPermissionChangeListeners(categoryDiv, category, additionalCallback);

    // Set initial state
    updateCategoryCheckboxState(category, categoryDiv);

    return header;
}
