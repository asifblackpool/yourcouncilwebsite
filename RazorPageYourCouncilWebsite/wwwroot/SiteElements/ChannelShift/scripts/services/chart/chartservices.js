"use strict";
(function (chartservices, $, undefined) {

    var _canvasId = null;
    var _canvas = null;
    var _option = null;
    var _data = null;
    var _type = null;
    var _chart = null;

    var dimensions = function (ratio) {
        _canvas.height = _canvas.width * ratio;
    };

    var options = function () {
        _option = {
            animation: {
                duration: 5000
            },
            title: { display: false },
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }]
            },
            legend: {
                display: false
            },
        };
    };

    var setdata = function (lbls, graphtype, dt, colors) {
        var data = {
            labels: lbls,
            datasets: [
                {
                    
                    //backgroundColor: "rgba(255,99,132,0.2)",
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 2,
                    hoverBackgroundColor: colors,
                    hoverBorderColor: colors,
                    data: dt,
                }
            ]
        };
        _data = data;
        _type = graphtype
    };

    var createbarchart = function () {
     

        _chart = new Chart(_canvas, {
            type: _type,
            data: _data,
            options: _option,
        });
    };

    chartservices.init = function (canvasId, ratio) {
        _canvas = $("#" + canvasId);
        dimensions(ratio);

    };

    chartservices.barchart = function (label, gt, dt, colors) {
        options();
        setdata(label, gt,dt, colors);
        createbarchart();
    };




})(window.chartservices = window.chartservices || {}, jQuery);