// Commands.ini Role Generator
// Stores all roles and player assignments
let roles = [];
let playerRoles = [];
let editingRoleIndex = null;
let editingPlayerIndex = null;

// Initialize the generator
document.addEventListener('DOMContentLoaded', function() {
    renderRolesList();
    renderPlayersList();
    setupEventListeners();
    generatePreview();
});

function setupEventListeners() {
    document.getElementById('addRoleBtn').addEventListener('click', () => openRoleModal());
    document.getElementById('generateBtn').addEventListener('click', generateConfig);
    document.getElementById('downloadBtn').addEventListener('click', downloadConfig);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', uploadConfig);

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeRoleModal);
    document.getElementById('cancelRoleBtn').addEventListener('click', closeRoleModal);
    document.getElementById('saveRoleBtn').addEventListener('click', saveRole);

    // Color picker inputs
    ['r', 'g', 'b', 'a'].forEach(channel => {
        document.getElementById(`color-${channel}`).addEventListener('input', updateColorPreview);
    });

    // Search permissions
    document.getElementById('permissionSearch').addEventListener('input', filterPermissions);

    // Select all/none buttons
    document.getElementById('selectAllPermissions').addEventListener('click', () => selectAllPermissions(true));
    document.getElementById('selectNonePermissions').addEventListener('click', () => selectAllPermissions(false));

    // Template buttons
    document.getElementById('templateAdmin').addEventListener('click', () => loadTemplate('admin'));
    document.getElementById('templateModerator').addEventListener('click', () => loadTemplate('moderator'));
    document.getElementById('templateVIP').addEventListener('click', () => loadTemplate('vip'));

    // Player assignment controls
    document.getElementById('addPlayerBtn').addEventListener('click', () => openPlayerModal());
    document.getElementById('closePlayerModal').addEventListener('click', closePlayerModal);
    document.getElementById('cancelPlayerBtn').addEventListener('click', closePlayerModal);
    document.getElementById('savePlayerBtn').addEventListener('click', savePlayer);
}

function openRoleModal(index = null) {
    editingRoleIndex = index;
    const modal = document.getElementById('roleModal');
    modal.classList.add('active');

    if (index !== null && roles[index]) {
        // Edit existing role
        loadRoleIntoForm(roles[index]);
        document.getElementById('modalTitle').textContent = 'Edit Role';
    } else {
        // New role
        resetRoleForm();
        document.getElementById('modalTitle').textContent = 'Add New Role';
    }

    renderPermissionsCheckboxes();
}

function closeRoleModal() {
    document.getElementById('roleModal').classList.remove('active');
    editingRoleIndex = null;
}

function loadRoleIntoForm(role) {
    document.getElementById('roleName').value = role.name;
    document.getElementById('color-r').value = role.chatColor.r;
    document.getElementById('color-g').value = role.chatColor.g;
    document.getElementById('color-b').value = role.chatColor.b;
    document.getElementById('color-a').value = role.chatColor.a;
    document.getElementById('overrideAdminChatColor').checked = role.overrideAdminChatColor;
    document.getElementById('reservedSlot').checked = role.reservedSlot;
    document.getElementById('hierarchy').value = role.hierarchy;
    document.getElementById('creatorModeAccess').checked = role.creatorModeAccess;
    document.getElementById('allowSpectatorAccess').checked = role.allowSpectatorAccess;

    updateColorPreview();
}

function resetRoleForm() {
    document.getElementById('roleName').value = '';
    document.getElementById('color-r').value = 255;
    document.getElementById('color-g').value = 255;
    document.getElementById('color-b').value = 255;
    document.getElementById('color-a').value = 1;
    document.getElementById('overrideAdminChatColor').checked = true;
    document.getElementById('reservedSlot').checked = false;
    document.getElementById('hierarchy').value = 0;
    document.getElementById('creatorModeAccess').checked = false;
    document.getElementById('allowSpectatorAccess').checked = false;

    // Uncheck all permissions
    document.querySelectorAll('.permission-checkbox').forEach(cb => cb.checked = false);

    updateColorPreview();
}

function updateColorPreview() {
    const r = document.getElementById('color-r').value;
    const g = document.getElementById('color-g').value;
    const b = document.getElementById('color-b').value;
    const a = document.getElementById('color-a').value;

    // Update labels
    document.getElementById('color-r-value').textContent = r;
    document.getElementById('color-g-value').textContent = g;
    document.getElementById('color-b-value').textContent = b;
    document.getElementById('color-a-value').textContent = a;

    // Update preview
    const preview = document.getElementById('colorPreview');
    preview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
}

function renderPermissionsCheckboxes(filter = '') {
    const container = document.getElementById('permissionsContainer');
    container.innerHTML = '';

    Object.keys(permissionsList).forEach(category => {
        const permissions = permissionsList[category];
        const filteredPerms = filter
            ? permissions.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.description.toLowerCase().includes(filter.toLowerCase()))
            : permissions;

        if (filteredPerms.length === 0) return;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'permission-category';

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
            checkCreatorModePermissions();
        });

        // Also allow clicking the title to toggle
        categoryTitle.addEventListener('click', () => {
            categoryCheckbox.checked = !categoryCheckbox.checked;
            categoryCheckbox.dispatchEvent(new Event('change'));
        });

        categoryHeader.appendChild(categoryCheckbox);
        categoryHeader.appendChild(categoryTitle);
        categoryDiv.appendChild(categoryHeader);

        filteredPerms.forEach(perm => {
            const label = document.createElement('label');
            label.className = 'permission-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'permission-checkbox';
            checkbox.value = perm.id;
            checkbox.id = `perm-${perm.id.replace(/\s/g, '-')}`;
            checkbox.dataset.category = category;

            // Check if this permission is selected (when editing)
            if (editingRoleIndex !== null && roles[editingRoleIndex]) {
                checkbox.checked = roles[editingRoleIndex].permissions.includes(perm.id);
            }

            // Update category checkbox state when individual permission changes
            checkbox.addEventListener('change', () => {
                updateCategoryCheckboxState(category, categoryDiv);
                checkCreatorModePermissions();
            });

            const labelText = document.createElement('span');
            labelText.innerHTML = `<strong>${perm.name}</strong> - ${perm.description}`;

            label.appendChild(checkbox);
            label.appendChild(labelText);
            categoryDiv.appendChild(label);
        });

        // Set initial category checkbox state
        updateCategoryCheckboxState(category, categoryDiv);

        container.appendChild(categoryDiv);
    });
}

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

function checkCreatorModePermissions() {
    // List of creator mode permission IDs
    const creatorModePermissions = [
        'listcreatormode',
        'loadcreatormode',
        'savecreatormode',
        'clearcreatorobjects',
        'resetcreatormode',
        'replenishcreatormode'
    ];

    // Check if any creator mode permissions are selected
    const hasCreatorModePerms = creatorModePermissions.some(permId => {
        const checkbox = document.getElementById(`perm-${permId.replace(/\s/g, '-')}`);
        return checkbox && checkbox.checked;
    });

    // Automatically check the toggles if creator mode permissions are selected
    if (hasCreatorModePerms) {
        document.getElementById('creatorModeAccess').checked = true;
        document.getElementById('allowSpectatorAccess').checked = true;
    }
}

function filterPermissions() {
    const searchTerm = document.getElementById('permissionSearch').value;
    renderPermissionsCheckboxes(searchTerm);
}

function selectAllPermissions(select) {
    document.querySelectorAll('.permission-checkbox').forEach(cb => {
        cb.checked = select;
    });

    // Update all category checkboxes
    document.querySelectorAll('.permission-category').forEach(categoryDiv => {
        const category = categoryDiv.querySelector('h4').textContent;
        updateCategoryCheckboxState(category, categoryDiv);
    });

    // Check creator mode toggles if needed
    checkCreatorModePermissions();
}

function saveRole() {
    const name = document.getElementById('roleName').value.trim();

    if (!name) {
        alert('Please enter a role name');
        return;
    }

    const role = {
        name: name,
        chatColor: {
            r: parseInt(document.getElementById('color-r').value),
            g: parseInt(document.getElementById('color-g').value),
            b: parseInt(document.getElementById('color-b').value),
            a: parseFloat(document.getElementById('color-a').value)
        },
        overrideAdminChatColor: document.getElementById('overrideAdminChatColor').checked,
        reservedSlot: document.getElementById('reservedSlot').checked,
        hierarchy: parseInt(document.getElementById('hierarchy').value),
        creatorModeAccess: document.getElementById('creatorModeAccess').checked,
        allowSpectatorAccess: document.getElementById('allowSpectatorAccess').checked,
        permissions: []
    };

    // Get selected permissions
    document.querySelectorAll('.permission-checkbox:checked').forEach(cb => {
        role.permissions.push(cb.value);
    });

    if (editingRoleIndex !== null) {
        // Update existing role
        roles[editingRoleIndex] = role;
    } else {
        // Add new role
        roles.push(role);
    }

    closeRoleModal();
    renderRolesList();
    generatePreview();
}

function renderRolesList() {
    const container = document.getElementById('rolesListContainer');

    if (roles.length === 0) {
        container.innerHTML = '<p class="no-roles">No roles created yet. Click "Add New Role" to get started.</p>';
        return;
    }

    container.innerHTML = roles.map((role, index) => `
        <div class="role-card">
            <div class="role-header">
                <div class="role-title-group">
                    <div class="role-color-preview" style="background-color: rgba(${role.chatColor.r}, ${role.chatColor.g}, ${role.chatColor.b}, ${role.chatColor.a})"></div>
                    <h3>${role.name}</h3>
                    <span class="hierarchy-badge">Hierarchy: ${role.hierarchy}</span>
                </div>
                <div class="role-actions">
                    <button class="btn-icon" onclick="openRoleModal(${index})" title="Edit Role">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="duplicateRole(${index})" title="Duplicate Role">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteRole(${index})" title="Delete Role">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="role-details">
                <div class="role-badges">
                    ${role.overrideAdminChatColor ? '<span class="badge">Override Admin Chat</span>' : ''}
                    ${role.reservedSlot ? '<span class="badge">Reserved Slot</span>' : ''}
                    ${role.creatorModeAccess ? '<span class="badge">Creator Mode</span>' : ''}
                    ${role.allowSpectatorAccess ? '<span class="badge">Spectator Access</span>' : ''}
                </div>
                <p class="permissions-count">
                    <i class="fas fa-key"></i> ${role.permissions.length} permission(s)
                </p>
            </div>
        </div>
    `).join('');
}

function deleteRole(index) {
    if (confirm(`Are you sure you want to delete the role "${roles[index].name}"?`)) {
        roles.splice(index, 1);
        renderRolesList();
        generatePreview();
    }
}

function duplicateRole(index) {
    const originalRole = roles[index];
    const newRole = JSON.parse(JSON.stringify(originalRole)); // Deep clone
    newRole.name = `${originalRole.name} (Copy)`;
    roles.push(newRole);
    renderRolesList();
    generatePreview();
}

function generatePreview() {
    const output = generateConfigString();
    document.getElementById('configPreview').textContent = output;

    // Update role count
    document.getElementById('roleCount').textContent = roles.length;
}

function generateConfigString() {
    if (roles.length === 0 && playerRoles.length === 0) {
        return '; No roles created yet\n; Add roles using the "Add New Role" button';
    }

    let output = '';

    // Generate roles section
    roles.forEach(role => {
        output += `[Role:${role.name}]\n`;
        output += `ChatColor=(R=${role.chatColor.r},G=${role.chatColor.g},B=${role.chatColor.b},A=${role.chatColor.a})\n`;
        output += `OverrideAdminChatColor=${role.overrideAdminChatColor ? 'True' : 'False'}\n`;

        if (role.reservedSlot) {
            output += `ReservedSlot=True\n`;
        }

        output += `Hierarchy=${role.hierarchy}\n`;

        if (role.creatorModeAccess) {
            output += `CreatorModeAccess=True\n`;
        }

        if (role.allowSpectatorAccess) {
            output += `AllowSpectatorAccess=True\n`;
        }

        // Add permissions
        role.permissions.forEach(perm => {
            output += `+Permission=${perm}\n`;
        });

        output += '\n';
    });

    // Generate player roles section
    if (playerRoles.length > 0) {
        output += '[PlayerRoles]\n';
        playerRoles.forEach(player => {
            output += `${player.agid}=${player.role}\n`;
        });
    }

    return output.trim();
}

function generateConfig() {
    generatePreview();
    alert('Configuration generated! Use Download or Copy to Clipboard buttons.');
}

async function downloadConfig() {
    const output = generateConfigString();

    // Send webhook notification
    try {
        await fetch('/api/webhook/game-ini-generated', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileType: 'Commands.ini',
                changedSettingsCount: roles.length,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Failed to send webhook notification:', error);
    }

    // Download the file
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Commands.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const output = generateConfigString();
    navigator.clipboard.writeText(output).then(() => {
        alert('Configuration copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function resetAll() {
    if (confirm('Are you sure you want to reset all roles and player assignments? This cannot be undone.')) {
        roles = [];
        playerRoles = [];
        renderRolesList();
        renderPlayersList();
        generatePreview();
    }
}

function uploadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseCommandsINI(content);
    };
    reader.readAsText(file);
}

function parseCommandsINI(content) {
    roles = [];
    playerRoles = [];
    const lines = content.split('\n');
    let currentRole = null;
    let inPlayerRolesSection = false;

    lines.forEach(line => {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith(';')) return;

        // Check for PlayerRoles section
        if (line === '[PlayerRoles]') {
            if (currentRole) {
                roles.push(currentRole);
                currentRole = null;
            }
            inPlayerRolesSection = true;
            return;
        }

        // If in PlayerRoles section, parse player assignments
        if (inPlayerRolesSection) {
            const playerMatch = line.match(/^(\d{3}-\d{3}-\d{3})=(.+)$/);
            if (playerMatch) {
                playerRoles.push({
                    agid: playerMatch[1],
                    role: playerMatch[2]
                });
            }
            return;
        }

        // Check for role header
        const roleMatch = line.match(/^\[Role:(.+)\]$/);
        if (roleMatch) {
            if (currentRole) {
                roles.push(currentRole);
            }
            currentRole = {
                name: roleMatch[1],
                chatColor: { r: 255, g: 255, b: 255, a: 1 },
                overrideAdminChatColor: false,
                reservedSlot: false,
                hierarchy: 0,
                creatorModeAccess: false,
                allowSpectatorAccess: false,
                permissions: []
            };
            return;
        }

        if (!currentRole) return;

        // Parse ChatColor
        const colorMatch = line.match(/ChatColor=\(R=(\d+),G=(\d+),B=(\d+),A=([\d.]+)\)/);
        if (colorMatch) {
            currentRole.chatColor = {
                r: parseInt(colorMatch[1]),
                g: parseInt(colorMatch[2]),
                b: parseInt(colorMatch[3]),
                a: parseFloat(colorMatch[4])
            };
            return;
        }

        // Parse boolean properties
        if (line.startsWith('OverrideAdminChatColor=')) {
            currentRole.overrideAdminChatColor = line.includes('True');
        } else if (line.startsWith('ReservedSlot=')) {
            currentRole.reservedSlot = line.includes('True');
        } else if (line.startsWith('CreatorModeAccess=')) {
            currentRole.creatorModeAccess = line.includes('True');
        } else if (line.startsWith('AllowSpectatorAccess=')) {
            currentRole.allowSpectatorAccess = line.includes('True');
        } else if (line.startsWith('Hierarchy=')) {
            currentRole.hierarchy = parseInt(line.split('=')[1]);
        } else if (line.startsWith('+Permission=')) {
            const perm = line.split('=')[1];
            currentRole.permissions.push(perm);
        }
    });

    // Add last role
    if (currentRole) {
        roles.push(currentRole);
    }

    renderRolesList();
    renderPlayersList();
    generatePreview();
    alert(`Loaded ${roles.length} role(s) and ${playerRoles.length} player assignment(s) from file`);
}

function loadTemplate(type) {
    let templateRole = null;

    switch(type) {
        case 'admin':
            templateRole = {
                name: 'Admin',
                chatColor: { r: 255, g: 0, b: 0, a: 1 },
                overrideAdminChatColor: true,
                reservedSlot: true,
                hierarchy: 9,
                creatorModeAccess: true,
                allowSpectatorAccess: true,
                permissions: allPermissionIds
            };
            break;
        case 'moderator':
            templateRole = {
                name: 'Moderator',
                chatColor: { r: 0, g: 150, b: 255, a: 1 },
                overrideAdminChatColor: true,
                reservedSlot: true,
                hierarchy: 7,
                creatorModeAccess: false,
                allowSpectatorAccess: true,
                permissions: ['announce', 'ban', 'kick', 'servermute', 'serverunmute', 'playerinfo', 'heal', 'teleport', 'clearbodies']
            };
            break;
        case 'vip':
            templateRole = {
                name: 'VIP',
                chatColor: { r: 255, g: 215, b: 0, a: 1 },
                overrideAdminChatColor: true,
                reservedSlot: true,
                hierarchy: 0,
                creatorModeAccess: false,
                allowSpectatorAccess: false,
                permissions: []
            };
            break;
    }

    if (templateRole) {
        loadRoleIntoForm(templateRole);
        renderPermissionsCheckboxes();

        // Check the appropriate permissions
        templateRole.permissions.forEach(permId => {
            const checkbox = document.getElementById(`perm-${permId.replace(/\s/g, '-')}`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Player Assignment Functions
function openPlayerModal(index = null) {
    editingPlayerIndex = index;
    const modal = document.getElementById('playerModal');
    modal.classList.add('active');

    // Populate role dropdown
    populateRoleDropdown();

    if (index !== null && playerRoles[index]) {
        // Edit existing player
        document.getElementById('playerAGID').value = playerRoles[index].agid;
        document.getElementById('playerRole').value = playerRoles[index].role;
        document.getElementById('playerModalTitle').textContent = 'Edit Player Role Assignment';
    } else {
        // New player
        document.getElementById('playerAGID').value = '';
        document.getElementById('playerRole').value = '';
        document.getElementById('playerModalTitle').textContent = 'Add Player Role Assignment';
    }
}

function closePlayerModal() {
    document.getElementById('playerModal').classList.remove('active');
    editingPlayerIndex = null;
}

function populateRoleDropdown() {
    const select = document.getElementById('playerRole');
    select.innerHTML = '<option value="">Select a role...</option>';

    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.name;
        option.textContent = role.name;
        select.appendChild(option);
    });
}

function savePlayer() {
    const agid = document.getElementById('playerAGID').value.trim();
    const role = document.getElementById('playerRole').value;

    // Validate AGID format (XXX-XXX-XXX)
    const agidPattern = /^\d{3}-\d{3}-\d{3}$/;
    if (!agidPattern.test(agid)) {
        alert('Invalid AGID format. Please use format: XXX-XXX-XXX (e.g., 013-142-944)');
        return;
    }

    if (!role) {
        alert('Please select a role for this player');
        return;
    }

    const playerData = { agid, role };

    if (editingPlayerIndex !== null) {
        playerRoles[editingPlayerIndex] = playerData;
    } else {
        playerRoles.push(playerData);
    }

    renderPlayersList();
    generatePreview();
    closePlayerModal();
}

function renderPlayersList() {
    const container = document.getElementById('playerRolesContainer');
    const countElement = document.getElementById('playerCount');

    countElement.textContent = playerRoles.length;

    if (playerRoles.length === 0) {
        container.innerHTML = '<p class="no-roles">No players assigned yet. Click "Add Player" to assign roles to players.</p>';
        return;
    }

    container.innerHTML = playerRoles.map((player, index) => `
        <div class="player-card">
            <div class="player-info">
                <div class="player-id">${player.agid}</div>
                <div class="player-role-name">Role: ${player.role}</div>
            </div>
            <div class="player-actions">
                <button class="btn-icon" onclick="openPlayerModal(${index})" title="Edit Player">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deletePlayer(${index})" title="Delete Player">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deletePlayer(index) {
    if (confirm('Are you sure you want to remove this player assignment?')) {
        playerRoles.splice(index, 1);
        renderPlayersList();
        generatePreview();
    }
}
