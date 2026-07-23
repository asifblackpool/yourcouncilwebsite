<!--templates. -->

<script id="councillor-template" type="text/x-handlebars-template">

    {{#if this.apidata.length}}
    <div class="row">
        <div class="md-12 text-center councillor-title-placeholder"><h3><strong>Ward </strong>{{ wardTitle }}</h3></div>
    </div>
    <div class="row">
        <div class="md-12 councillor-placeholder" style=" margin:5px;">
            <h5><strong>Councillors</strong></h5>
            {{#each apidata}}


            <div class="image-container">
                <iframe id="councillor_{{math index}}" name="councillor_{{math index }}" frameborder="0" scrolling="no" width="90" height="136" src="{{ photosmallurl }}"></iframe>
            </div>
            <div class="text-container">
                <h5><strong>{{ fullusername }}</strong><br />({{ politicalpartytitle }})</h5>
            </div>
            <table class="table responsive">
                <tr>
                    <td><strong>Surgery</strong></td>
                    <td>{{ surgerydetails.line1 }}</td>
                </tr>
                {{#if this.workaddress.phone.length}}
                <tr>
                    <td><strong>Tel</strong></td>
                    {{#if this.workaddress.phone.length}}
                    <td>{{ workaddress.phone }}</td>
                    {{else }}
                    <td>{{ homeaddress.phone }}</td>
                    {{/if}}
                </tr>
                {{/if}}
                {{#if this.workaddress.mobile.length}}
                <tr>
                    <td><strong>mobile</strong></td>
                   
                    <td>{{ workaddress.mobile }}</td>
                </tr>
                {{/if}}
                <tr>
                    <td><strong>Email</strong></td>
                    <td><a href="{{mailto workaddress.email}}">{{ workaddress.email }}</a></td>
                </tr>
            </table>
            {{/each}}
        </div>
    </div>
    {{else}}
    <strong>No councillor information can be found for the post code entered</strong>
    {{/if}}

</script>

<script id="polling-template" type="text/x-handlebars-template">
        <div class="row">
            <div class="md-12 text-center polling-title-placeholder"><h3><strong>Polling station</strong></h3></div>
        </div>
        {{#if this.apiproperties}}
        <div class="row" style="margin-bottom:15px;">
            <div class="selectbox-container-streetname" style="width:100%; text-align:center; margin:auto">
                <p><strong>To find Polling station please select an address below.</strong><br /></p>
                <select class="selectpicker" id="streetDropDownList" name="streetDropDownList" style="display:block;">
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

 <script id="bin-template" type="text/x-handlebars-template">
        {{#each apidata}}

        {{#compareshort WasteServiceName "eq" "Green bin"}}
        <p style="margin-bottom:8px;">
            <strong>Green waste collections will be subscription only from 6 June 2016. <a href="/residents/waste-and-recycling/bin-collections/green-and-go.aspx">Sign up Now</a></strong>
        </p>
        {{else }}
        <p><strong>{{ WasteServiceName }}</strong><br /> The next collection day is on {{ CollectionDay }} {{ NextCollectionDate }}</p>
        {{/compareshort}}
        {{/each }}

        {{#greaterthanzero count}}
        <h6><strong>When to present your&nbsp;waste for collection</strong></h6>
        <ul>
            <li>Please ensure your Wheeled bin or red sacks are presented by <strong>7.30am</strong> on your collection day</li>
            <li>Please label your bins with your address</li>
        </ul>
        {{else}}
        <strong>Collection times cannot be found for the post code entered</strong>
        {{/greaterthanzero}}

    </script>

<script id="park-template" type="text/x-handlebars-template">

        {{#if this.apidata.length}}
        {{#each this.apidata}}
        {{#compareshort vicinity "eq" "Blackpool"}}
        <p><strong>{{ name }}</strong><br /> The park address not found</p>
        {{else}}
        <p>
            {{#compareshort url "neq" "#"}}
            <strong><a href="{{url}}">{{ name }}</a></strong><br /> The park can be found at {{ vicinity }}
            {{else }}
            <strong>{{ name }}</strong><br /> The park can be found at {{ vicinity }}
            {{/compareshort}}

        </p>
        {{/compareshort}}


        {{/each }}
        {{else}}
        <strong>No park can be found (within the area) for the post code entered</strong>
        {{/if}}

    </script>

<script id="sign-in-form-template" type="text/x-handlebars-template">
        <form name="signup" id="signup" action="http://blackpoolcouncil.org/signup.ashx" method="post" onsubmit="return true;" style="display:none;">
            <p></p>
            <input type="hidden" name="addressbookid" value="1095870" />
            <input type="hidden" name="userid" value="74179" />
            <input type="hidden" name="ReturnURL" value="/SiteElements/Forms/Your-Blackpool-registration-confirmation.aspx" />
            <!-- Email - the user's email address -->
            <table>
                <tr><td>Email</td><td><input type="text" name="Email" id="Email"></td></tr>
                <tr><td>POSTCODE</td><td><input class="text" type="text" name="cd_POSTCODE" id="cd_POSTCODE" /></td></tr>
            </table>
            <input type="Submit" name="Submit" value="Subscribe">
        </form>
    </script>


