const headerservices = (function () {

    // Private function to hide H1 if URL matches whitelist
    function hideHeaderOnPages() {
        const h1 = document.querySelector('h1.regular-header');
        if (!h1) return; // nothing to hide

        // Define whitelist of URL paths (substring match)
        const pageWhitelist = [
            '/contact'
        ];

        // Check if current URL matches any whitelist entry
        const currentURL = window.location.pathname.toLowerCase();
        const shouldHide = pageWhitelist.some(path => currentURL.includes(path.toLowerCase()));

        if (shouldHide) {
            h1.style.display = 'none';
        }
    }

    // Public API
    return {
        init: hideHeaderOnPages
    };

})();
