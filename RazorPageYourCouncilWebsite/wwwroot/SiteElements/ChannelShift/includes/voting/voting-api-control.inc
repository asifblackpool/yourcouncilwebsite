<div id="voting-loading-indicator" style="position:relative; left: 40%; top: 50%; display:none; z-index:10001">
    <strong><img src="/SiteElements/ChannelShift/Content/images/gif.gif" />  ... Loading</strong><br/>
</div>
<div id="voting-container" class="clearfix">
<div class="input-group" id="postcode-search" style="max-width:600px; margin:auto;">
    <input id="find-voting-input" class="form-control" type="text" maxlength="8" placeholder="FY1 1NA" size="18" name="b"> 
    <span class="input-group-btn">
        <button id="find-voting-button" class="btn btn-default" type="button">GO</button>
    </span>
</div>
<div class="input-group" style="max-width:600px; margin:auto;">
    <span id="find-voting_error" class="error"></span><br />
</div>
<div class="polling-placeholder"></div>
</div>

<style type="text/css">
            #find-voting-input {
            border: solid 2px #830065;
            font-size:24px;
        }
        span.input-group-btn {
            border: solid 0.5px #830065;
            background-color: #830065;
            left: 0px;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
        #find-voting-button {
            color: #fff;
            background-color: #830065;
            border-width: 0px;
        }
</style>

 <script type="text/javascript">
        $(document).ready(function () {

            votingShowHide = function (show) {

                if (show) {
                    $('#voting-loading-indicator').hide();
                    $('#voting-container').show();
                } else {
                    $('#voting-loading-indicator').show();
                    $('#voting-container').hide();
                }

            };

            var getVotingApiData = function () {

                var myAreaValue = $("#find-voting-input").val().trim();
                var errorMessage = window.utilities.validateUKPostCode(myAreaValue);
                $("#find-voting_error").html(errorMessage);
                if (errorMessage === "") {
                    $.ajax({
                        url: window.commonservices.Config().pollingStationUrl + 'ValidatePostCode?postcode=' + myAreaValue,
                        type: 'GET',
                        success: function (data) {
                            if (data.indexOf("OK") > -1) {
                                window.votingservices.init(myAreaValue, function (isOK) {
                                    if (isOK) {
                                        votingShowHide(true);
                                    }
                                });
                          
                            }
                            else {
                                $("#find-services_error").html('This post code is not valid for blackpool council');
                            }
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        $("#find-services_error").html('Oops an error occured validating the post code');
                        votingShowHide(true);
                    });
                }
                else {
                    votingShowHide(true);
                }
            };

            var myVotingClick = function () {
                $('#find-voting-button').click(function (e) {
                    votingShowHide(false);
                    setTimeout(function () { getVotingApiData(); }, 600);
                    e.preventDefault();
                });
            };
            myVotingClick();
        });

    </script>
    
<!-- handlebar templates. -->
<script id="polling-template" type="text/x-handlebars-template">
        <div class="row">
            <div class="md-12 text-center polling-title-placeholder"><h3><strong>Polling station</strong></h3></div>
        </div>
        {{#if this.apiproperties}}
        <div class="row" style="margin-bottom:15px;">
            <div class="selectbox-container-streetname" style="width:100%; text-align:center; margin:auto">
                <p><strong>To find Polling station please select an address below.</strong><br /></p>
                <select class="selectpicker" id="streetDropDownList" name="streetDropDownList" style="display:block !important; text-align:center; margin:auto;">
                    <option value="0" >-- Select property --</option>
                    {{#each apiproperties}}
                    <option value="{{ PollingPlaceId}}">{{ PropertyNumber}} {{ Streetname }}</option>
                    {{/each }}
                </select>
             </div>
        </div>
       
         <!--load polling address template in div-->
        <div class="row polling-station-address"></div>

        {{else}}
        <strong>Polling station not found for the post code entered.</strong>
        {{/if}}
 </script>

<script id="polling-address-template" type="text/x-handlebars-template">
    {{#if this.apipolling.length}}
        <strong>Your polling station is located at:</strong>
        <table class="table responsive">
            {{#foreach this.apipolling}}
            <tr>
                <td><strong>Name</strong></td>
                <td>{{ name }}</td>
            </tr>
            <tr>
                <td><strong>Address</strong></td>
                <td>{{ address }}</td>
            </tr>
            {{/foreach}}
        </table>
        <p>
            You do not need to have your polling card to vote in an election.<br />
            You can find more information on voting including postal and proxy votes on the <strong><a href="/Your-Council/Voting-and-elections/Voting-and-elections.aspx">voting and elections</a></strong> section of our website
        </p>
        {{/if}}
</script>
<script type="text/javascript" src="/SiteElements/ChannelShift/Scripts/services/voting/votingservices.js"></script>