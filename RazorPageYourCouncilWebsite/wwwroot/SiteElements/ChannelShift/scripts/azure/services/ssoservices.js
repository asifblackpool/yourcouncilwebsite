"use strict";
(function (ssoservices, $, undefined) {

    var _apiconfig = null;
    var _token = null;

    var endpoint = function (email) {
        var endpoint = _apiconfig.baseSSOEndpoint + "azureauthenticate/{0}/";
        endpoint = endpoint.replace("{0}", email);
        endpoint = endpoint.replace("@", "%40");
        return endpoint;
    };

    var GetSSOdetails = function (url) {

        var populateforms = function(user) {

            //SSO form 
            document.getElementById('email').value = user.Email
            document.getElementById('name').value = user.Name;
            document.getElementById('lastname').value = user.Surname;
            document.getElementById("registered").checked = user.IsRegistered;

            //library from
            document.getElementById('accountnumber').value = user.LibraryData.Account;
            document.getElementById('accountpin').value = user.LibraryData.Pin;

            if (user.SSOUserType === _apiconfig.ssoEnum.UserType.Exists) {
                logMessage('SSO User Exists ..');
                document.getElementById('sso-register-button').innerHTML = "Update"

                if (user.libraryAccountData !== null) {
                    document.getElementById('sso-library-button').innerHTML = "Update"
                }
            }
        };

        const headers = new Headers();
        const bearer = `Bearer ${_token}`;

        headers.append("Authorization", bearer);

        const options = {  method: "GET", headers: headers  };

        logMessage('Get SSO Details...');

        fetch(url, options)
            .then(response => response.json())
            .then(response => {

                if (response) {
                    var ssoUser = response.User;
                    var libraryUser = ssoUser.LibraryData
                    var accounts = response.GetAllAccounts;


                    //find library account 
                    var libraryAccountData = accounts.filter(acc => {
                        return acc.TypeOfAccount === _apiconfig.ssoEnum.Account.Library
                    }).
                    map(acc => acc.Data).pop();


                    var sessionTokenField = libraryAccountData.sessionTokenField;
                    var userIdField = libraryAccountData.userIDField;
                    populateforms(ssoUser);

                }

                return response;
            }).catch(error => {
                console.error(error);
                return null;
            });
    };


    var loadSSOForm = function () {
        var validateSSOForm = function () {
            var ssobsv = null;

            var add_update_details = function (dataToSend) {

                var url = _apiconfig.baseSSOEndpoint + "addupdateusercredentials"
                $.ajax({
                    type: "POST",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + _token
                    },
                    data: JSON.stringify(dataToSend),
                    contentType: "application/json",
                    success: function (response) {
                        console.log("POST request successful");
                        console.log("Response: " + response.Message);
                    },
                    error: function (error) {
                        console.error("POST request failed");
                        console.error("Error: " + error.responseText);
                    }
                });
            };

            var submitform = function () {
                var new_obj = {};

                var ssoData = { name: '', surname: '', email: '', isregistered: '' };
                var checkbox = $('[name="registered"]');

                $.each($('#sso-account-form').serializeArray(), function (i, obj) {
                    new_obj[obj.name] = obj.value;
                });
                ssoData.name = new_obj["name"];
                ssoData.surname = new_obj["lastname"];
                ssoData.email = new_obj["email"];
                ssoData.isregistered = checkbox.is(':checked')
                new_obj = null;
                console.log('sso account form submitted');
                console.log(ssoData);
                add_update_details(ssoData);
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
                    }
                };

                /* check if validator has been created */
                if (ssobsv !== null) {
                    /*if created reset the form data */
                    $('#sso-account-form').data('bootstrapValidator', null);
                }


                ssobsv = $('#sso-account-form').bootstrapValidator({

                    feedbackIcons: {
                        valid: 'glyphicon glyphicon-ok',
                        invalid: 'glyphicon glyphicon-remove',
                        validating: 'glyphicon glyphicon-refresh'
                    },
                    fields: {

                        name: {
                            validators: {
                                notEmpty: {
                                    message: 'The first name needs to be entered.'
                                }
                            }
                        },
                        lastname: {
                            validators: {
                                notEmpty: {
                                    message: 'The last name needs to be entered.'
                                }
                            }
                        },
                        email: {
                            validators: {
                                notEmpty: {
                                    message: 'The email needs to be entered.'
                                },
                                callback: {
                                    callback: function (value, validator, $field) {
                                        // Count the number of digits in your password
                                        var isEmail = validation.isEmailAddress(value);

                                        // Check if email is valid
                                        if (!isEmail) {
                                            return {
                                                valid: false,
                                                message: "This is not in the correct eamil format."
                                            }
                                        }
                                        return true;
                                    }
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
        validateSSOForm();
  
    };

    var loadLibrarySSOForm = function () {

        var validateLibrarySSOForm = function () {
            var ssobsv = null;

            var submitform = function () {
                var new_obj = {};

                var ssoData = { account: '', pin: '' };

                $.each($('#sso-library-form').serializeArray(), function (i, obj) {
                    new_obj[obj.name] = obj.value;
                });
                ssoData.account = new_obj["accountnumber"];
                ssoData.pin = new_obj["accountpin"];

                new_obj = null;
                console.log('sso library form submitted');
                console.log(ssoData);
            };

            var bindvalidataor = function () {

                var validation = {
                    isNumber: function (str) {
                        var pattern = /^\d+$/;
                        return pattern.test(str);  // returns a boolean
                    },
                };

                /* check if validator has been created */
                if (ssobsv !== null) {
                    /*if created reset the form data */
                    $('#sso-library-form').data('bootstrapValidator', null);
                }


                ssobsv = $('#sso-library-form').bootstrapValidator({

                    feedbackIcons: {
                        valid: 'glyphicon glyphicon-ok',
                        invalid: 'glyphicon glyphicon-remove',
                        validating: 'glyphicon glyphicon-refresh'
                    },
                    fields: {

                        accountnumber: {
                            validators: {
                                notEmpty: {
                                    message: 'The account number needs to be entered.'
                                }
                            }
                        },
                        accountpin: {
                            validators: {
                                notEmpty: {
                                    message: 'The account pin number needs to be entered.'
                                },
                                callback: {
                                    callback: function (value, validator, $field) {
                                        var isNumber = validation.isNumber(value);
                                        console.log('digicount');
                                        if (value.length !== 4) {
                                            return {
                                                valid: false,
                                                message: "The pin must be at only 4 characters long."
                                            }
                                        }
                                        if (!isNumber) {
                                            return {
                                                valid: false,
                                                message: "The new pin must contains all digits only."
                                            }
                                        }

                                        return true;
                                    }
                                }
                            },

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

        validateLibrarySSOForm();

    };


    ssoservices.init = function ( apiconfig, token) {

        _apiconfig      = apiconfig;
        _token = token;

        loadLibrarySSOForm();
        loadSSOForm();
    };

    ssoservices.getuserdetails= function(email) {

        return GetSSOdetails(endpoint(email));

    }


})(window.ssoservices = window.ssoservices || {}, jQuery);
