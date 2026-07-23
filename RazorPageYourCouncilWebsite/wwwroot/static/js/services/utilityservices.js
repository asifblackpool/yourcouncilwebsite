const utilityservices = (function () {
    // private function
    function replaceCommasInParagraph(selector) {
        const p = document.querySelector(selector);
        if (!p) return;

        const text = p.textContent || "";
        const updated = text.replace(/,\s*/g, "<br/>"); // replace commas with <br/>
        p.innerHTML = updated;
    }

    function removeEmptyHeadings() {
        // target h1–h6
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        headings.forEach(h => {
            if (!h.textContent.trim()) {
                h.remove();
            }
        });
    }

    // Private function: scroll to hash with partial matching
    // Private function: scroll to hash with partial matching
    function scrollToHashPartial(hash) {
        if (!hash) return;

        const cleanHash = hash.replace(/^#/, ""); // remove leading #
        let target = document.getElementById(cleanHash);

        // Partial match if exact match not found
        if (!target) {
            target = [...document.querySelectorAll("[id]")].find(el =>
                el.id.includes(cleanHash)
            );
        }

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    // Private function: attach click handler to in-page links
    function initAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault(); // prevent default jump
                const hash = this.getAttribute("href");
                scrollToHashPartial(hash);
            });
        });
    }

    // public API
    return {
        replaceCommasInParagraph,
        removeEmptyHeadings,
        scrollToHashPartial,
        initAnchorLinks
    };
})();
