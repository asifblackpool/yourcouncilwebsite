"use strict";
(function (galleryservices, $, undefined) {

    // Gallery configuration
    const config = {
        scrollAmount: 200,
        thumbnailSelector: '.thumbnail',
        mainImageId: 'mainImage',
        modalOverlayId: 'imageModal',
        thumbnailsContainerId: 'thumbnails'
    };

    // State management
    let currentIndex = 0;
    let imageGallery = null;

    // ==================== PRIVATE FUNCTIONS ====================

    // Utility functions
    const _getImageUrl = (image) => {
        if (image?.Url) return image.Url;
        if (image?.url) return image.url;
        return null;
    };

    const _getAltText = (image) => {
        if (image?.AltText?.trim()) return image.AltText;
        if (image?.altText?.trim()) return image.altText;
        if (image?.Caption?.trim()) return image.Caption;
        if (image?.caption?.trim()) return image.caption;
        return "Image";
    };

    const _showError = (message) => {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');

        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'flex';
        if (errorMessage) errorMessage.textContent = message || "An unknown error occurred.";
    };

    const _scrollThumbnailIntoView = (index) => {
        const thumbnailsContainer = document.getElementById(config.thumbnailsContainerId);
        const thumbnail = document.querySelectorAll(config.thumbnailSelector)[index];

        if (thumbnailsContainer && thumbnail) {
            const containerRect = thumbnailsContainer.getBoundingClientRect();
            const thumbRect = thumbnail.getBoundingClientRect();

            if (thumbRect.left < containerRect.left) {
                thumbnailsContainer.scrollBy({
                    left: thumbRect.left - containerRect.left - 10,
                    behavior: 'smooth'
                });
            } else if (thumbRect.right > containerRect.right) {
                thumbnailsContainer.scrollBy({
                    left: thumbRect.right - containerRect.right + 10,
                    behavior: 'smooth'
                });
            }
        }
    };

    const _navigateModal = (direction) => {
        if (!imageGallery || !Array.isArray(imageGallery) || imageGallery.length === 0) return;

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = imageGallery.length - 1;
        if (newIndex >= imageGallery.length) newIndex = 0;

        setActiveImage(newIndex);
        openModal();
    };

    // Define closeModal as a private function
    const closeModal = () => {
        const modalOverlay = document.getElementById(config.modalOverlayId);
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    //Define openModal as a private function
    const openModal = (index) => {
        if (index !== undefined && index >= 0 && index < imageGallery.length) {
            setActiveImage(index);
        }

        const image = imageGallery[currentIndex];
        const imageUrl = _getImageUrl(image);
        const altText = _getAltText(image);

        if (!imageUrl) return;

        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalCaption = document.getElementById('modalCaption');

        if (modalImage) modalImage.src = imageUrl;
        if (modalImage) modalImage.alt = altText;
        if (modalTitle) modalTitle.textContent = altText;
        if (modalCaption) modalCaption.textContent = image.Caption || image.caption || "";

        const modalOverlay = document.getElementById(config.modalOverlayId);
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    // Event listeners setup
    const _setupEventListeners = () => {
        // Main image click to open modal
        const mainImage = document.getElementById(config.mainImageId);
        if (mainImage) {
            mainImage.addEventListener('click', () => openModal());
        }

        // Thumbnail click events
        document.querySelectorAll(config.thumbnailSelector).forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => setActiveImage(index));
        });

        // Keyboard navigation for modal
        document.addEventListener('keydown', (e) => {
            const modalOverlay = document.getElementById(config.modalOverlayId);
            if (!modalOverlay || !modalOverlay.classList.contains('active')) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    _navigateModal(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    _navigateModal(1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeModal();
                    break;
            }
        });

        // Close modal when clicking on overlay
        const modalOverlay = document.getElementById(config.modalOverlayId);
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }

        // Close modal button
        const closeButton = document.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }

        // Modal navigation buttons
        const modalPrevBtn = document.querySelector('.modal-nav.prev');
        const modalNextBtn = document.querySelector('.modal-nav.next');

        if (modalPrevBtn) {
            modalPrevBtn.addEventListener('click', () => _navigateModal(-1));
        }
        if (modalNextBtn) {
            modalNextBtn.addEventListener('click', () => _navigateModal(1));
        }

        // Thumbnail scroll buttons
        const scrollPrevBtn = document.querySelector('.scroll-btn.prev');
        const scrollNextBtn = document.querySelector('.scroll-btn.next');

        if (scrollPrevBtn) {
            scrollPrevBtn.addEventListener('click', () => scrollThumbnails(-1));
        }
        if (scrollNextBtn) {
            scrollNextBtn.addEventListener('click', () => scrollThumbnails(1));
        }
    };

    // ==================== PUBLIC FUNCTIONS ====================

    const setActiveImage = (index) => {
        if (!imageGallery || !Array.isArray(imageGallery) || index < 0 || index >= imageGallery.length) {
            return;
        }

        currentIndex = index;
        const image = imageGallery[index];
        const imageUrl = _getImageUrl(image);
        const altText = _getAltText(image);

        if (!imageUrl) return;

        // Update main image
        const mainImage = document.getElementById(config.mainImageId);
        if (mainImage) {
            mainImage.src = imageUrl;
            mainImage.alt = altText;
        }

        // Update image info
        const titleElement = document.getElementById('mainImageTitle');
        const captionElement = document.getElementById('mainImageCaption');
        if (titleElement) titleElement.textContent = altText;
        if (captionElement) captionElement.textContent = image.Caption || image.caption || "";

        // Update active thumbnail
        document.querySelectorAll(config.thumbnailSelector).forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });

        // Scroll thumbnail into view
        _scrollThumbnailIntoView(index);
    };

    // Scroll thumbnails function
    const scrollThumbnails = (direction) => {
        const container = document.getElementById(config.thumbnailsContainerId);
        if (container) {
            container.scrollBy({
                left: direction * config.scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // ==================== PUBLIC API ====================

    galleryservices.init = function (galleryData) {
        try {
            console.log('call gallery services init');
            // Handle both array and object with Images property
            if (Array.isArray(galleryData)) {
                imageGallery = galleryData;
            } else if (galleryData?.Images && Array.isArray(galleryData.Images)) {
                imageGallery = galleryData.Images;
            } else {
                imageGallery = galleryData;
            }

            if (!imageGallery || !Array.isArray(imageGallery) || imageGallery.length === 0) {
                _showError("No images found in the gallery.");
                return;
            }

            // Hide loading state
            const loadingState = document.getElementById('loadingState');
            if (loadingState) loadingState.style.display = 'none';

            // Show main image if hidden
            const mainImage = document.getElementById(config.mainImageId);
            if (mainImage) mainImage.style.display = 'block';

            // Initialize event listeners
            _setupEventListeners();

        } catch (error) {
            console.error('Error initializing gallery:', error);
            _showError("Error loading gallery. Please try again.");
        }
    };

    galleryservices.setActiveImage = function (index) {
        setActiveImage(index);
    };

    galleryservices.scrollThumbnails = function (direction) {
        scrollThumbnails(direction);
    };

    galleryservices.openModal = function (index) {
        openModal(index);
    };

    galleryservices.closeModal = function () {
        closeModal();
    };

    // Optional: Add callback function like accordionservices
    galleryservices.callback = function (cb, id) {
        // You can implement callback functionality if needed
        console.log('Callback registered for gallery');
    };

    // Optional: Auto-initialize if window.galleryData exists
    //const _initialize = () => {
        //if (window.galleryData) {
        //   galleryservices.init(window.galleryData);
        //}
    // };

    // Auto-initialize when DOM is ready
    //document.addEventListener('DOMContentLoaded', _initialize);

})(window.galleryservices = window.galleryservices || {}, jQuery);