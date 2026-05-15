(function (tableservices, $, undefined) {

    var _table_name = "table.tbl-responsive";

    var setup = function () {
        var headertext = [];
        var headers = document.querySelectorAll(_table_name + " th");
        var tr = document.querySelectorAll(_table_name + " tr");

        for (var i = 0; i < headers.length; i++) {
            var current = headers[i];
            headertext.push(current.textContent.replace(/\r?\n|\r/, ""));
        }

        for (var j = 0; j < tr.length; j++) {
            var row = tr[j];
            for (var k = 0; k < row.length; k++) {
                var col = row.cells[k];
                col.setAttribute("data-th", headertext[k]);
            }
        }
    };

    tableservices.init = function () {
        setup();
    };

    tableservices.tablename = function (tablename) {
        _table_name = tablename;
        setup();
    }

})(window.tableservices = window.tableservices || {}, jQuery);