// table-cleaner.js
(function() {
    'use strict';
    
    function cleanTables() {
        // Remove inline styles from cells
        document.querySelectorAll('.govuk-body table th, .govuk-body table td').forEach(cell => {
            cell.removeAttribute('style');
            cell.removeAttribute('width');
            cell.removeAttribute('height');
        });
        
        // Fix table width
        document.querySelectorAll('.govuk-body table').forEach(table => {
            table.style.width = '100%';
            table.style.height = 'auto';
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanTables);
    } else {
        cleanTables();
    }
})();