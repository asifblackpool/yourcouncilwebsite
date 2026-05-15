const formservices = (function () {
    // Private function to wrap left-side content for a specific form
    function wrapFormContainer(formId) {
        const container = document.querySelector('.content-container');
        if (!container) return;

        const leftWrapper = document.createElement('div');
        leftWrapper.classList.add('left-col-text');

        // Select all h2, p, a elements before this specific form
        const elementsToWrap = [];
        let formFound = false;

        container.childNodes.forEach(node => {
            if (!formFound) {
                if (node.tagName === 'H2' || node.tagName === 'P' || node.tagName === 'A') {
                    elementsToWrap.push(node);
                }
            }

            // Stop when we hit the form with our ID
            if (node.nodeType === 1 && node.dataset?.contensisFormId === formId) {
                formFound = true;
            }
        });

        // Move selected elements into leftWrapper
        elementsToWrap.forEach(el => leftWrapper.appendChild(el));

        // Find and wrap the form
        const formDiv = container.querySelector(`[data-contensis-form-id="${formId}"]`);
        if (!formDiv) return;

        container.insertBefore(leftWrapper, formDiv);

        const outerWrapper = document.createElement('div');
        outerWrapper.classList.add('form-outer-container');
        outerWrapper.appendChild(leftWrapper);
        outerWrapper.appendChild(formDiv);
        container.appendChild(outerWrapper);
    }

    // Initialize all forms
    function initAllForms() {
        const formDivs = document.querySelectorAll('[data-contensis-form-id]');
        formDivs.forEach(formDiv => {
            const formId = formDiv.dataset.contensisFormId;
            if (formId) {
                wrapFormContainer(formId);
            }
        });
    }

    // Public API
    return {
        init: wrapFormContainer,     // Initialize a specific form
        initAll: initAllForms        // Initialize all forms on the page
    };
})();