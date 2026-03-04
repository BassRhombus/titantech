// Admin showcase management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const showcaseTableBody = document.getElementById('showcaseTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const showcaseSearchInput = document.getElementById('showcaseSearchInput');
    const showcaseStatusFilter = document.getElementById('showcaseStatusFilter');
    
    // Load submissions on page load
    loadSubmissions();
    
    // Add event listeners
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSubmissions);
    }
    
    if (showcaseSearchInput) {
        showcaseSearchInput.addEventListener('input', filterSubmissions);
    }
    
    if (showcaseStatusFilter) {
        showcaseStatusFilter.addEventListener('change', filterSubmissions);
    }
    
    // Check admin authentication
    checkAdminAuth();
    
    function checkAdminAuth() {
        fetch('/api/user')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    if (!data.user.admin) {
                        // Redirect non-admin users
                        window.location.href = '/dashboard.html';
                        return;
                    }
                    
                    document.getElementById('username').textContent = data.user.username;
                } else {
                    // Redirect to login if not authenticated
                    window.location.href = '/login.html';
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }
    
    function loadSubmissions() {
        const tableBody = document.getElementById('showcaseTableBody');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading-data">Loading submissions...</td></tr>';
        
        fetch('/api/admin/showcase')
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error("Server response:", text);
                        throw new Error(`Server returned ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(submissions => {
                console.log("Received submissions:", submissions);
                displaySubmissions(submissions);
            })
            .catch(error => {
                console.error('Error fetching showcase submissions:', error);
                tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error loading data: ${error.message}</td></tr>`;
            });
    }
    
    function displaySubmissions(submissions) {
        const tableBody = document.getElementById('showcaseTableBody');
        
        if (!submissions || submissions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-table">No showcase submissions found</td></tr>';
            return;
        }
        
        let tableHTML = '';
        
        submissions.forEach(submission => {
            const submissionId = submission.id;
            
            if (!submissionId) {
                console.error('Submission is missing ID:', submission);
                return;
            }
            
            let date;
            try {
                date = new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch(e) {
                console.error("Error formatting date:", e);
                date = "Unknown date";
            }
            
            const imageTitle = submission.imageTitle || 'Untitled';
            const authorName = submission.authorName || 'Unknown';
            const status = submission.status || 'pending';
            
            tableHTML += `
                <tr data-id="${submissionId}" data-title="${imageTitle.toLowerCase()}" data-status="${status}">
                    <td>
                        <div class="thumbnail-container">
                            <img src="${submission.imagePath || 'images/placeholder.jpg'}" alt="${imageTitle}">
                        </div>
                    </td>
                    <td>${imageTitle}</td>
                    <td>${authorName}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${status}">${status}</span></td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="toggleDetails('${submissionId}')"><i class="fas fa-eye"></i></button>
                        ${status === 'pending' ? 
                           `<button class="approve-btn" onclick="approveSubmission('${submissionId}')"><i class="fas fa-check"></i></button>
                            <button class="reject-btn" onclick="rejectSubmission('${submissionId}')"><i class="fas fa-times"></i></button>` : 
                           `<button class="edit-btn" onclick="updateStatus('${submissionId}')"><i class="fas fa-edit"></i></button>`
                        }
                        <button class="delete-btn" onclick="deleteSubmission('${submissionId}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
                <tr id="details-${submissionId}" class="detail-row">
                    <td colspan="6">
                        <div class="submission-detail">
                            <div class="submission-image">
                                <img src="${submission.imagePath || 'images/placeholder.jpg'}" alt="${imageTitle}">
                            </div>
                            <div class="submission-info">
                                <h3>${imageTitle}</h3>
                                <p><strong>Description:</strong> ${submission.imageDescription || 'No description provided'}</p>
                                <p><strong>Author:</strong> ${authorName}</p>
                                <p><strong>Email:</strong> ${submission.email || 'Not provided'}</p>
                                <p><strong>Submitted:</strong> ${date}</p>
                                <p><strong>Status:</strong> <span class="status-badge ${status}">${status}</span></p>
                                
                                <div class="detail-actions">
                                    ${status === 'pending' ? 
                                       `<button class="approve-btn" onclick="approveSubmission('${submissionId}')"><i class="fas fa-check"></i> Approve</button>
                                        <button class="reject-btn" onclick="rejectSubmission('${submissionId}')"><i class="fas fa-times"></i> Reject</button>` : 
                                       `<button class="edit-btn" onclick="updateStatus('${submissionId}')"><i class="fas fa-edit"></i> Change Status</button>`
                                    }
                                    <button class="delete-btn" onclick="deleteSubmission('${submissionId}')"><i class="fas fa-trash-alt"></i> Delete</button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    }
    
    function filterSubmissions() {
        const searchTerm = document.getElementById('showcaseSearchInput').value.toLowerCase();
        const statusFilter = document.getElementById('showcaseStatusFilter').value;
        
        const rows = document.querySelectorAll('#showcaseTableBody tr:not(.detail-row)');
        
        rows.forEach(row => {
            if (row.classList.contains('empty-table') || row.classList.contains('loading-data')) return;
            
            const title = row.getAttribute('data-title');
            const status = row.getAttribute('data-status');
            const detailsRow = document.getElementById(`details-${row.getAttribute('data-id')}`);
            
            const matchesSearch = title.includes(searchTerm);
            const matchesStatus = statusFilter === '' || status === statusFilter;
            
            if (matchesSearch && matchesStatus) {
                row.style.display = '';
                if (detailsRow && detailsRow.style.display !== 'none') {
                    detailsRow.style.display = '';
                }
            } else {
                row.style.display = 'none';
                if (detailsRow) {
                    detailsRow.style.display = 'none';
                }
            }
        });
    }
});

// These functions need to be global since they're called from HTML onclick attributes
function toggleDetails(id) {
    if (!id) {
        console.error('Error: Cannot toggle details - Submission ID is missing.');
        return;
    }
    
    const detailsRow = document.getElementById(`details-${id}`);
    if (!detailsRow) {
        console.error(`Could not find details row with ID details-${id}`);
        return;
    }
    
    if (detailsRow.style.display === 'table-row') {
        detailsRow.style.display = 'none';
    } else {
        detailsRow.style.display = 'table-row';
    }
}

function approveSubmission(id) {
    if (!id) {
        alert('Error: Cannot approve - Submission ID is missing.');
        return;
    }
    
    if (confirm('Are you sure you want to approve this submission?')) {
        updateSubmissionStatus(id, 'approved');
    }
}

function rejectSubmission(id) {
    if (!id) {
        alert('Error: Cannot reject - Submission ID is missing.');
        return;
    }
    
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) { // Only cancel if the user clicks Cancel
        updateSubmissionStatus(id, 'rejected', reason);
    }
}

function updateStatus(id) {
    if (!id) {
        alert('Error: Cannot update status - Submission ID is missing.');
        return;
    }
    
    const newStatus = prompt('Enter new status (pending, approved, rejected):');
    if (!newStatus) return;
    
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        alert('Invalid status. Please use: pending, approved, or rejected');
        return;
    }
    
    updateSubmissionStatus(id, newStatus);
}

function updateSubmissionStatus(id, newStatus, reason = '') {
    console.log(`Updating status for submission ${id} to ${newStatus}`);
    
    fetch(`/api/admin/showcase/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            status: newStatus,
            reason: reason
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.error("Server response:", text);
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'Failed to update status');
                } catch (e) {
                    throw new Error(`Server error: ${response.status}`);
                }
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Status update successful:", data);
        
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) {
            throw new Error(`Could not find row with ID ${id}`);
        }
        
        const statusBadge = row.querySelector('.status-badge');
        if (!statusBadge) {
            throw new Error('Could not find status badge element');
        }
        
        // Update row data
        row.setAttribute('data-status', newStatus);
        statusBadge.className = `status-badge ${newStatus}`;
        statusBadge.textContent = newStatus;
        
        // Update details row status
        const detailsRow = document.getElementById(`details-${id}`);
        if (detailsRow) {
            const detailStatusBadge = detailsRow.querySelector('.status-badge');
            if (detailStatusBadge) {
                detailStatusBadge.className = `status-badge ${newStatus}`;
                detailStatusBadge.textContent = newStatus;
            }
            
            // Update action buttons
            const actionButtons = detailsRow.querySelector('.detail-actions');
            if (actionButtons) {
                if (newStatus === 'pending') {
                    actionButtons.innerHTML = `
                        <button class="approve-btn" onclick="approveSubmission('${id}')"><i class="fas fa-check"></i> Approve</button>
                        <button class="reject-btn" onclick="rejectSubmission('${id}')"><i class="fas fa-times"></i> Reject</button>
                        <button class="delete-btn" onclick="deleteSubmission('${id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                } else {
                    actionButtons.innerHTML = `
                        <button class="edit-btn" onclick="updateStatus('${id}')"><i class="fas fa-edit"></i> Change Status</button>
                        <button class="delete-btn" onclick="deleteSubmission('${id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                }
            }
        }
        
        // Also update the normal row's action buttons
        const rowActions = row.querySelector('.action-buttons');
        if (rowActions) {
            if (newStatus === 'pending') {
                rowActions.innerHTML = `
                    <button class="view-btn" onclick="toggleDetails('${id}')"><i class="fas fa-eye"></i></button>
                    <button class="approve-btn" onclick="approveSubmission('${id}')"><i class="fas fa-check"></i></button>
                    <button class="reject-btn" onclick="rejectSubmission('${id}')"><i class="fas fa-times"></i></button>
                    <button class="delete-btn" onclick="deleteSubmission('${id}')"><i class="fas fa-trash-alt"></i></button>
                `;
            } else {
                rowActions.innerHTML = `
                    <button class="view-btn" onclick="toggleDetails('${id}')"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" onclick="updateStatus('${id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteSubmission('${id}')"><i class="fas fa-trash-alt"></i></button>
                `;
            }
        }
        
        alert(`Submission status updated to "${newStatus}"`);
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + error.message);
    });
}

function deleteSubmission(id) {
    if (!id) {
        alert('Error: Cannot delete - Submission ID is missing.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/api/admin/showcase/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.error("Server response:", text);
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'Failed to delete submission');
                } catch (e) {
                    throw new Error(`Server error: ${response.status}`);
                }
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Deletion successful:", data);
        
        // Remove both the row and its details
        const row = document.querySelector(`tr[data-id="${id}"]`);
        const detailsRow = document.getElementById(`details-${id}`);
        
        if (row) row.remove();
        if (detailsRow) detailsRow.remove();
        
        alert('Submission deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission: ' + error.message);
    });
}