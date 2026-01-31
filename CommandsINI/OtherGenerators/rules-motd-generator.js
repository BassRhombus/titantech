// Rules/MOTD Generator
let currentTab = 'rules';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updatePreview('rules');
    updatePreview('motd');
});

function setupEventListeners() {
    // Dropdown switching
    const generatorSelect = document.getElementById('generatorSelect');
    if (generatorSelect) {
        generatorSelect.addEventListener('change', (e) => switchTab(e.target.value));
    }

    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => insertTag(btn.dataset.tag, btn.dataset.type));
    });

    // Editor input
    document.getElementById('rulesEditor').addEventListener('input', () => {
        checkCharacterLimit('rules');
        updatePreview('rules');
        updateLineCount('rules');
    });

    document.getElementById('motdEditor').addEventListener('input', () => {
        checkCharacterLimit('motd');
        updatePreview('motd');
        updateLineCount('motd');
    });

    // Action buttons
    document.getElementById('downloadBtn').addEventListener('click', downloadFile);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('resetBtn').addEventListener('click', resetCurrent);
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', uploadFile);
    document.getElementById('autoFixBtn').addEventListener('click', autoFixErrors);

    // Template buttons
    document.getElementById('rulesTemplateBtn').addEventListener('click', () => loadTemplate('rules'));
    document.getElementById('motdTemplateBtn').addEventListener('click', () => loadTemplate('motd'));
}

function switchTab(tab) {
    currentTab = tab;

    // Update dropdown selection
    const generatorSelect = document.getElementById('generatorSelect');
    if (generatorSelect) {
        generatorSelect.value = tab;
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tab}-content`);
    });
}

function insertTag(tag, type) {
    const editor = document.getElementById(`${type}Editor`);
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);

    // Check if cursor is inside an existing tag block
    const beforeCursor = text.substring(0, start);
    const afterCursor = text.substring(start);

    // Find if we're between tags (after opening tag, before closing tag)
    const lastOpenTag = beforeCursor.lastIndexOf('<');
    const lastCloseTag = beforeCursor.lastIndexOf('</>');
    const nextCloseTag = afterCursor.indexOf('</>');

    // If cursor is inside an unclosed tag, move to after the closing tag
    if (lastOpenTag > lastCloseTag && nextCloseTag !== -1 && !selectedText && tag !== 'close') {
        // Move cursor to after the closing tag
        const newCursorPos = start + nextCloseTag + 3; // +3 for '</>'.length
        editor.selectionStart = editor.selectionEnd = newCursorPos;

        // Now insert the new tag at the new position
        const newStart = newCursorPos;
        const newText = editor.value;
        const insertText = `<${tag}>  </>`;

        editor.value = newText.substring(0, newStart) + insertText + newText.substring(newStart);

        // Place cursor inside the new tag
        const finalCursorPos = newStart + `<${tag}> `.length;
        editor.selectionStart = editor.selectionEnd = finalCursorPos;
    } else {
        // Normal insertion behavior
        let insertText;
        if (tag === 'close') {
            insertText = '</>';
        } else {
            insertText = selectedText
                ? `<${tag}> ${selectedText} </>`
                : `<${tag}>  </>`;
        }

        // Insert the tag
        editor.value = text.substring(0, start) + insertText + text.substring(end);

        // Set cursor position (inside the tags if no selection)
        if (selectedText) {
            editor.selectionStart = editor.selectionEnd = start + insertText.length;
        } else if (tag === 'close') {
            editor.selectionStart = editor.selectionEnd = start + insertText.length;
        } else {
            const cursorPos = start + `<${tag}> `.length;
            editor.selectionStart = editor.selectionEnd = cursorPos;
        }
    }

    editor.focus();
    updatePreview(type);
    updateLineCount(type);
}

function updateLineCount(type) {
    const editor = document.getElementById(`${type}Editor`);
    const lines = editor.value.split('\n').length;
    const textContent = getTextContentWithoutTags(editor.value);
    const charCount = textContent.length;
    const charLimit = 1024;

    document.getElementById(`${type}LineCount`).textContent = lines;

    // Update character count display
    const charCountElement = document.getElementById(`${type}CharCount`);
    if (charCountElement) {
        charCountElement.textContent = `${charCount}/${charLimit}`;

        // Change color if approaching or over limit
        if (charCount > charLimit) {
            charCountElement.style.color = '#f44336'; // Red
        } else if (charCount > charLimit * 0.9) {
            charCountElement.style.color = '#FF9800'; // Orange
        } else {
            charCountElement.style.color = '#aaa'; // Default gray
        }
    }
}

function getTextContentWithoutTags(text) {
    // Remove all formatting tags to get actual content length
    return text.replace(/<\/?[^>]+(>|$)/g, '');
}

function checkCharacterLimit(type) {
    const editor = document.getElementById(`${type}Editor`);
    const textContent = getTextContentWithoutTags(editor.value);
    const charCount = textContent.length;
    const charLimit = 1024;
    const warning = document.getElementById(`${type}Warning`);
    const warningText = document.getElementById(`${type}WarningText`);

    if (charCount > charLimit) {
        warningText.textContent = `Character limit exceeded! Content is ${charCount - charLimit} characters over the limit (${charCount}/${charLimit}). The file may not work properly in-game.`;
        warning.classList.add('active');
    } else {
        // Only clear the warning if it was a character limit warning
        const currentWarning = warningText.textContent;
        if (currentWarning.includes('Character limit exceeded')) {
            warning.classList.remove('active');
        }
    }
}

function updatePreview(type) {
    const editor = document.getElementById(`${type}Editor`);
    const preview = document.getElementById(`${type}Preview`);
    const text = editor.value;

    if (!text.trim()) {
        preview.innerHTML = '<span style="color: #888;">Preview will appear here...</span>';
        return;
    }

    // Parse and render the formatted text
    const rendered = parseFormattedText(text);
    preview.innerHTML = rendered;

    // Validate formatting
    validateFormatting(text, type);
}

function parseFormattedText(text) {
    const lines = text.split('\n');
    let html = '';

    lines.forEach(line => {
        if (!line.trim()) {
            html += '<br>';
            return;
        }

        let parsedLine = '';
        let i = 0;

        while (i < line.length) {
            // Check for opening tag
            if (line[i] === '<') {
                const closeIndex = line.indexOf('>', i);
                if (closeIndex !== -1) {
                    const tag = line.substring(i + 1, closeIndex).toLowerCase();

                    // Check for closing tag
                    if (tag === '/') {
                        i = closeIndex + 1;
                        continue;
                    }

                    // Find the closing tag for this opening tag
                    const closingTag = '</>';
                    const endIndex = line.indexOf(closingTag, closeIndex);

                    if (endIndex !== -1) {
                        const content = line.substring(closeIndex + 1, endIndex).trim();

                        // Apply formatting
                        if (['title', 'large', 'small'].includes(tag)) {
                            parsedLine += `<span class="preview-${tag}">${escapeHtml(content)}</span>`;
                        } else if (['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'].includes(tag)) {
                            parsedLine += `<span class="preview-${tag}">${escapeHtml(content)}</span>`;
                        } else {
                            parsedLine += escapeHtml(line.substring(i, endIndex + closingTag.length));
                        }

                        i = endIndex + closingTag.length;
                        continue;
                    }
                }
            }

            // Regular character
            parsedLine += escapeHtml(line[i]);
            i++;
        }

        html += parsedLine + '<br>';
    });

    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getValidationErrors(text, type) {
    const errors = [];
    const lines = text.split('\n');

    lines.forEach((line, index) => {
        const sizeMatches = line.match(/<(title|large|small)>/g);
        const colorMatches = line.match(/<(red|orange|yellow|green|blue|purple|white)>/g);

        if (sizeMatches && colorMatches) {
            errors.push(`Line ${index + 1}: Cannot mix size and color tags`);
        }

        // Check for unclosed tags
        const openTags = (line.match(/<(title|large|small|red|orange|yellow|green|blue|purple|white)>/g) || []).length;
        const closeTags = (line.match(/<\/>/g) || []).length;

        if (openTags !== closeTags) {
            errors.push(`Line ${index + 1}: Mismatched tags (${openTags} open, ${closeTags} close)`);
        }

        // Check for nested tags
        let depth = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '<') {
                const closeIndex = line.indexOf('>', i);
                if (closeIndex !== -1) {
                    const tag = line.substring(i + 1, closeIndex);
                    if (tag !== '/') {
                        depth++;
                        if (depth > 1) {
                            errors.push(`Line ${index + 1}: Nested tags are not allowed`);
                            break;
                        }
                    } else {
                        depth--;
                    }
                }
            }
        }

        // Check for malformed tags
        const invalidTags = line.match(/<[^>]*>/g);
        if (invalidTags) {
            invalidTags.forEach(tag => {
                const tagName = tag.slice(1, -1).toLowerCase();
                const validTags = ['title', 'large', 'small', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', '/'];
                if (!validTags.includes(tagName) && tag !== '</>') {
                    errors.push(`Line ${index + 1}: Invalid tag "${tag}"`);
                }
            });
        }
    });

    return errors;
}

function validateFormatting(text, type) {
    const warning = document.getElementById(`${type}Warning`);
    const warningText = document.getElementById(`${type}WarningText`);
    const errors = getValidationErrors(text, type);

    if (errors.length > 0) {
        warningText.textContent = errors.join('; ');
        warning.classList.add('active');
    } else {
        warning.classList.remove('active');
    }
}

function loadTemplate(type) {
    if (type === 'rules') {
        const template = `<title> Server Rules </>

<large> Welcome to Our Community! </>

<red>Rule 1:</> <white>No griefing, trolling, or harassment of any kind</>
<red>Rule 2:</> <white>Respect all players and staff members</>
<red>Rule 3:</> <white>No cheating, hacking, or exploiting bugs</>
<red>Rule 4:</> <white>Keep chat family-friendly and appropriate</>
<red>Rule 5:</> <white>Follow staff instructions at all times</>

<blue>Join our Discord for updates and support:</>
<blue>https://discord.gg/yourserver</>

<small>Last updated: ${new Date().toLocaleDateString()}</>`;

        document.getElementById('rulesEditor').value = template;
    } else {
        const template = `<title> Welcome to the Server! </>

<large> Message of the Day </>

<green>Today's Events:</>
<white>• Daily quest reset at 12:00 PM</>
<white>• Community event at 8:00 PM</>
<white>• New mod showcase this weekend</>

<yellow>Server Stats:</>
<white>Online Players: [Auto-updated]</>
<white>Total Members: [Auto-updated]</>

<blue>Connect with us:</>
<blue>Discord: https://discord.gg/yourserver</>
<purple>Website: https://yourwebsite.com</>

<small>Have fun and play fair!</>`;

        document.getElementById('motdEditor').value = template;
    }

    updatePreview(type);
    updateLineCount(type);
}

async function downloadFile() {
    const editor = document.getElementById(`${currentTab}Editor`);
    const content = editor.value;

    if (!content.trim()) {
        alert('Nothing to download! Please add some content first.');
        return;
    }

    // Validate before download
    const validationErrors = getValidationErrors(content, currentTab);
    if (validationErrors.length > 0) {
        const errorMsg = 'Cannot download file with errors:\n\n' + validationErrors.join('\n');
        alert(errorMsg);
        return;
    }

    // Check character limit
    const textContent = getTextContentWithoutTags(content);
    if (textContent.length > 1024) {
        const overLimit = textContent.length - 1024;
        if (!confirm(`Warning: Your content exceeds the 1024 character limit by ${overLimit} characters. The file may not work properly in-game.\n\nDownload anyway?`)) {
            return;
        }
    }

    const filename = currentTab === 'rules' ? 'Rules.txt' : 'MOTD.txt';

    // Send webhook notification
    try {
        const lines = content.split('\n').length;
        await fetch('/api/webhook/game-ini-generated', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileType: filename,
                changedSettingsCount: lines,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Failed to send webhook notification:', error);
    }

    // Download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const editor = document.getElementById(`${currentTab}Editor`);
    const content = editor.value;

    if (!content.trim()) {
        alert('Nothing to copy! Please add some content first.');
        return;
    }

    navigator.clipboard.writeText(content).then(() => {
        alert('Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        editor.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    });
}

function resetCurrent() {
    if (confirm(`Are you sure you want to reset the ${currentTab === 'rules' ? 'Rules' : 'MOTD'} content? This cannot be undone.`)) {
        document.getElementById(`${currentTab}Editor`).value = '';
        updatePreview(currentTab);
        updateLineCount(currentTab);
    }
}

function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;

        // Determine which editor to populate based on filename
        if (file.name.toLowerCase().includes('rules')) {
            document.getElementById('rulesEditor').value = content;
            updatePreview('rules');
            updateLineCount('rules');
            switchTab('rules');
        } else if (file.name.toLowerCase().includes('motd')) {
            document.getElementById('motdEditor').value = content;
            updatePreview('motd');
            updateLineCount('motd');
            switchTab('motd');
        } else {
            // If filename doesn't indicate type, populate current tab
            document.getElementById(`${currentTab}Editor`).value = content;
            updatePreview(currentTab);
            updateLineCount(currentTab);
        }

        alert('File loaded successfully!');
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

function autoFixErrors() {
    const editor = document.getElementById(`${currentTab}Editor`);
    const content = editor.value;

    if (!content.trim()) {
        alert('Nothing to fix! Please add some content first.');
        return;
    }

    let fixedContent = content;
    let fixCount = 0;

    const lines = fixedContent.split('\n');
    const fixedLines = lines.map((line, index) => {
        let fixedLine = line;

        // Fix unclosed tags by adding missing close tags
        const openTags = (line.match(/<(title|large|small|red|orange|yellow|green|blue|purple|white)>/g) || []).length;
        const closeTags = (line.match(/<\/>/g) || []).length;

        if (openTags > closeTags) {
            const missing = openTags - closeTags;
            fixedLine += ' </>' .repeat(missing);
            fixCount++;
        } else if (closeTags > openTags) {
            // Remove extra close tags
            let removeCount = closeTags - openTags;
            fixedLine = fixedLine.replace(/<\/>/g, (match) => {
                if (removeCount > 0) {
                    removeCount--;
                    return '';
                }
                return match;
            });
            fixCount++;
        }

        // Remove nested tags (keep the outer one)
        let depth = 0;
        let result = '';
        let i = 0;
        let skipNext = false;

        while (i < fixedLine.length) {
            if (fixedLine[i] === '<' && !skipNext) {
                const closeIndex = fixedLine.indexOf('>', i);
                if (closeIndex !== -1) {
                    const tag = fixedLine.substring(i + 1, closeIndex);
                    if (tag === '/') {
                        depth--;
                        result += fixedLine.substring(i, closeIndex + 1);
                        i = closeIndex + 1;
                        continue;
                    } else if (['title', 'large', 'small', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'].includes(tag)) {
                        if (depth === 0) {
                            depth++;
                            result += fixedLine.substring(i, closeIndex + 1);
                        } else {
                            // Skip nested tag
                            fixCount++;
                        }
                        i = closeIndex + 1;
                        continue;
                    }
                }
            }
            result += fixedLine[i];
            i++;
        }

        if (result !== fixedLine) {
            fixedLine = result;
        }

        return fixedLine;
    });

    fixedContent = fixedLines.join('\n');

    // Check if there were any mixed tags and show warning
    const remainingErrors = getValidationErrors(fixedContent, currentTab);
    const mixedTagErrors = remainingErrors.filter(e => e.includes('Cannot mix size and color tags'));

    if (mixedTagErrors.length > 0) {
        alert(`Auto-fix complete! Fixed ${fixCount} issues.\n\nNote: Lines with mixed size and color tags cannot be auto-fixed. Please manually separate them.`);
    } else if (fixCount > 0) {
        alert(`Auto-fix complete! Fixed ${fixCount} issues.`);
    } else {
        alert('No issues found to fix!');
    }

    editor.value = fixedContent;
    updatePreview(currentTab);
    updateLineCount(currentTab);
}

// =============================================================================
// Profile Management Integration
// =============================================================================

/**
 * Get current generator state for saving to profile
 */
function getProfileData() {
    return {
        rules: document.getElementById('rulesEditor').value,
        motd: document.getElementById('motdEditor').value
    };
}

/**
 * Load data from a profile into the generator
 */
function loadProfileData(data) {
    if (!data) return;

    if (data.rules !== undefined) {
        document.getElementById('rulesEditor').value = data.rules;
        updatePreview('rules');
        updateLineCount('rules');
    }

    if (data.motd !== undefined) {
        document.getElementById('motdEditor').value = data.motd;
        updatePreview('motd');
        updateLineCount('motd');
    }
}

/**
 * Initialize profile manager if available
 */
function initProfileManager() {
    if (typeof ProfileManager !== 'undefined') {
        ProfileManager.init('rules-motd', {
            getCurrentData: getProfileData,
            loadData: loadProfileData,
            onSaveSuccess: () => {
                console.log('Rules/MOTD profile saved successfully');
            },
            onLoadSuccess: () => {
                console.log('Rules/MOTD profile loaded successfully');
            }
        });
    }
}

// Initialize profile manager after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure ProfileManager script is loaded
    setTimeout(initProfileManager, 100);
});
