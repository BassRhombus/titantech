// Showcase page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const showcaseGallery = document.getElementById('showcaseGallery');
    const gallerySearch = document.getElementById('gallerySearch');
    const categoriesFilter = document.getElementById('categoriesFilter');
    const sortOptions = document.getElementById('sortOptions');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalDate = document.getElementById('modalDate');
    const likesCount = document.getElementById('likesCount');
    const closeModal = document.querySelector('.close-modal');
    
    // Variables
    let showcaseItems = [];
    let filteredItems = [];
    let currentPage = 1;
    let itemsPerPage = 8;
    let currentFilter = 'all';
    let currentSort = 'newest';
    let searchTerm = '';
    
    // Fetch showcase items
    fetchShowcaseItems();
    
    // Add event listeners
    if (gallerySearch) {
        gallerySearch.addEventListener('input', function() {
            searchTerm = this.value.toLowerCase().trim();
            currentPage = 1;
            filterAndDisplayItems();
        });
    }
    
    if (categoriesFilter) {
        categoriesFilter.addEventListener('change', function() {
            currentFilter = this.value;
            currentPage = 1;
            filterAndDisplayItems();
        });
    }
    
    if (sortOptions) {
        sortOptions.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1;
            filterAndDisplayItems();
        });
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            displayMoreItems();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeImageModal();
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
        
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && imageModal.style.display === 'block') {
                closeImageModal();
            }
        });
    }
    
    function fetchShowcaseItems() {
        // Show loading state
        if (showcaseGallery) {
            showcaseGallery.innerHTML = `
                <div class="loading-gallery">
                    <div class="spinner"></div>
                    <p>Loading gallery...</p>
                </div>
            `;
        }
        
        // Fetch data from API (only approved items will be returned)
        fetch('/api/showcase')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch showcase items');
                }
                return response.json();
            })
            .then(data => {
                showcaseItems = data;
                filterAndDisplayItems();
            })
            .catch(error => {
                console.error('Error fetching showcase items:', error);
                if (showcaseGallery) {
                    showcaseGallery.innerHTML = `
                        <div class="error-message">
                            <p>There was an error loading the showcase. Please try again later.</p>
                        </div>
                    `;
                }
            });
    }
    
    function filterAndDisplayItems() {
        // Reset display
        if (showcaseGallery) {
            showcaseGallery.innerHTML = '';
        }
        
        // Filter items by search term and category
        filteredItems = showcaseItems.filter(item => {
            const matchesSearch = searchTerm === '' || 
                item.imageTitle.toLowerCase().includes(searchTerm) || 
                item.imageDescription.toLowerCase().includes(searchTerm) ||
                item.authorName.toLowerCase().includes(searchTerm);
                
            const matchesCategory = currentFilter === 'all' || item.imageCategory === currentFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        // Sort items
        filteredItems.sort((a, b) => {
            if (currentSort === 'newest') {
                return new Date(b.submittedAt) - new Date(a.submittedAt);
            } else if (currentSort === 'oldest') {
                return new Date(a.submittedAt) - new Date(b.submittedAt);
            } else if (currentSort === 'popular') {
                return (b.likes || 0) - (a.likes || 0);
            }
            return 0;
        });
        
        // Check if we have items to display
        if (filteredItems.length === 0) {
            if (showcaseGallery) {
                showcaseGallery.innerHTML = `
                    <div class="no-results">
                        <p>No showcase items found matching your criteria.</p>
                    </div>
                `;
            }
            
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
            return;
        }
        
        // Display first page of items
        displayItems();
        
        // Update load more button visibility
        updateLoadMoreButton();
    }
    
    function displayItems() {
        const startIndex = 0;
        const endIndex = currentPage * itemsPerPage;
        const itemsToShow = filteredItems.slice(startIndex, endIndex);
        
        if (showcaseGallery) {
            // Generate items HTML
            let itemsHTML = '';
            itemsToShow.forEach(item => {
                const date = new Date(item.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                itemsHTML += `
                    <div class="gallery-item" data-id="${item.id}">
                        <div class="gallery-image">
                            <img src="${item.imagePath}" alt="${item.imageTitle}" loading="lazy">
                        </div>
                        <div class="gallery-info">
                            <h3>${item.imageTitle}</h3>
                            <div class="gallery-meta">
                                <span class="gallery-author">By: ${item.authorName}</span>
                                <span class="gallery-date">${date}</span>
                            </div>
                            <div class="gallery-category">${item.imageCategory}</div>
                        </div>
                    </div>
                `;
            });
            
            showcaseGallery.innerHTML = itemsHTML;
            
            // Add click events to gallery items
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const itemId = this.getAttribute('data-id');
                    const showcaseItem = showcaseItems.find(item => item.id === itemId);
                    
                    if (showcaseItem) {
                        openImageModal(showcaseItem);
                    }
                });
            });
        }
    }
    
    function displayMoreItems() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = currentPage * itemsPerPage;
        const itemsToShow = filteredItems.slice(startIndex, endIndex);
        
        if (showcaseGallery && itemsToShow.length > 0) {
            // Generate HTML for additional items
            let itemsHTML = '';
            itemsToShow.forEach(item => {
                const date = new Date(item.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                itemsHTML += `
                    <div class="gallery-item" data-id="${item.id}">
                        <div class="gallery-image">
                            <img src="${item.imagePath}" alt="${item.imageTitle}" loading="lazy">
                        </div>
                        <div class="gallery-info">
                            <h3>${item.imageTitle}</h3>
                            <div class="gallery-meta">
                                <span class="gallery-author">By: ${item.authorName}</span>
                                <span class="gallery-date">${date}</span>
                            </div>
                            <div class="gallery-category">${item.imageCategory}</div>
                        </div>
                    </div>
                `;
            });
            
            // Append new items to the existing gallery
            const currentHTML = showcaseGallery.innerHTML;
            showcaseGallery.innerHTML = currentHTML + itemsHTML;
            
            // Add click events to newly added gallery items
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const itemId = this.getAttribute('data-id');
                    const showcaseItem = showcaseItems.find(item => item.id === itemId);
                    
                    if (showcaseItem) {
                        openImageModal(showcaseItem);
                    }
                });
            });
            
            // Update load more button visibility
            updateLoadMoreButton();
        }
    }
    
    function updateLoadMoreButton() {
        if (loadMoreBtn) {
            const totalItems = filteredItems.length;
            const displayedItems = currentPage * itemsPerPage;
            
            if (displayedItems >= totalItems) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }
    
    function openImageModal(item) {
        if (imageModal && modalImage && modalTitle) {
            modalImage.src = item.imagePath;
            modalTitle.textContent = item.imageTitle || '';
            
            if (modalDescription) {
                modalDescription.textContent = item.imageDescription || '';
            }
            
            if (modalAuthor) {
                modalAuthor.textContent = item.authorName || '';
            }
            
            if (modalDate) {
                const date = new Date(item.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                modalDate.textContent = date;
            }
            
            if (likesCount) {
                likesCount.textContent = item.likes || 0;
            }
            
            // Show the modal
            imageModal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }
    
    function closeImageModal() {
        if (imageModal) {
            imageModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
});