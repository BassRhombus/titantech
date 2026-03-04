// Admin server submissions management
document.addEventListener('DOMContentLoaded', function() {
    const serverTableBody = document.getElementById('serverTableBody');
    const refreshBtn = document.getElementById('serverRefreshBtn');
    const searchInput = document.getElementById('serverSearchInput');
    const statusFilter = document.getElementById('serverStatusFilter');

    loadServerSubmissions();

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadServerSubmissions);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterServerSubmissions);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterServerSubmissions);
    }

    function loadServerSubmissions() {
        const tableBody = document.getElementById('serverTableBody');
        tableBody.innerHTML = '<tr><td colspan="7" class="loading-data">Loading server submissions...</td></tr>';

        fetch('/api/admin/servers')
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server returned ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(submissions => {
                displayServerSubmissions(submissions);
            })
            .catch(error => {
                console.error('Error fetching server submissions:', error);
                tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error loading data: ${error.message}</td></tr>`;
            });
    }

    function displayServerSubmissions(submissions) {
        const tableBody = document.getElementById('serverTableBody');

        if (!submissions || submissions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No server submissions found</td></tr>';
            return;
        }

        let tableHTML = '';

        submissions.forEach(submission => {
            const id = submission.id;
            if (!id) return;

            let date;
            try {
                date = new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch(e) {
                date = 'Unknown';
            }

            const name = submission.name || 'Untitled';
            const owner = submission.ownerDiscord || 'Unknown';
            const ip = submission.serverIP || '';
            const port = submission.queryPort || '';
            const status = submission.status || 'pending';

            tableHTML += `
                <tr data-id="${id}" data-name="${name.toLowerCase()}" data-status="${status}">
                    <td>
                        <div class="thumbnail-container">
                            <img src="${submission.imagePath || 'images/placeholder.jpg'}" alt="${name}">
                        </div>
                    </td>
                    <td>${name}</td>
                    <td>${owner}</td>
                    <td>${ip}:${port}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${status}">${status}</span></td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="toggleServerDetails('${id}')"><i class="fas fa-eye"></i></button>
                        ${status === 'pending' ?
                           `<button class="approve-btn" onclick="approveServer('${id}')"><i class="fas fa-check"></i></button>
                            <button class="reject-btn" onclick="rejectServer('${id}')"><i class="fas fa-times"></i></button>` :
                           `<button class="edit-btn" onclick="updateServerStatus('${id}')"><i class="fas fa-edit"></i></button>`
                        }
                        <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
                <tr id="server-details-${id}" class="detail-row">
                    <td colspan="7">
                        <div class="submission-detail">
                            <div class="submission-image">
                                <img src="${submission.imagePath || 'images/placeholder.jpg'}" alt="${name}">
                            </div>
                            <div class="submission-info">
                                <h3>${name}</h3>
                                <p><strong>Description:</strong> ${submission.description || 'No description'}</p>
                                <p><strong>Owner:</strong> ${owner}</p>
                                <p><strong>Discord:</strong> <a href="${submission.discordInvite || '#'}" target="_blank" style="color: var(--primary-light);">${submission.discordInvite || 'Not provided'}</a></p>
                                <p><strong>Server IP:</strong> ${ip}</p>
                                <p><strong>Query Port:</strong> ${port}</p>
                                <p><strong>Submitted:</strong> ${date}</p>
                                <p><strong>Status:</strong> <span class="status-badge ${status}">${status}</span></p>
                                ${submission.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${submission.rejectionReason}</p>` : ''}

                                <div class="detail-actions">
                                    ${status === 'pending' ?
                                       `<button class="approve-btn" onclick="approveServer('${id}')"><i class="fas fa-check"></i> Approve</button>
                                        <button class="reject-btn" onclick="rejectServer('${id}')"><i class="fas fa-times"></i> Reject</button>` :
                                       `<button class="edit-btn" onclick="updateServerStatus('${id}')"><i class="fas fa-edit"></i> Change Status</button>`
                                    }
                                    <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableHTML;
    }

    function filterServerSubmissions() {
        const searchTerm = document.getElementById('serverSearchInput').value.toLowerCase();
        const statusVal = document.getElementById('serverStatusFilter').value;

        const rows = document.querySelectorAll('#serverTableBody tr:not(.detail-row)');

        rows.forEach(row => {
            if (row.classList.contains('empty-table') || row.classList.contains('loading-data')) return;

            const name = row.getAttribute('data-name');
            const status = row.getAttribute('data-status');
            const detailsRow = document.getElementById(`server-details-${row.getAttribute('data-id')}`);

            const matchesSearch = name.includes(searchTerm);
            const matchesStatus = statusVal === '' || status === statusVal;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
                if (detailsRow && detailsRow.style.display !== 'none') {
                    detailsRow.style.display = '';
                }
            } else {
                row.style.display = 'none';
                if (detailsRow) detailsRow.style.display = 'none';
            }
        });
    }
});

// Global functions for onclick handlers
function toggleServerDetails(id) {
    if (!id) return;
    const row = document.getElementById(`server-details-${id}`);
    if (!row) return;
    row.style.display = row.style.display === 'table-row' ? 'none' : 'table-row';
}

function approveServer(id) {
    if (!id) return;
    if (confirm('Approve this server submission?')) {
        updateServerSubmissionStatus(id, 'approved');
    }
}

function rejectServer(id) {
    if (!id) return;
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) {
        updateServerSubmissionStatus(id, 'rejected', reason);
    }
}

function updateServerStatus(id) {
    if (!id) return;
    const newStatus = prompt('Enter new status (pending, approved, rejected):');
    if (!newStatus) return;
    if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
        alert('Invalid status. Use: pending, approved, or rejected');
        return;
    }
    updateServerSubmissionStatus(id, newStatus);
}

function updateServerSubmissionStatus(id, newStatus, reason = '') {
    fetch(`/api/admin/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: reason }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                try {
                    throw new Error(JSON.parse(text).message || 'Failed to update status');
                } catch (e) {
                    throw new Error(`Server error: ${response.status}`);
                }
            });
        }
        return response.json();
    })
    .then(data => {
        const row = document.querySelector(`#serverTableBody tr[data-id="${id}"]`);
        if (!row) return;

        // Update main row
        row.setAttribute('data-status', newStatus);
        const badge = row.querySelector('.status-badge');
        if (badge) {
            badge.className = `status-badge ${newStatus}`;
            badge.textContent = newStatus;
        }

        // Update action buttons in main row
        const rowActions = row.querySelector('.action-buttons');
        if (rowActions) {
            if (newStatus === 'pending') {
                rowActions.innerHTML = `
                    <button class="view-btn" onclick="toggleServerDetails('${id}')"><i class="fas fa-eye"></i></button>
                    <button class="approve-btn" onclick="approveServer('${id}')"><i class="fas fa-check"></i></button>
                    <button class="reject-btn" onclick="rejectServer('${id}')"><i class="fas fa-times"></i></button>
                    <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i></button>
                `;
            } else {
                rowActions.innerHTML = `
                    <button class="view-btn" onclick="toggleServerDetails('${id}')"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" onclick="updateServerStatus('${id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i></button>
                `;
            }
        }

        // Update detail row
        const detailsRow = document.getElementById(`server-details-${id}`);
        if (detailsRow) {
            const detailBadge = detailsRow.querySelector('.status-badge');
            if (detailBadge) {
                detailBadge.className = `status-badge ${newStatus}`;
                detailBadge.textContent = newStatus;
            }
            const detailActions = detailsRow.querySelector('.detail-actions');
            if (detailActions) {
                if (newStatus === 'pending') {
                    detailActions.innerHTML = `
                        <button class="approve-btn" onclick="approveServer('${id}')"><i class="fas fa-check"></i> Approve</button>
                        <button class="reject-btn" onclick="rejectServer('${id}')"><i class="fas fa-times"></i> Reject</button>
                        <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                } else {
                    detailActions.innerHTML = `
                        <button class="edit-btn" onclick="updateServerStatus('${id}')"><i class="fas fa-edit"></i> Change Status</button>
                        <button class="delete-btn" onclick="deleteServer('${id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                }
            }
        }

        alert(`Server submission status updated to "${newStatus}"`);
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + error.message);
    });
}

function deleteServer(id) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this server submission? This cannot be undone.')) return;

    fetch(`/api/admin/servers/${id}`, { method: 'DELETE' })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                try {
                    throw new Error(JSON.parse(text).message || 'Failed to delete');
                } catch (e) {
                    throw new Error(`Server error: ${response.status}`);
                }
            });
        }
        return response.json();
    })
    .then(data => {
        const row = document.querySelector(`#serverTableBody tr[data-id="${id}"]`);
        const detailsRow = document.getElementById(`server-details-${id}`);
        if (row) row.remove();
        if (detailsRow) detailsRow.remove();
        alert('Server submission deleted');
    })
    .catch(error => {
        console.error('Error deleting:', error);
        alert('Failed to delete: ' + error.message);
    });
}
