<!-- your area - checkbox builder -->
<script id="locationmaps-treeview-template" type="text/x-handlebars-template">
    <ul class="tree">
		{{#if apidata.length}} {{#each apidata}} {{#if this.HasChildren }}
		<li>{{> fixednode-partial this}}<ul>
				{{else }} {{> checknode-partial this}} {{#if this.IsLast }} {{#times this.Depth}}</ul>
		</li>{{/times}} {{/if}} {{/if}} {{/each}} {{/if}}
	</ul>
</script>
<script id="locationmaps-treeview-template" type="text/x-handlebars-template">
    <ul class="tree">
		{{#if apidata.length}} {{#each apidata}} {{#if this.HasChildren }}
		<li>
			{{> fixednode-partial this}}<ul>
				{{else }} {{> checknode-partial this}} {{#if this.IsLast }} {{#times this.Depth}}
			</ul>
		</li>{{/times}} {{/if}} {{/if}} {{/each}} {{/if}}
	</ul>
</script>

<script id="fixednode-partial" type="text/x-handlebars-template">
    <a href="#" class="pseudo-link">{{ this.Name }}</a>
</script>

<script id="checknode-partial" type="text/x-handlebars-template">
    <li class='fixed-list'>
		<div class="checkbox location-type">
			<label><input id="location-type-{{ this.Id}}" value="{{ this.Id}}" name="yourAreaCheckbox" class="checkbox-places" type="checkbox" title="{{this.Name }}">{{ this.Name}}</label>
        </div>
    </li>
</script>

<!-- your area details templates -->
<script id="locationmaps-details-template" type="text/x-handlebars-template">
    {{#if apidata.length}}
    <div id="{{ Id }}" class="container-fluid" >
        <div class="row map-title">
            <h3 style="margin:5px 0px 5px 0px;"><strong>{{ Title }}</strong></h3>
        </div>
        <div class="row map-container clearfix" style="clear:both">
            {{#each apidata}}
            <div class="col-xs-6 col-sm-4 col-md-3 map-info clearfix" >
                <div class="media">
                    <span class="media-left">
                        <img src="{{ this.Url}}" />
                    </span>
                    <div class="media-body">
                        <strong>{{ this.Name}}</strong>
                        <span class="map-km">{{ this.Distance }}</span><br />
                        {{#if this.Website.length}}
                            <a class="your-map-link" href="{{this.Website }}">{{ this.Address}}</a>
                        {{else }}
                        {{ this.Address }}
                        {{/if}}
                    </div>
                </div>
            </div>
            {{/each}}
        </div>
    </div>
{{/if}}
</script>

<!-- your councillor templates -->
<script id="councillor-template" type="text/x-handlebars-template">
    <h2><strong>Your Council</strong></h2>
 
    {{#if apidata.length}}

    <h4>Your council ward area is <strong>{{ wardTitle }}</strong></h4>
    <span>Your councillors are </span>
        {{#each apidata}}
        <div class="media">
            <span class="media-left">
                <iframe id="councillor_{{math index}}" name="councillor_{{math index }}" frameborder="0" scrolling="no" width="90" height="136" src="{{ photosmallurl }}"></iframe>
            </span>
            <div class="media-body">
                <strong>{{ fullusername }}</strong><br />
                <span>{{ politicalpartytitle }}</span><br /><br />
                <dl class="dl-horizontal">
                    <dt><strong>Surgery:&nbsp;</strong></dt><dd>{{ surgerydetails.line1 }}</dd>
                     {{#checkIf this.workaddress.phone.length '>' 0 '||'  this.homeaddress.phone.length '>' 0 }}
                        <dt><strong>Tel:</strong></dt>
                    {{/checkIf}}
                    <dd>
                        {{#if this.workaddress.phone.length}}
                            {{ workaddress.phone }}&nbsp;&nbsp;
                        {{/if}}
                        {{#if this.homeaddress.phone.length}}
                            {{ homeaddress.phone }}
                        {{/if}}
                    </dd>
                     {{#checkIf this.workaddress.mobile.length '>' 0 '||'  this.homeaddress.mobile.length '>' 0 }}
                    <dt><strong>Mobile</strong></dt>
                    {{/checkIf}}
                    <dd>
                        {{#if this.workaddress.mobile.length}}
                        {{ workaddress.mobile }}&nbsp;&nbsp;
                        {{/if}}
                        {{#if this.homeaddress.mobile.length}}
                        {{ homeaddress.mobile }}
                        {{/if}}
                    </dd>
                    <dt><strong>Email:&nbsp;</strong></dt>
                    <dd><a href="{{mailto workaddress.email}}">{{ workaddress.email }}</a></dd>
                </dl>
            </div>
        </div>
        {{/each}}
    {{else}}
    <strong>No councillor information can be found for the post code entered</strong>
    {{/if}}
</script>

<!-- polling station templates-->
<script id="polling-template" type="text/x-handlebars-template">

    <h2><strong>Polling station</strong></h2>
    {{#if this.apiproperties}}
    <div class="row" style="margin-bottom:15px;">
        <div class="selectbox-container-streetname" style="width:100%; text-align:center; margin:auto">
            <p><strong>To find Polling station please select an address below.</strong><br /></p>
            <select class="selectpicker" id="streetDropDownList" name="streetDropDownList" style="display:block !important; text-align:center; margin:auto;">
                <option value="0">-- Select property --</option>
                {{#each apiproperties}}
                <option value="{{ PollingPlaceId}}">{{ PropertyNumber}} {{ Streetname }}</option>
                {{/each }}
            </select>
            <style type="text/css">select.selectpicker{display:block!important; text-align:center; margin:auto;}</style>
        </div>
    </div>
    <!--load polling address template in div-->
    <div class="row polling-station-address"></div>

    {{else}}
    <strong>{{ msg }}</strong>
    {{/if}}
</script>

<script id="polling-address-template" type="text/x-handlebars-template">
    {{#if this.apipolling.length}}
    {{#each apipolling}}
    <h4>Your nearest polling station is located at <strong>{{ this.name }}</strong></h4>
    <dl class="dl-horizontal">
        <dt><strong>Address:&nbsp;</strong></dt><dd>{{ this.address }}</dd>
    </dl>
    {{/each }}
    <p>
        You do not need to have your polling card to vote in an election.<br />
        You can find more information on voting including postal and proxy votes on the <a href="/Your-Council/Voting-and-elections/Voting-and-elections.aspx">voting and elections</a> section of our website
    </p>
    {{/if}}
</script>

<!-- bin collection templates-->
<script id="bin-template" type="text/x-handlebars-template">
    <h2><strong>Your services</strong></h2>
    {{#each apidata}}
        {{#compareshort WasteServiceName "eq" "Green bin"}}
        <br style="display:none;"/>
        <p style="display:none;">
            <strong>Green waste collections will be subscription only from 6 June 2016. <a href="/residents/waste-and-recycling/bin-collections/green-and-go.aspx">Sign up Now</a></strong>
        </p>
        {{else }}
        <span><strong>{{ WasteServiceName }}</strong></span><br />
        <span> The next collection day is on {{ CollectionDay }} {{ NextCollectionDate }}</span><br/>
        
        {{/compareshort}}
    {{/each }}

    {{#greaterthanzero count}}
        <h4><strong>When to present your&nbsp;waste for collection</strong></h4>
        <ul>
            <li>Please ensure your Wheeled bin or red sacks are presented by <strong>7.30am</strong> on your collection day</li>
            <li>Please label your bins with your address</li>
        </ul>
    {{else}}
        <strong>Collection times cannot be found for the post code entered</strong>
    {{/greaterthanzero}}
</script>

<!-- sign in form templates-->
<script id="sign-in-form-template" type="text/x-handlebars-template">
    <form name="signup" id="signup" action="http://blackpoolcouncil.org/signup.ashx" method="post" onsubmit="return true;" style="display:none;">
        <p></p>
        <input type="hidden" name="addressbookid" value="1095870" />
        <input type="hidden" name="userid" value="74179" />
        <input type="hidden" name="ReturnURL" value="https://www.blackpool.gov.uk/SiteElements/Forms/Your-Blackpool-registration-confirmation.aspx" />
        <!-- Email - the user's email address -->
        <table>
            <tr><td>Email</td><td><input type="text" name="Email" id="Email"></td></tr>
            <tr><td>FIRSTNAME</td><td><input class="text" type="text" name="cd_FIRSTNAME" id="cd_FIRSTNAME" /></td></tr>
            <tr><td>LASTNAME</td><td><input class="text" type="text" name="cd_LASTNAME" id="cd_LASTNAME" /></td></tr>
        </table>
    </form>
</script>