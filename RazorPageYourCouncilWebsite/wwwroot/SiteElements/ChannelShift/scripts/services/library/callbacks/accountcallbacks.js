"use strict";
(function (accountcallbacks, $, undefined) {

    var titleId = null;
    var listId = null;
    
    var _mylibrarydata = null;
    var _commonlibraryservices = null;
    var _pickuplocationcallbacks = null;
    var _accordionservices = null;
    var _togglelibraryservices = null;
    var _accountTemplate = null;
 

    var messages = { success: '', error: '', visible: true };

    function reversedate(str) {

        if (str.length > 9) {
            var result = str.split('-');
            return result[2] + '-' + result[1] + '-' + result[0];
        }
        return str;
    }

    /*callback functions */
    var login = function (loggedin) {
        if (loggedin) {
            securitylibraryservices.clearloginTemplate();
            accountlibraryservices.accountInfo(-1, bindAccountEvents);
        }
        else {
            _commonlibraryservices.overlay(100, "Unable to log you in. Please check your username and password.");
        }
    };

    var orderbyPopulate = function (index, data) {

        var populateContent = function (data) {
            _commonlibraryservices.accountTemplate().clearAccount();
            _commonlibraryservices.accountTemplate().populateAccount(data.account, data.mylist);
            _commonlibraryservices.accountTemplate().hideLocation();
            _commonlibraryservices.accountTemplate().hideSuspend();
            _commonlibraryservices.accountTemplate().showAccount();
            _commonlibraryservices.hide();
            _accordionservices.init();
            _accordionservices.open(index);
            _togglelibraryservices.init();
        };

        populateContent(data)
        bindAccountEvents(index, data);
        _commonlibraryservices.showHide(_commonlibraryservices.searchView().ACCOUNT);

    };

    var bindAccountEvents = function (isOk, mylibrarydata) {

        _mylibrarydata = mylibrarydata;

        var RenewButtonClicks = function () {

            var titleId = null;
            var itemId = null;

            var onLoanSelectFilter = function () {

                var id_class_name = "select.onloan-orderby";
                var selectedIndex = 0;

                $(id_class_name).on('change', function () {

                    selectedIndex = this.selectedIndex;
                    switch (this.value) {
                        case 'Title':
                            _mylibrarydata.account.checkoutItems.sort(_commonlibraryservices.predicateBy("titleField"));
                            orderbyPopulate(2, mylibrarydata);
                            selectedIndex = this.selectedIndex;

                            break;
                        case 'Author':
                            _mylibrarydata.account.checkoutItems.sort(_commonlibraryservices.predicateBy("authorField"));
                            orderbyPopulate(2, _mylibrarydata);
                            selectedIndex = this.selectedIndex;
                            break;
                        case 'Publish':
                            _mylibrarydata.account.checkoutItems.sort(_commonlibraryservices.predicateBy("datePublishedField"));
                            orderbyPopulate(2, _mylibrarydata);
                            selectedIndex = this.selectedIndex;
                            break
                        default:
                            break;
                    }

                    $(id_class_name).prop("selectedIndex", selectedIndex)
                });
            };

            var renewclick = function () {
                $('.renew-click').on('click', function (e) {
                    titleId = null;
                    titleId = ((this.id).split('-'))[1];

                   renewItem();
                });
            };

            var renewItem = function () {
                itemId = $("#renew-hidden-" + titleId).val();
                _commonlibraryservices.show();
                accountlibraryservices.renewItem(itemId, function (success, msg) {
                    if (success) {
                        _commonlibraryservices.overlay(100, 'Item has been renewed.');
                        _commonlibraryservices.PositionXY('renew-' + titleId, false);
                        accountlibraryservices.accountInfo(2, bindAccountEvents);
                    }
                    else {
                        _commonlibraryservices.overlay(100, "Unable to renew items. <br/>" + msg);
                        _commonlibraryservices.PositionXY('renew-' + titleId, false);

                    }
                });
            };
   
            renewclick();
            onLoanSelectFilter();
        };

        var HoldButtonClicks = function () {

            var onHoldValues = null;

            var getAllCheckedItems = function () {
                var values = $('table.patron-hold-info input:checked').map(function () {
                    return this.value;
                }).get();

                return (values.length > 0) ? values : null;
            };

            var selectAll = function () {
                $("#patron-hold-info-all").change(function () {  //"select all" change 
                    $("table.patron-hold-info input[type='checkbox']").prop('checked', $(this).prop("checked")); //change all ".checkbox" checked status
                });
            };

            var locationClick = function () {

                var populateLocation = function (isLoggedIn) {
                    if (isLoggedIn) {
                        _commonlibraryservices.show();
                        accountlibraryservices.getHoldItems(onHoldValues, function (isOK) {
                            if (isOK) { save(); }
                        });
                    }
                    else {
                        accountlibraryservices.reset();
                    }
                };

                var edit = function () {

                    $('#onhold-edit').on('click', function (e) {
                        onHoldValues = getAllCheckedItems();
                        e.preventDefault();
                        if (onHoldValues === null) {
                            _commonlibraryservices.overlay(100, 'You need to tick your checkboxes from on hold items.');
                        }
                        else {


                            securitylibraryservices.authenticated(populateLocation);
                        }
                    });
                };

                var save = function () {
                    //bind location button here ...
                    $('#update-location').on('click', function (e) {
                        var getLocationDropDownSelections = function () {
                            var val = new Array();
                            $("select.select-edit-location option:selected").each(function () {
                                val.push(this.value);
                            });
                            return (val.length > 0) ? val : null;
                        };
                        var locationIds = getLocationDropDownSelections();
                        var items = new Array()
                        for (var i = 0; i < onHoldValues.length; i++) {
                            items.push({ Id: onHoldValues[i], locationId: locationIds[i] });
                        }

                        accountlibraryservices.editLocationHold(items, function (isOK) {
                            if (isOK) {
                                _commonlibraryservices.overlay(100, 'Your library pickup locations updated.');
                                accountlibraryservices.accountInfo(3, bindAccountEvents);

                            } else {
                                _commonlibraryservices.overlay(100, 'Unable to update your library pickup locations.');
                            }
                        });
                    });

                }

                selectAll();
                edit();
            };

            var suspendClick = function () {

                var validateSuspendForm = function () {
                    var bsv = null;
                    var suspendKeys = null;

                    var data = { Id: null, StartDate: null, EndDate: '' }

                    var submitform = function () {
                        var new_obj = {};

                        //check authentication 


                        $.each($('#suspenditem-form').serializeArray(), function (i, obj) {
                            new_obj[obj.name] = obj.value;
                        });
                        data.Id = parseInt(new_obj["holdkeyId"]);
                        data.StartDate = reversedate(new_obj["StartDateTime"]);
                        data.EndDate = reversedate(new_obj["EndDateTime"]);
                        new_obj = null;

                        suspendKeys = getSuspendHoldKeys();

                        data.StartDate = window.dateservices.convertToDate(data.StartDate, 'dd-mm-yyyy', '-');
                        data.EndDate = window.dateservices.convertToDate(data.EndDate, 'dd-mm-yyyy', '-');


                        //make api call 
                        accountlibraryservices.suspendHold(suspendKeys, data.StartDate, data.EndDate, function (isOK, msg) {
                            if (isOK) {
                                _commonlibraryservices.overlay(100, 'Items have been suspended.');
                                accountlibraryservices.accountInfo(3, bindAccountEvents);

                            } else {
                                _commonlibraryservices.overlay(100, 'Unable to suspend items.<br/>' + msg);
                                _commonlibraryservices.PositionXY('onhold-suspend');
                            }
                        });
                    };

                    var bindDatepicker = function () {

                        var validate_startdatepicker = function (dt) {
                            $('#suspenditem-form')
                                  .bootstrapValidator('updateStatus', 'StartDateTime', 'VALIDATED')
                                  .bootstrapValidator('validateField', 'StartDateTime');
                        };

                        var validate_enddatepicker = function (dt) {
                            $('#suspenditem-form')
                                  .bootstrapValidator('updateStatus', 'EndDateTime', 'VALIDATED')
                                  .bootstrapValidator('validateField', 'EndDateTime');
                        };


                        $("#StartDateTime").focus(function () {
                            validate_startdatepicker( $(this).val());
                        });
                        $("#EndDateTime").focus(function () {
                            validate_enddatepicker($(this).val());
                        });

                        $("#StartDateTime").blur(function () {
                            validate_startdatepicker($(this).val());
                        });
                        $("#EndDateTime").blur(function () {
                            validate_enddatepicker($(this).val());
                        });

                        var getTodaysDate = function () {
                            var today = new Date();
                            var day = today.getDate();
                            // Set month to string to add leading 0
                            var mon = new String(today.getMonth() + 1); //January is 0!
                            var yr = today.getFullYear();
                            if (day.length < 2) { day = "0" + day; }
                            if (mon.length < 2) { mon = "0" + mon; }

                            var date = new String(yr + '-' + mon + '-' + day);
                            return date;
                        };

                        

                        //$("#StartDateTime").datetimepicker({
                        //    dateFormat: "dd-mm-yy",
                        //    alwaysSetTime: false,
                        //    showHour: false,
                        //    showMinute: false,
                        //    showTime: false,
                        //    minDate: Date.now(),
                        //    onSelect: function (selectedDateTime) { validate_startdatepicker(selectedDateTime); },
                        //    onClose: function (selectedDateTime) { validate_startdatepicker(selectedDateTime); }
                        //});

                        //$("#EndDateTime").datetimepicker({
                        //    dateFormat: "dd-mm-yy",
                        //    alwaysSetTime: false,
                        //    showHour: false,
                        //    showMinute: false,
                        //    showTime: false,
                        //    minDate: Date.now(),
                        //    onSelect: function (selectedDateTime) { validate_enddatepicker(selectedDateTime); },
                        //    onClose: function (selectedDateTime) { validate_enddatepicker(selectedDateTime); }
                        //});
                    };

                    var bindvalidataor = function () {

                       
                        var suspendValidation = {
                            isFutureDate: function (str) {
                               return dateservices.GreaterThanToday(reversedate(str));
                            },   
                            isSame: function (str1, str2) {
                                return str1 === str2;
                            }
                        };

                        /* check if validator has been created */
                        if (bsv !== null) {
                            /*if created reset the form data */
                            $('#suspenditem-form').data('bootstrapValidator', null);
                        }

                        bsv = $('#suspenditem-form').bootstrapValidator({

                            feedbackIcons: {
                                valid: 'glyphicon glyphicon-ok',
                                invalid: 'glyphicon glyphicon-remove',
                                validating: 'glyphicon glyphicon-refresh'
                            },
                            fields: {
                                StartDateTime: {
                                    validators: {
                                        notEmpty: {
                                            message: 'The date is required'
                                        },
                                        callback: {
                                            callback: function (value, validator, $field) {
                                                // Count the number of digits in your password
                                                var isvalid = suspendValidation.isFutureDate(value);
                                                
                                                if (!isvalid) {
                                                    return {
                                                        valid: false,
                                                        message: "The date must be greater than yesterdays date."
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                    }
                                },
                                EndDateTime: {
                                    validators: {
                                        notEmpty: {
                                            message: 'The date is required'
                                        },
                                        callback: {
                                            callback: function (value, validator, $field) {
                                                // Count the number of digits in your password
                                                var isvalid = suspendValidation.isFutureDate(value);

                                                if (!isvalid) {
                                                    return {
                                                        valid: false,
                                                        message: "The date must be greater than yesterdays date."
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                    }
                                }
                            },
                            submitHandler: function (validator, form, submitButton) {
                                submitform();
                            },
                            destroy: function () { console.log('destroy'); }

                        });

                    };

                    var getSuspendHoldKeys = function () {

                        var values = $("input.suspend-holdkeys").map(function () {
                            return this.value;
                        }).get();

                        return (values.length > 0) ? values : null;
                    };

                    bindDatepicker();
                    bindvalidataor();
                };

                var populateSuspend = function (isLoggedIn) {
                    if (isLoggedIn) {
                        _commonlibraryservices.show();
                        accountlibraryservices.getSuspendItems(onHoldValues, function (isOK) {
                            if (isOK) {
                                validateSuspendForm();
                            }
                        });
                    }
                    else {
                        accountlibraryservices.reset();
                    }
                }

                var suspend = function () {
                    $('#onhold-suspend').on('click', function (e) {
                        onHoldValues = getAllCheckedItems();
                        e.preventDefault();
                        if (onHoldValues === null) {
                            _commonlibraryservices.overlay(100, 'You need to tick your checkboxes from on hold items.');
                            _commonlibraryservices.PositionXY('onhold-suspend');
                        }
                        else {
                            securitylibraryservices.authenticated(populateSuspend);
                        }
                    });
                };

                selectAll();
                suspend();

            };

            var unsuspendClick = function () {

                var unsuspend = function () {
                    $('#onhold-unsuspend').on('click', function (e) {
                        onHoldValues = getAllCheckedItems();
                        e.preventDefault();
                        if (onHoldValues === null) {
                            _commonlibraryservices.overlay(100, 'You need to tick your checkboxes from on hold items.');
                            _commonlibraryservices.PositionXY('onhold-unsuspend');
                        }
                        else {
                            securitylibraryservices.authenticated(update);
                        }

                    });

                };

                var update = function (isLoggedIn) {

                    if (!isLoggedIn) { return notLoggedIn(); }

                    accountlibraryservices.unsuspendHold(onHoldValues, function (isOK) {
                        if (isOK) {
                            _commonlibraryservices.overlay(100, 'Your items have been unsuspended.');
                            accountlibraryservices.accountInfo(3, bindAccountEvents);
                        }
                    });
                };

                selectAll();
                unsuspend();
            };

            var cancelClick = function () {
                var cancel = function () {
                    $('#onhold-cancel').on('click', function (e) {
                        onHoldValues = getAllCheckedItems();
                        e.preventDefault();
                        if (onHoldValues === null) {
                            _commonlibraryservices.overlay(100, 'You need to tick your checkboxes from on hold items.');
                            _commonlibraryservices.PositionXY('onhold-cancel');
                        }
                        else {
                            securitylibraryservices.authenticated(update);
                        }
                    });
                };

                var update = function (isLoggedIn) {

                    if (!isLoggedIn) { return accountlibraryservices.reset(); }

                    accountlibraryservices.cancelhold(onHoldValues, function (isOK) {
                        if (isOK) {
                            _commonlibraryservices.overlay(100, 'Your items have been cancelled.');
                            accountlibraryservices.accountInfo(3, bindAccountEvents);
                            securitylibraryservices.yourStatus(true);
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().ACCOUNT);
                        }
                        else {
                            _commonlibraryservices.overlay(100, 'There was a problem cancelling your items');
                            _commonlibraryservices.PositionXY('onhold-cancel');
                        }
                    });
                };

                selectAll();
                cancel();
            };

            locationClick();
            suspendClick();
            unsuspendClick();
            cancelClick();    
        };

        var MyListButtonClicks = function () {

            var mylistValues = null;

            var mylistSelectFilter = function () {

                var id_class_name = "select.mylist-orderby";
                var selectedIndex = 0;

                $(id_class_name).on('change', function () {
                    selectedIndex = this.selectedIndex;
                    switch (this.value)
                    {
                        case 'Title':
                            _mylibrarydata.mylist.sort(_commonlibraryservices.predicateBy("titleField"));
                            orderbyPopulate(4, _mylibrarydata);
                            selectedIndex = this.selectedIndex;
                          ;
                            break;
                        case 'Author':
                            _mylibrarydata.mylist.sort(_commonlibraryservices.predicateBy("authorField"));
                            orderbyPopulate(4, _mylibrarydata);
                            selectedIndex = this.selectedIndex;
                            break;
                        case 'Publish':
                            _mylibrarydata.mylist.sort(_commonlibraryservices.predicateBy("datePublishedField"));
                            orderbyPopulate(4, _mylibrarydata);
                            selectedIndex = this.selectedIndex;
                            break
                        default:
                            break;
                    }

                    $(id_class_name).prop("selectedIndex", selectedIndex)
                });
            };

            var getAllCheckedItems = function () {
                var values = $('div.mylist-checkboxes input:checked').map(function () {
                    return this.value;
                }).get();

                return (values.length > 0) ? values : null;
            };

            var selectAll = function () {
                $("#mylist-all").change(function () {  //"select all" change 
                    $(".mylist-checkboxes input[type='checkbox']").prop('checked', $(this).prop("checked")); //change all ".checkbox" checked status
                });
            };

            var reserveItems = function (isLoggedIn) {

                if (isLoggedIn) {
                    _commonlibraryservices.show();
                    var backto = _commonlibraryservices.searchView().ACCOUNT
                    sharedlibraryservices.populatePickupLocation(mylistValues, backto, function (success) {
                        if (success) {
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().PICKUP_LOCATION);
                            _pickuplocationcallbacks.init(_commonlibraryservices);
                            _pickuplocationcallbacks.bindEvents(mylistValues, backto, true, function (isOk) {
                                if (isOk) {
                                    messages.visible = false;
                                    removeItems(isLoggedIn);
                                }
                            });
                        }
                    });
                }
                else {
                    accountlibraryservices.reset();
                }
            };

            var removeItems = function (isLoggedIn) {

                if (isLoggedIn) {
                    _commonlibraryservices.show();
                    accountlibraryservices.deletemyList(mylistValues, removeCompleted)
                }
                else {
                    accountlibraryservices.reset();
                }
            };

            var removeCompleted = function (itemsRemoved) {

                if (itemsRemoved) {
                
                    accountlibraryservices.accountInfo(4, bindAccountEvents);
                    securitylibraryservices.yourStatus(true);
                    _commonlibraryservices.showHide(_commonlibraryservices.searchView().ACCOUNT);

                    if (messages.visible) {
                        _commonlibraryservices.overlay(100, messages.success);
                        _commonlibraryservices.PositionXY('mylist-delete', false);
                    }
                }
                else {
                    if (messages.visible) {
                        _commonlibraryservices.overlay(100, messages.error);
                        _commonlibraryservices.PositionXY('mylist-delete', false);
                    }
                }         
            };
 
            var bindClick = function () {
                $('#mylist-delete').on('click', function (e) {
                    
                    messages.success = "Items removed from My List.";
                    messages.error = "There was a problem removing items from My List.";
                    messages.visible = true;

                    mylistValues = getAllCheckedItems();

                    if (mylistValues === null) {
                        _commonlibraryservices.overlay(100, 'To delete from My Lists. You need to tick your checkboxes from My Lists.');
                        _commonlibraryservices.PositionXY('mylist-delete', false);
                    }
                    else {
                        securitylibraryservices.authenticated(removeItems);
                    }
                });

                $('#mylist-reserve-item').on('click', function (e) {

                    messages.success = "";
                    messages.error = "";
                    messages.visible = false;
                    mylistValues = getAllCheckedItems();

                    if (mylistValues === null) {
                        _commonlibraryservices.overlay(100, 'To add to Hold from My Lists. You need to tick your checkboxes from My Lists.');
                        _commonlibraryservices.PositionXY('mylist-reserve-item', false);
                    }
                    else {
                        securitylibraryservices.authenticated(reserveItems);
                    }
                });

                $('#mylist-email').on('click', function (e) {

                    var bindCancelClick = function () {
                        $('#mylist-email-cancel').on('click', function (e) {
                            _commonlibraryservices.show();
                            setTimeout(function () {
                                $('#email-mylist-form').bootstrapValidator('resetForm', true);
                                $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.email).hide();
                                $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.main).show();
                                commonlibraryservices.hide();
                            }, 400);
                        });
                    };

                    _commonlibraryservices.show();
                    setTimeout(function () {
                        $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.main).hide();
                        $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.email).show();
                        _commonlibraryservices.hide();
                        bindCancelClick();
                    }, 400);  
                });
            };

            selectAll();
            bindClick();
            mylistSelectFilter();
        };

        var ChangePinClicks = function () {

            var validateChangePinForm = function () {
                var changepinbsv = null;

                var submitform = function () {
                    var new_obj = {};

                    var changepinData = { pswd: '', newpswd: '', confirmpswd: '' };

                    $.each($('#changepin-form').serializeArray(), function (i, obj) {
                        new_obj[obj.name] = obj.value;
                    });
                    changepinData.pswd = new_obj["currentPassword"];
                    changepinData.newpswd = new_obj["newPassword"];
                    changepinData.confirmpswd = new_obj["confirmPassword"];
                    new_obj = null;

                    accountlibraryservices.ChangePin(changepinData.pswd, changepinData.newpswd, null, function (isOK, msg) {
                        if (isOK) {
                            _commonlibraryservices.overlay(100, 'Your pin have been updated.');
                            accountlibraryservices.accountInfo(0, bindAccountEvents);

                        } else {
                            _commonlibraryservices.overlay(100, 'Unable to update your password.<br/>' + msg);
                        }
                    });
                };

                var bindvalidataor = function () {

                    var validation = {
                        isEmailAddress: function (str) {
                            var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                            return pattern.test(str);  // returns a boolean
                        },
                        isNotEmpty: function (str) {
                            var pattern = /\S+/;
                            return pattern.test(str);  // returns a boolean
                        },
                        isNumber: function (str) {
                            var pattern = /^\d+$/;
                            return pattern.test(str);  // returns a boolean
                        },
                        isSame: function (str1, str2) {
                            return str1 === str2;
                        }
                    };

                    /* check if validator has been created */
                    if (changepinbsv !== null) {
                        /*if created reset the form data */
                        $('#changepin-form').data('bootstrapValidator', null);
                    }

                    changepinbsv = $('#changepin-form').bootstrapValidator({

                        feedbackIcons: {
                            valid: 'glyphicon glyphicon-ok',
                            invalid: 'glyphicon glyphicon-remove',
                            validating: 'glyphicon glyphicon-refresh'
                        },
                        fields: {

                            currentPassword: {
                                validators: {
                                    notEmpty: {
                                        message: 'The current password needs to be entered.'
                                    }
                                }
                            },
                            newPassword: {
                                validators: {
                                    notEmpty: {
                                        message: 'The new password needs to be entered.'
                                    },
                                    //stringLength: {
                                    //    min:4,
                                    //    max: 8,
                                    //    message: 'The new password must be a 8 digit number only.'
                                    //},
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            // Count the number of digits in your password
                                            var isNumber = validation.isNumber(value);
                                            console.log('digicount');


                                            // Check for 6 characters length.
                                            if (value.length !== 4) {
                                                return {
                                                    valid: false,
                                                    message: "The pin must be at only 4 characters long."
                                                }
                                            }

                                            // Check the number of used digits
                                            if (!isNumber) {
                                                return {
                                                    valid: false,
                                                    message: "The new pin must contains all digits only."
                                                }
                                            }

                                            return true;
                                        }
                                    }
                                }
                            },
                            confirmPassword: {
                                validators: {
                                    notEmpty: {
                                        message: 'The confirm pin needs to be entered.'
                                    },
                                    identical: {
                                        field: 'newPassword',
                                        message: 'The new pin and its confirm pin are not the same'
                                    }
                                }
                            },
                        },
                        submitHandler: function (validator, form, submitButton) {
                            submitform();
                        },
                        destroy: function () { console.log('destroy'); }

                    });

                };

                bindvalidataor();
            };

            validateChangePinForm();
        };

        var EmailMyListClicks = function () {

            var validateMyListForm = function () {
                var emailmylistbsv = null;

                var bindvalidataor = function () {

                    var validation = {
                        isEmailAddress: function (str) {
                            var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                            return pattern.test(str);  // returns a boolean
                        },
                        isNotEmpty: function (str) {
                            var pattern = /\S+/;
                            return pattern.test(str);  // returns a boolean
                        }
                    };

                    /* check if validator has been created */
                    if (emailmylistbsv !== null) {
                        /*if created reset the form data */
                        $('#email-mylist-form').data('bootstrapValidator', null);
                    }

                    emailmylistbsv = $('#email-mylist-form').bootstrapValidator({
                        feedbackIcons: {
                            valid: 'glyphicon glyphicon-ok',
                            invalid: 'glyphicon glyphicon-remove',
                            validating: 'glyphicon glyphicon-refresh'
                        },
                        fields: {
                            email: {
                                validators: {
                                    notEmpty: {
                                        message: 'An email address needs to be entered.'
                                    },

                                    callback: {
                                        callback: function (value, validator, $field) {
                                            // Count the number of digits in your password
                                            var isEmail = validation.isEmailAddress(value);
                                            if (!isEmail) {
                                                return {
                                                    valid: false,
                                                    message: "email address is not in valid format."
                                                }
                                            }
                                            return true;
                                        }
                                    }
                                }
                            }
                        },
                        submitHandler: function (validator, form, submitButton) {
                            submitform();
                        },
                        destroy: function () {  }
                    });
                };

                var resetvalidator = function () {
                    $('#email-mylist-form').bootstrapValidator('resetForm', true);
                    $('#email').val('');
                };

                var submitform = function () {
                    var new_obj = {};
                    var emailData = { email: '' };
                    $.each($('#email-mylist-form').serializeArray(), function (i, obj) {
                        new_obj[obj.name] = obj.value;
                    });
                    emailData.email = new_obj["email"];
                    new_obj = null;
                    _commonlibraryservices.show();
                    accountlibraryservices.emailMyList(emailData.email, function (isOK, msg) {
                        if (isOK) {
                            $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.email).hide();
                            $('#' + _commonlibraryservices.accountTemplate().contentIDs.mylist.main).show();
                            resetvalidator();
                            _commonlibraryservices.overlay(100, 'My List has been sent to the following ' + emailData.email + ' address.');
                        } else {
                            _commonlibraryservices.overlay(100, 'Unable to send the email at the moment.<br/>');
                        }
                        _commonlibraryservices.hide();
                    });
                };

                bindvalidataor();
            };

            validateMyListForm();
        };

        


        var AncestryLinkClick = function() {

            var redirectLink = function (success) {

                if (success) {
                    _commonlibraryservices.show();
                    securitylibraryservices.redirectAncestry(function(data,success) {

                        if (!success) {
                            _commonlibraryservices.overlay(100, 'Unable to redirect to Ancestry Website at the moment.<br/>');
                        } else {
                            securitylibraryservices.logout(function(isTrue) { 
                                 window.location.href = data;
                            } );
                            _commonlibraryservices.hide();

                 
                        }

                    });
                }
                else {
                    accountlibraryservices.reset();
                }
            };

              $('#ancestry-link').on('click', function (e) {

                securitylibraryservices.authenticated(redirectLink);
                e.stopPropagation();
                e.preventDefault();
                
            });
        };


        RenewButtonClicks();
        HoldButtonClicks();
        MyListButtonClicks();
        ChangePinClicks();
        EmailMyListClicks();
        AncestryLinkClick();
        
    };

    var accountinfo = function (loggedin) {

        if (loggedin) {
            securitylibraryservices.clearloginTemplate();
            securitylibraryservices.patronInfo();
            securitylibraryservices.yourStatus(true);
            //-1 indicates no panels will open by default
            accountlibraryservices.accountInfo(-1, bindAccountEvents);
        }
        else {
            securitylibraryservices.goToLoginPage(login);  
            securitylibraryservices.yourStatus(false);
        }
    };

    accountcallbacks.init= function (pickuplocationcallbacks, commonlibraryservices,accordionservices, togglelibraryservices) {
        _pickuplocationcallbacks = pickuplocationcallbacks;
        _commonlibraryservices = commonlibraryservices;
        _accordionservices = accordionservices;
        _togglelibraryservices = togglelibraryservices;
    };

    accountcallbacks.accountInfo = function (isloggedIn) {
        accountinfo(isloggedIn);
    };

})(window.accountcallbacks = window.accountcallbacks || {}, jQuery);

