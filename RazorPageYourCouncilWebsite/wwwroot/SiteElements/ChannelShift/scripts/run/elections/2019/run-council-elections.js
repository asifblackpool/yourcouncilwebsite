 $('document').ready(function() {
        var cb = function(sheetId) {
            electionservices.getSheet(sheetId);
        };
        
        var hexCodes = new Array();
        hexCodes.push({ key: 'con', party: 'Conservative party', hexcolor: '#0087DC' });
        hexCodes.push({ key:'lab',  party: 'Labour party', hexcolor: '#D5000D' });
        hexCodes.push({ key: 'lib', party: 'Liberal Democatic Party', hexcolor: '#FAA61A' });
        hexCodes.push({ key: 'gr', party: 'Green', hexcolor: '#6AB023' });
        hexCodes.push({ key: 'uk', party: 'UK', hexcolor: '#6D3177' });
        hexCodes.push({ key: 'in', party: 'Independents', hexcolor: '#ccd2d5' });
        hexCodes.push({ key: 'ot', party: 'Others', hexcolor: '#E3E4E6' });
        hexCodes.push({ key: 'blk', party: 'Blank', hexcolor: '#ccd2d5' });

        electionservices.init(window.chartservices, hexCodes,"1bSCQOfdCi-KlLx87HjSwP4Lq3aPOLBZZpPQ-0rSGmJ4", true);
        accordionservices.callback(cb);
});