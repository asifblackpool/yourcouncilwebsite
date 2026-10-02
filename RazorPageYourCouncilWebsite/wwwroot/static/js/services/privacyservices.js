/**
 * privacyServices
 *
 * Client-side builder for the privacy notices table of contents.
 * Reads every rendered privacy-notice accordion heading on the page
 * (id="privacy-title-{AnchorId}") and populates the placeholder
 * emitted server-side by PrivacyNoticesAccordionRenderer:
 *
 *   <nav id="privacy-list-container" aria-label="Privacy notice sections" hidden>
 *       <ul class="shade-black"></ul>
 *   </nav>
 *
 * Usage (once, from a layout or page):
 *     privacyServices.init();
 *
 * Debug logging:
 *     privacyServices.setDebug(true);   // turn logs on
 *     privacyServices.setDebug(false);  // turn logs off
 *     privacyServices.setDebug('warn'); // only warnings/errors
 */
window.privacyServices = (function () {
    'use strict';

    var LOG_PREFIX = '[privacyServices]';
    var CONTAINER_ID = 'privacy-list-container';
    var HEADING_SELECTOR = '[id^="privacy-title-"]';

    // ---------------------------------------------------------------------
    // Debug switch
    //   false      -> no logging at all (default)
    //   true       -> log + warn
    //   'warn'     -> warn only
    // ---------------------------------------------------------------------
    var debug = false;

    function setDebug(value) {
        debug = value;
        return debug;
    }

    function log() {
        if (debug !== true) { return; }
        var args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.log.apply(console, args);
    }

    function warn() {
        if (debug !== true && debug !== 'warn') { return; }
        var args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.warn.apply(console, args);
    }

    function buildTableOfContents() {
        log('init() called — building table of contents');

        var container = document.getElementById(CONTAINER_ID);
        if (!container) {
            warn('placeholder #' + CONTAINER_ID + ' not found — nothing to populate');
            return;
        }
        log('found container', container);

        var list = container.querySelector('ul');
        if (!list) {
            warn('no <ul> inside #' + CONTAINER_ID + ' — aborting');
            return;
        }

        // Avoid duplicating entries if init() is called more than once.
        list.innerHTML = '';

        var headings = document.querySelectorAll(HEADING_SELECTOR);
        log('found ' + headings.length + ' accordion heading(s) matching "' + HEADING_SELECTOR + '"');

        if (!headings.length) {
            warn('no accordion headings found — TOC will remain hidden');
            return;
        }

        var added = 0;

        headings.forEach(function (heading, index) {
            var titleEl = heading.querySelector('.govuk-accordion__section-heading-text')
                || heading.querySelector('h2, h3, button')
                || heading;

            var title = (titleEl.textContent || '').trim();

            log('heading #' + index + ' id="' + heading.id + '" title="' + title + '"');

            if (!title) {
                warn('heading #' + index + ' has empty title — skipping');
                return;
            }

            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + heading.id;
            a.textContent = title;
            li.appendChild(a);
            list.appendChild(li);
            added++;
        });

        log('added ' + added + ' item(s) to the TOC list');

        if (list.children.length) {
            container.hidden = false;
            log('container revealed (hidden=false)');
        } else {
            warn('no items added — container left hidden');
        }

        log('done — final <ul> child count: ' + list.children.length);
    }

    function init() {
        log('init() invoked (readyState="' + document.readyState + '")');

        if (document.readyState === 'loading') {
            log('DOM not ready — deferring until DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', buildTableOfContents, { once: true });
        } else {
            log('DOM already ready — running immediately');
            buildTableOfContents();
        }
    }

    return {
        init: init,
        rebuild: buildTableOfContents,
        setDebug: setDebug
    };
})();