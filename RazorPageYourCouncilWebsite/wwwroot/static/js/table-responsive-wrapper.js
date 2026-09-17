<script>
    (function () {
        function wrapTables() {
            var tables = document.querySelectorAll('table.data-table');
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                // Skip if the table is already inside a .tbl-responsive wrapper
                if (table.closest('.tbl-responsive')) {
                    continue;
                }
                var wrapper = document.createElement('div');
                wrapper.className = 'tbl-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        }
    window.wrapDataTables = wrapTables;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapTables);
    } else {
        wrapTables();
    }
})();
</script>