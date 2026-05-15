"use strict";
(function (accountlibraryservices, $, undefined) {

    var TemplatesEnum = { LOCATION: 0, SUSPEND: 1 };

    var token = "";
    var currentUserId = "";
    var timeout = 200;
    var _commonlibraryservices = null;
    var _cataloglibraryservices = null;
    var _sharedlibraryservices = null;
    var _accordionservices = null;
    var _toggleservices = null;
    var _accountTemplate = null;
    var _sharedTemplate = null;
    var _displayname = null;
    var _listId = null;

    var mylibrarydata = { mylist: null, account: null };

    var isItemSuspended = function (startdate, enddate) {

        var sd = dateservices.convertStringDate(startdate, "yyyy-mm-dd", "-");
        var ed = dateservices.convertStringDate(enddate, "yyyy-mm-dd", "-")

        var currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        return (sd <= currentDate && ed >= currentDate);
    };

    var readyForPickup = function (startdate, enddate) {

        var sd = dateservices.convertStringDate(startdate, "yyyy-mm-dd", "-");
        var ed = dateservices.convertStringDate(enddate, "yyyy-mm-dd", "-")

        var currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        return (sd <= currentDate && ed >= currentDate);
    };
    
    var accountInfo = function (index,callback) {

        var account = {};
        var mylistdata = null;
        var listId = null;
        var checkoutItems = new Array();

        var runAccount = function () {
            $.ajax({
             url: window.commonservices.Config().libraryUrl + '/patron/accountdetails/' + token,
            }).then(function (data) {

                account.data = data;
                if (account.data !== null && account.data.patronCheckoutInfoField !== null) {
                
                    var checkoutInfo    = account.data.patronCheckoutInfoField;

                    for (var i = 0; i < checkoutInfo.length; i++) {
                        checkoutItems.push(
                            {
                                HoldKey: 0,
                                TitleKey: checkoutInfo[i].titleKeyField,
                                Location: '',
                                Token: '',
                                UserID: ''
                            });
                    }               
                }
            }).then(function (data) {
                if (account !== null) {
                    return $.ajax({
                        url: window.commonservices.Config().libraryUrl + '/patron/getMyLists/' + token,
                    });
                }
            }).then(function(data) {

                mylistdata = _commonlibraryservices.returnListObjects(data);   
                if (mylistdata !== null && mylistdata.length > 0) {
                    _listId = listId = mylistdata[0].myListIDField;
                    return $.ajax({
                        url: window.commonservices.Config().libraryUrl + '/patron/getMyList/' + listId + '/' + token,
                    });
                }   
            }).then(function (data) {

                var templatePopulated = false;

                var populateContent = function (account, itemsdata) {
                    _accountTemplate.populateAccount(account, itemsdata);
                    _accountTemplate.hideLocation();
                    _accountTemplate.hideSuspend();
                    _accountTemplate.showAccount();
                    _commonlibraryservices.hide();
                    _accordionservices.init();
                    _accordionservices.open(index);
                    togglelibraryservices.init();
                };

                var complete = function () {
                    if (listId !== null) {
                        var list = _commonlibraryservices.returnListObjects(data);
                        if (list !== null && list.length > 0) {
                            list = list[0];
                            if (list !== null && list.myListEntryInfoField !== null) {
                                var items = new Array();
                                for (var i = 0; i < list.myListEntryInfoField.length; i++) {
                                    items.push({
                                        HoldKey: 0,
                                        TitleKey: list.myListEntryInfoField[i].titleKeyField,
                                        Location: '',
                                        Token: '',
                                        UserID: ''
                                    });
                                }
                                _cataloglibraryservices.catalogItemsList(items, function (data, isOK) {
                                    if (isOK) {
                                        mylibrarydata.mylist = data;
                                        mylibrarydata.account = account;
                                        populateContent(account, data);
                                        callback(true, mylibrarydata);
                                    }
                                    else {
                                        populateContent(account, null);
                                        callback(false, mylibrarydata);
                                    }

                                });
                            } else {
                                populateContent(account, null);
                                callback(true, mylibrarydata);
                            }
                        }
                    } else {
                        mylibrarydata.mylist = null;
                        mylibrarydata.account = account;
                        populateContent(account, null);
                        callback(true, mylibrarydata);
                    }
                };

                _cataloglibraryservices.catalogItemsList(checkoutItems, function (data, isOK) {
                    if (isOK) {
                        account.checkoutItems = data;
                        complete();
                    } else {
                        callback(false, mylibrarydata);
                    }
                });
            }).fail(function () {
                callback(false, mylibrarydata);
            });
        };  
        _commonlibraryservices.show();
        _accountTemplate.hideLocation();
        setTimeout(function () { runAccount() }, timeout);
    };

    var getmyLists = function () {
        $.get(window.commonservices.Config().libraryUrl + '/patron/getMyLists/' + token,
            function (data, status) {
                var list = returnListObjects(data);
                $.each(list, function (index, item) {
                    getmyList(item.myListIDField);
                });
            }
        ).fail(function () { });
    };

    var getmyList = function (listId) {
       
        _listId = listId;
        $.get(window.commonservices.Config().libraryUrl + '/patron/getMyList/' + listId + '/' + token,
            function (data, status) {
                var list = returnListObjects(data);
                if (list !== null && list.length > 0) {
                    return list;
                }
            }
        ).fail(function () { });
    };
    
    var savemylistItem = function (titleKeyArray, operation, callback) {


        $.ajax({
            url: window.commonservices.Config().libraryUrl + '/patron/getMyLists/' + token,
        }).then(function (data) {

            var listId = null;
            if (data !== null && data.length > 0) {   
                listId = data[0].myListIDField;
            }

            var items = new Array();
            for (var i = 0; i < titleKeyArray.length; i++) {
                items.push({ ListId: listId, TitleId: titleKeyArray[i], Operation: operation, Token: token, UserID: currentUserId });
            }
            return $.ajax({
                type:'POST',
                url: window.commonservices.Config().libraryUrl + '/patron/saveMyList',
                data: { '': items }
            });

        }).then(function (data) {
            switch(operation) {
                case 'create':
                    return callback(true);
                default:
                    return callback(true);
            }
        
        }).fail(function () {
           
            switch(operation) {
                case 'create':
                    return  callback(false);
                default:
                    return callback(false);
            }
        });
    };

    var deleteList = function (listId, callback) {

        $.ajax({
            url: window.commonservices.Config().libraryUrl + '/patron/deleteMyList',
            type: "POST",
            contentType: "application/json",
            data: jSON.stringify({ ListId: listId, UserID: '', Token: token }),
            success: function (response) {   
                callback(true);
            },
            error: function (err) {
                callback(false);
            }
        });

    };

    var getHoldItems = function (holdKeyArray, templateView, callback) {

        var backbuttonclick = function () {

            $('button#back-to-account').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                _commonlibraryservices.show();
                setTimeout(function () {
                    _accountTemplate.hideSuspend();
                    _accountTemplate.hideLocation();
                    _accountTemplate.showAccount();
                    _commonlibraryservices.hide();
                }, timeout);
            });
        };

        var holdItems = new Array();
        for (var i = 0; i < holdKeyArray.length; i++) {
            holdItems.push(
                {
                    HoldKey: holdKeyArray[i],
                    TitleKey: 0,
                    Location: '',
                    Token: token,
                    UserID: ''
                });
        }

        return $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/patron/getholditems',
            data: { '': holdItems },
            success: function (data) {
                _accountTemplate.hideAccount();
         
                if (templateView === TemplatesEnum.LOCATION) {
                    _accountTemplate.populateLocation(data);
                    _accountTemplate.showLocation();
                }
                else {
                    _accountTemplate.populateSuspend(data);
                    _accountTemplate.showSuspend();
                }

                _commonlibraryservices.hide();
                backbuttonclick();
                callback(true);
            },
            error: function (err) {
                callback(false);
            }
        });

       
    };
    
    var getHoldItem = function (holdKey, callback) {
        $.get(window.commonservices.Config().libraryUrl + '/patron/getholditem/' + holdKey + '/' + token,
          function (data, status) {

              callback(true);
          }).fail(function ()
          {
              callback(false);
          });
    };

    //reserve item functions incl (suspend, edit location)
    var holdItem = function (titlekey, locationId, callback) {
        $.post(window.commonservices.Config().libraryUrl + '/patron/holditem', { Titlekey: titlekey, HoldKey: 0, Location: locationId, Token: token },
         function (data, status) {
             callback(true)
         }
      ).fail(function (e) {
          callback(false, e.responseJSON);
      });
    };

    var holdItems = function (data, callback) {

        var holdItems = new Array();
        for (var i = 0; i < data.length; i++) {
            holdItems.push(
                {
                    HoldKey: 0,
                    TitleKey: data[i].titleId,
                    Location: data[i].libraryId,
                    Token: token,
                    UserID: ''
                });
        }

        $.post(window.commonservices.Config().libraryUrl + '/patron/holditems',  { '': holdItems },
         function (data, status) {
             callback(true)
         }
      ).fail(function (e) {
          callback(false, e.responseJSON);
      });
    };

    var cancelholdItem = function (holdkeys, callback) {
        var keys = new Array();
        for (var i = 0; i < holdkeys.length; i++) {
            keys.push(
                {
                    HoldKey: holdkeys[i],
                    TitleKey: 0,
                    Location: 0,
                    Token: token,

                });
        }

        $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/patron/cancelholditems',
            data: { '': keys },
            success: function (data) {
                callback(true);
            },
            error: function (err) {
                callback(false);
            }
        });
    };

    var suspendHold = function (items, startdate, enddate, callback) {
 
        var suspendItems = new Array();
        for (var i = 0; i < items.length; i++) {
            suspendItems.push(
                {
                    HoldKey: items[i],
                    TitleKey: 0,
                    Location: 0,
                    StartDate: startdate.toUTCString(),
                    EndDate: enddate.toUTCString(),
                    Token: token,
                    
                });
        }

        $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/patron/suspendholditems',
            data: { '': suspendItems },
            success: function (data) {
                callback(true, '');
            },
            error: function (err) {
                callback(false, err.responseText);
            }
        });
    };

    var unsuspendHold = function (items, callback) {

        var suspendItems = new Array();
        for (var i = 0; i < items.length; i++) {
            suspendItems.push(
                {
                    HoldKey: items[i],
                    TitleKey: 0,
                    Location: 0,
                    Token: token,

                });
        }

        $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/patron/cancelSuspendHolditem',
            data: { '': suspendItems },
            success: function (data) {
                callback(true);
            },
            error: function (err) {
                callback(false);
            }
        });
    };

    var editLlocationHold = function (items, callback) {

        var holdItems = new Array();
        for (var i = 0; i < items.length; i++) {
            holdItems.push(
                {
                    HoldKey: items[i].Id,
                    TitleKey: 0,
                    Location: items[i].locationId,
                    Token: token,
                    UserID: ''
                });
        }

        $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/patron/editLocationHolditems',
            data: { '': holdItems },
            success: function (data) { 
                callback(true);
            },
            error: function (err) {
                callback(false);
            }
        });
    };

    var changePin = function (pswd, newpswd, tokn, callback) {
        if (tokn === null) {
            tokn = token;
        }
        $.post(window.commonservices.Config().libraryUrl + '/patron/changePin', { CurrentPin: pswd, NewPin: newpswd, Token: tokn },
         function (data, status) {

             if (data) {
                 return callback(true);
             }
          
             return callback(false);
         }
      ).fail(function (e) {
          callback(false, e.responseJSON.ExceptionMessage);
      });
    };

    var renewItem = function (itemId, callback) {
        $.post(window.commonservices.Config().libraryUrl + '/patron/renewItem', { Titlekey: itemId, HoldKey: 0, Location: 0, Token: token, UserID: currentUserId },
        function (data, status) {
            if (data) {
                return callback(true, "");
            }

            callback(false, 'A problem occurred with this item renewal');
        }
     ).fail(function (e) {
         var msg = "";
         try { msg = e.responseJSON.Message;} catch(e1) { msg = e.statusText}
    
         callback(false, msg);
     });
    };

    var sendEmail = function (email, callback) {
        $.post(window.commonservices.Config().libraryUrl + '/patron/emailMyList', { Email: email, ListId:_listId, Token: token },
        function (data, status) {

            if (data) {
                return callback(true);
            }

            return callback(false);
        }
     ).fail(function (e) {
         callback(false, e.responseJSON.ExceptionMessage);
     });
    };

    //cookiet works
    var getcookieValues = function () {
        token = window.cookieservices.ReadCookie("libraryToken");
        currentUserId = window.cookieservices.ReadCookie("libraryUserId");
    }

    //public properties 
    accountlibraryservices.init = function (services, catalogservices,sharedlibraryservices,toggleservices, accordionservices) {
        _commonlibraryservices = services;
        _sharedlibraryservices = sharedlibraryservices;
        _cataloglibraryservices = catalogservices;
        _toggleservices = toggleservices;
        _accountTemplate = _commonlibraryservices.accountTemplate();
        _sharedTemplate = _commonlibraryservices.sharedTemplate();
        _accordionservices = accordionservices;
    };

    accountlibraryservices.accountInfo = function (accordionIndex, callback) {
        getcookieValues();
        accountInfo(accordionIndex, callback);
    };

    accountlibraryservices.reset = function () {
        _accountTemplate.clearAccount();
        _sharedTemplate.reset();
    };

    accountlibraryservices.savemylist = function (list, operation, callback)  {
        getcookieValues();
        savemylistItem(list, operation, callback);
    };

    accountlibraryservices.getmylists = function () {
        getcookieValues();
        getmyLists();
    };

    accountlibraryservices.getmyList = function (listId) {
        getcookieValues();
        return getmyList(listId);
    };

    accountlibraryservices.deletemyList = function (list, callback) {
        getcookieValues();
        return savemylistItem(list, 'delete',callback);
    };

    accountlibraryservices.getHoldItem = function (holdkey, callback) {
        getcookieValues();
        getHoldItem(holdkey, callback);
    };

    accountlibraryservices.getHoldItems = function (HoldKeyArray, callback) {
        getcookieValues();
        getHoldItems(HoldKeyArray, TemplatesEnum.LOCATION, callback);
    };

    accountlibraryservices.createhold = function (titlekey, locationId, callback) {
        getcookieValues();
        holdItem(titlekey, locationId, callback);
    };

    accountlibraryservices.createholds = function (data, callback) {
        getcookieValues();
        holdItems(data, callback);
    };

    accountlibraryservices.cancelhold = function (holdkeys, callback) {
        cancelholdItem(holdkeys, callback);
    };

    accountlibraryservices.getSuspendItems = function (HoldKeyArray, callback) {
        getcookieValues();
        getHoldItems(HoldKeyArray, TemplatesEnum.SUSPEND, callback);
    };

    accountlibraryservices.suspendHold = function (HoldKeyArray, startdate, enddate, callback) {
        getcookieValues();
        suspendHold(HoldKeyArray, startdate, enddate, callback);
    };

    accountlibraryservices.unsuspendHold = function (HoldKeyArray, callback) {
        getcookieValues();
        unsuspendHold(HoldKeyArray, callback);
    };

    accountlibraryservices.editLocationHold = function (items, callback) {
        getcookieValues();
        editLlocationHold(items, callback);
    };

    accountlibraryservices.ChangePin = function (pswd, newpswd, token,callback) {
        getcookieValues();
        changePin(pswd, newpswd, token,callback);
    };

    accountlibraryservices.renewItem = function (itemId, callback) {
        _commonlibraryservices.hide();
        getcookieValues();
        renewItem(itemId, callback);
    };

    accountlibraryservices.emailMyList = function (email, callback) {
        sendEmail(email, callback);
    };

    accountlibraryservices.ancestryLink = function (url) {
         $('#ancestry-link').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                window.location.href = url;
               
        });
    };


})(window.accountlibraryservices = window.accountlibraryservices || {}, jQuery);
//# sourceURL=accountlibraryservices.js