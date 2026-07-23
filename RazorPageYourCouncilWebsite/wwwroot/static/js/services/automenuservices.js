"use strict";
(function (automenuservices, $, undefined) {

    var createmenulinks = function (containerSelector) {
        var container = document.querySelector(containerSelector);
        if (!container) {
            console.error('Container not found: ' + containerSelector);
            return;
        }

        // Select headings with the specified classes
        var headings = document.querySelectorAll('.heading-level-2, .heading-level-3');
        if (headings.length === 0) {
            console.warn('No headings with classes heading-level-2 or heading-level-3 found.');
            return;
        }

        // --- Conditionally add the stylesheet ---
        // Normalize the provided path: remove tilde, collapse multiple slashes
        var rawPath = '~/SiteElements/ChannelShift//Content//styles/documents/index.css';
        var stylesheetHref = rawPath.replace(/~\/+/, '/').replace(/\/+/g, '/');

        // Check if the stylesheet is already loaded
        var existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
            link => link.getAttribute('href') === stylesheetHref
        );
        if (!existingLink) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = stylesheetHref;
            document.head.appendChild(link);
        }

        // --- Generate navigation (Table of Contents) ---
        var nav = document.createElement('nav');
        var title = document.createElement('h3');
        title.textContent = 'Contents';
        nav.appendChild(title);
        nav.className = "nav-contents";

        var list = document.createElement('ul');
        list.className = 'no-bullets';

        headings.forEach(function (heading) {
            // Each heading must have an id for the anchor link to work
            if (!heading.id) {
                console.warn('Skipping heading without id:', heading);
                return; // Skip if no id
            }

            var listItem = document.createElement('li');
            var link = document.createElement('a');
            link.href = '#' + heading.id;
            link.className = 'hide-for-print';
            link.textContent = heading.textContent || heading.innerText;
            listItem.appendChild(link);
            list.appendChild(listItem);
        });

        nav.appendChild(list);
        container.appendChild(nav);
    };

    automenuservices.init = function (selector) {
        createmenulinks(selector);
    };

})(window.automenuservices = window.automenuservices || {}, jQuery);