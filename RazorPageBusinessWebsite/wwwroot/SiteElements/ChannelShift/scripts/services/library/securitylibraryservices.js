"use strict";
(function (securitylibraryservices, $, undefined) {

    var token = "";
    var currentUserId = "";
    var currentdisplayname = "";
    var timeout = 200;

    var _commonlibraryservices = null;
    var _loginTemplate = null;
    var _sharedTemplate = null;
    var _typeofclick = null;
    var _libraryUrls = null;
    var _resetToken
    var _qs = null;

    var libraryURLs = function () {
        $.ajax({
            type: 'GET',
            url: window.commonservices.Config().libraryUrl + '/security/libraryUrls',
        })
         .then(function (data) {
             _libraryUrls = data;
         }).fail(function (err) { });
    };

    var gotoLoginPage = function (callback, typeofclick) {

        _typeofclick = typeofclick;

        var validatelogin = function (callback) {
            var loginbsv = null;

            var submitform = function (callback) {
                var new_obj = {};

                var login = { username: '', pswd: '' };
                $.each($('#loginlibrary-form').serializeArray(), function (i, obj) {
                    new_obj[obj.name] = obj.value;
                });
                login.username = new_obj["loginUsername"];
                login.pswd = new_obj["loginPassword"];
                new_obj = null;
                securitylibraryservices.login(login.username, login.pswd, callback);
            };

            var bindvalidataor = function (callback) {

                if (loginbsv !== null) {
                    /*if created reset the form data */
                    $('#loginlibrary-form').data('bootstrapValidator', null);
                }

                loginbsv = $('#loginlibrary-form').bootstrapValidator({

                    feedbackIcons: {
                        valid: 'glyphicon glyphicon-ok',
                        invalid: 'glyphicon glyphicon-remove',
                        validating: 'glyphicon glyphicon-refresh'
                    },
                    fields: {
                        loginUsername: {
                            validators: {
                                notEmpty: {
                                    message: 'The library card number needs to be entered.'
                                }
                            }
                        },
                        loginPassword: {
                            validators: {
                                notEmpty: {
                                    message: 'The password pin needs to be entered.'
                                }
                            }
                        },
                    },
                    submitHandler: function (validator, form, submitButton) {
                        submitform(callback);
                    },
                    destroy: function () { }
                });

            };

            bindvalidataor(callback);
        };

        var bindloginclick = function (callback) {

            $('#library-login-btn').on('click', function (e) {
                e.preventDefault();
                securitylibraryservices.login($('#loginUsername').val(), $('#loginPassword').val(), callback);
            });
        };

        var resetPinLink = function () {

            var validateForm = function () {
                var resetpinbsv = null;

                var submitform = function () {
                    var new_obj = {};

                    var resetdata = { userId: '' };

                    $.each($('#reset-pin-form').serializeArray(), function (i, obj) {
                        new_obj[obj.name] = obj.value;
                    });
                    resetdata.userId = new_obj["userId"];
                    new_obj = null;

                    resetpin(resetdata.userId, function (isOK) {
                        if (isOK) {
                            commonlibraryservices.overlay(100, 'An email has been sent to reset your password.');

                        } else {
                            commonlibraryservices.overlay(100, 'Unable to reset your password pin.<br/>');
                        }
                        commonlibraryservices.hide();
                    });
                };

                var bindvalidataor = function () {

                    var validation = {
                        isNotEmpty: function (str) {
                            var pattern = /\S+/;
                            return pattern.test(str);
                        },
                        isNumber: function (str) {
                            var pattern = /^\d+$/;
                            return pattern.test(str);
                        }
                    };

                    /* check if validator has been created */
                    if (resetpinbsv !== null) {
                        $('#reset-pin-form').data('bootstrapValidator', null);
                    }

                    resetpinbsv = $('#reset-pin-form').bootstrapValidator({
                        feedbackIcons: {
                            valid: 'glyphicon glyphicon-ok',
                            invalid: 'glyphicon glyphicon-remove',
                            validating: 'glyphicon glyphicon-refresh'
                        },
                        fields: {
                            userId: {
                                validators: {
                                    notEmpty: {
                                        message: 'The library barcode user Id needs to be entered.'
                                    },
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            // Count the number of digits in your password
                                            var isNumber = validation.isNumber(value);
                                            if (!isNumber) {
                                                return {
                                                    valid: false,
                                                    message: "The library barcode user Id must contains all digits only."
                                                }
                                            }
                                            if (value.length < 14) {
                                                return {
                                                    valid: false,
                                                    message: "The library bar code user Id must be at least 14 characters long."
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
                        destroy: function () { }
                    });
                };

                bindvalidataor();
            };

            $("#reset-pin").bind('click', function (e) {
                commonlibraryservices.loginTemplate().hideLogin();
                commonlibraryservices.loginTemplate().showResetPin();
                validateForm();
                e.preventDefault();
            });
        };

        var resetPinConfirm = function () {
            var validateForm = function () {
                var bsv = null;

                var submitform = function () {
                    var new_obj = {};

                    var resetdata = { password: '' };

                    $.each($('#reset-confirm-form').serializeArray(), function (i, obj) {
                        new_obj[obj.name] = obj.value;
                    });
                    resetdata.password = new_obj["newPassword"];
                    new_obj = null;

                    accountlibraryservices.ChangePin('', resetdata.password, _resetToken, function (isOK, msg) {
                        if (isOK) {
                            commonlibraryservices.overlay(100, 'Your password pin have been updated.');
                        } else {
                            commonlibraryservices.overlay(100, 'Unable to change your password pin.<br/>');
                        }
                        commonlibraryservices.hide();
                    });
                };

                var bindvalidataor = function () {

                    var validation = {
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
                    if (bsv !== null) {
                        $('#reset-confirm-form').data('bootstrapValidator', null);
                    }

                    bsv = $('#reset-confirm-form').bootstrapValidator({
                        feedbackIcons: {
                            valid: 'glyphicon glyphicon-ok',
                            invalid: 'glyphicon glyphicon-remove',
                            validating: 'glyphicon glyphicon-refresh'
                        },
                        fields: {
                            newPassword: {
                                validators: {
                                    notEmpty: {
                                        message: 'The new password needs to be entered.'
                                    },
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            var isNumber = validation.isNumber(value);
                                            if (value.length !== 4) {
                                                return {
                                                    valid: false,
                                                    message: "The pin must be only 4 characters long."
                                                }
                                            }
                                            if (!isNumber) {
                                                return {
                                                    valid: false,
                                                    message: "The new pin must contains digits only."
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
                        destroy: function () { }

                    });

                };

                bindvalidataor();
            };
            validateForm();
        };

        _loginTemplate.populateLogin(_libraryUrls);
        validatelogin(callback);
        resetPinLink();

        _qs = commonlibraryservices.getQueryString("resettoken");
        if (_qs != null) {

            resetpinvalidate(_qs, function (isOK) {
                if (isOK) {
                    commonlibraryservices.showHide(commonlibraryservices.searchView().FORGOTTEN_PASSWORD);
                    resetPinConfirm();
                }
                else {
                    commonlibraryservices.overlay(100, 'Sorry this is not a valid token or it has now expired.<br/> Please use the forgotten password link to issue a new token.');
                }
                commonlibraryservices.hide();
            });
        }
        else {
            commonlibraryservices.hide();
        }
    };

    var login = function (username, password, callback) {

        var runLogin = function () {

            $.post(window.commonservices.Config().libraryUrl + '/security/login',
            {
                Username: username, Password: password, Token: ''
            })
             .then(function (data) {

                 if (data === null) {
                     return callback(false, _typeofclick);
                 }
                 token = data.sessionTokenField;
                 currentUserId = data.userIDField;
                 currentdisplayname = currentUserId

                 window.cookieservices.CreateCookie("libraryToken", token, 0.05);
                 window.cookieservices.CreateCookie("libraryUserId", currentUserId, 0.05);
                 window.cookieservices.EraseCookie("contentview");
                 window.cookieservices.CreateCookie("contentview", "", 0.05);

                 patronInfo(currentUserId, token);
                 return (callback != null) ? callback(true, _typeofclick) : true;
             })
             .fail(function (err) {
                 _commonlibraryservices.trace('Promise Error:securitylibraryservices');
                 _commonlibraryservices.trace(err);
                 _loginTemplate.populateLoginLink(null, _libraryUrls);
                 return callback(false, _typeofclick);
             });
        };

        _commonlibraryservices.show();
        setTimeout(function () { runLogin(); }, timeout);

    };

    var resetpin = function (username, callback) {

        var runResetpin = function () {

            $.post(window.commonservices.Config().libraryUrl + '/security/resetpin',
            {
                Username: username, Password: '', Token: ''
            })
             .then(function (data) {
                 callback(true);
             })
             .fail(function (err) {
                 callback(false);
             });
        };
        _commonlibraryservices.show();
        setTimeout(function () { runResetpin(); }, timeout);

    };

    var resetpinvalidate = function (token, callback) {
        $.ajax({
            url: window.commonservices.Config().libraryUrl + '/security/validresettoken/' + token,
            type: 'GET'
        })
        .then(function (data) {

            _resetToken = data.sessionTokenField;
            callback(true);
        })
        .fail(function (err) {
            callback(false);
        });
    };

    var authenticated = function (callback) {

        var runAuthentication = function () {

            token = window.cookieservices.ReadCookie("libraryToken");
            currentUserId = window.cookieservices.ReadCookie("libraryUserId");
            if (token === null) {
                currentUserId = token = "uknown";
            }
            $.ajax({
                url: window.commonservices.Config().libraryUrl + '/security/authenticated/' + currentUserId + '/' + token,
            })
             .done(function (data) {
                 if (data === 'OK') {

                     return callback(true);
                 } else {
                     _loginTemplate.populateLoginLink(null, _libraryUrls);
                     return callback(false)
                 }
             })
             .fail(function (err) {
                 _commonlibraryservices.trace('Promise Error: securitylibraryservices');
                 _loginTemplate.populateLoginLink(null, _libraryUrls);
                 return callback(false);
                 _commonlibraryservices.trace(err);
             });

        };
        setTimeout(function () { runAuthentication() }, timeout);
    };

    var logout = function (callback) {

        $.get(window.commonservices.Config().libraryUrl + '/security/logout/' + token,
         function (data, status) {

             token = ""; currentUserId = "";
             _loginTemplate.populateLoginLink(null, _libraryUrls);
             _sharedTemplate.clearYourStatus();
             callback(true);
         }
      ).fail(function () {
          token = ""; currentUserId = "";
          _loginTemplate.populateLoginLink(null, _libraryUrls);
          callback(false);
      });

        cookieservices.EraseCookie('libraryToken');
        cookieservices.EraseCookie('libraryUserId');
        cookieservices.EraseCookie('contentview');
    };

    var patronInfo = function (userId, token) {

        var url = window.commonservices.Config().libraryUrl + '/patron/patroninfo/{0}/{1}';

        url = url.replace('{0}', userId);
        url = url.replace('{1}', token);

        $.ajax({
            url: url,
            type: 'GET'
        })
          .then(function (data) {

              data = JSON.parse(data);
              if (data != null) {
                  currentdisplayname = (data.patronInfo.displayName);
                  _loginTemplate.populateLoginLink(currentdisplayname, _libraryUrls);
                  yourstatus(token);
              }

          })
          .fail(function (err) {
          });
    };

    var yourstatus = function (token) {
        var url = window.commonservices.Config().libraryUrl + '/patron/statusSummary/{0}';
        url = url.replace('{0}', token);

        $.ajax({
            url: url,
            type: 'GET'
        })
          .then(function (data) {

              if (data != null) {
                  _sharedTemplate.populateYourStatus(data);
              } else {
                  _sharedTemplate.clearYourStatus();
              }
          })
          .fail(function (err) {
              _sharedTemplate.clearYourStatus();
          });
      };

    var redirectToAncestry = function(callback) {

        $.get(window.commonservices.Config().libraryUrl + '/security/ancestrylink/' + currentUserId + '/'+ token,
                  function (data, status) {
                      callback(data, true);
                  }).fail(function ()
                  {
                      callback("",false);
                  });
    };

    securitylibraryservices.init = function (services) {

        _commonlibraryservices = services;
        _loginTemplate = _commonlibraryservices.loginTemplate();
        _sharedTemplate = _commonlibraryservices.sharedTemplate();
        _commonlibraryservices.trace('call security library services init ');
        libraryURLs();
    };

    securitylibraryservices.login = function (usr, pswd, callback) {
        return login(usr, pswd, callback);
    };

    securitylibraryservices.resetpin = function (userId, callback) {
        return resetpin(userId, callback);
    };

    securitylibraryservices.logout = function (callback) {
        logout(callback);
    };

    securitylibraryservices.authenticated = function (callback) {
        return authenticated(callback);
    };

    securitylibraryservices.patronInfo = function () {
        patronInfo(currentUserId, token);
    };

    securitylibraryservices.yourStatus = function (isLoggedIn) {
        if (isLoggedIn) {
            yourstatus(token);
        } else {
            _sharedTemplate.clearYourStatus();
        }
    };

    securitylibraryservices.clearloginTemplate = function () {
        return _loginTemplate.clearLogin();
    };

    securitylibraryservices.goToLoginPage = function (callback, typeofclick) {
        return gotoLoginPage(callback, typeofclick);
    };

    securitylibraryservices.librarycodeInformation = function () {
        commonlibraryservices.overlay(100, 'Your library number can be found on the back of your library card.');
    };

    securitylibraryservices.redirectAncestry = function (callback) {
         return redirectToAncestry(callback);
    };


})(window.securitylibraryservices = window.securitylibraryservices || {}, jQuery);


