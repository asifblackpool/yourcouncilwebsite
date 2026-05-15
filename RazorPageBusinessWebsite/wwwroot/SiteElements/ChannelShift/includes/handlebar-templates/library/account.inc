<script id="loginlink-template" type="text/x-handlebars-template">
    <strong style='float:right; width:100%; cursor: pointer; text-align:right; height:40px;'>
        {{#if apidata.user }}
        <span class="welcome-span">Welcome {{ apidata.user }} &nbsp;|</span>&nbsp;&nbsp;<a href='#' onclick='securitylibraryservices.logout(function (isOK) { window.location.reload(); }); return false;' class="logged-in-link" style="text-decoration:none">Log out</a>
 
        {{else }}
        &nbsp;<a href='{{ apidata.urls.LoginUrl }}' class="logged-in-link" style="text-decoration:none;">Log in</a>
        {{/if}}
        &nbsp;|&nbsp;<a href='{{ apidata.urls.LoginUrl }}' class="logged-in-link" style="text-decoration:none;">My Account</a>
        &nbsp;|&nbsp;<a href='{{ apidata.urls.SearchUrl }}' class="logged-in-link" style="text-decoration:none;">Search</a>
    </strong>
</script>

<script id="login-template" type="text/x-handlebars-template">

    <div id="login-form" class="row">
		<div class="col-md-5 col-md-offset-0 col-md-push-6 col-sm-6 col-sm-offset-3 ">
			<form id="loginlibrary-form" action="javascript:return;" method="post" class="form-inline" style="margin:auto; padding:10px">
				<div class="row login-section" style="padding-top:10px;">
					<div class="col-md-12">
						<label for="from">Library card number</label>&nbsp;
						<a onclick="securitylibraryservices.librarycodeInformation(); return false;" style="cursor:pointer;"><img src="/SiteElements/ChannelShift/Content/Images/library/info-icon.png" title="information regarding card number"
							/></a><br />
						<input id="loginUsername" name="loginUsername" type="number" pattern="[0-9]*" class="form-control form-text" value="" maxlength="16"
						 style="width:100%;" />
					</div>
				</div>
				<div class="row login-section">
					<div class="col-md-12">
						<label for="to">Pin</label><span class="login-link"><strong><a id="reset-pin" href="#" >Forgot my PIN</a></strong></span><br
						/>
						<input id="loginPassword" name="loginPassword" type="password" pattern="[0-9]*" inputmode="numeric" class="form-control form-text"
						 value="" style="width:100%;" maxlength="12" />
						<!-- input id="loginPassword" name="loginPassword" inputmode="numeric" type="number" pattern="[0-9]*" class="form-control form-text" value="" style="width:100%;-webkit-text-security: disc;" maxlength="12" /-->
					</div>
				</div>
				<div class="row login-section" style="padding:0px 0px 5px 0px;">
					<div class="col-md-12" style="margin-top:10px;">
						<input id="library-login-btn" type="submit" class="btn btn-blue" value="Sign in" style="width:100%;" />
					</div>
				</div>
			</form>
			<div class="row" style="margin-bottom:20px;">
				<div class="col-md-12" style="margin-top:25px;padding-left:10px;padding-right:10px;">
					<input type="submit" class="btn btn-red" value="Create a Library Account" onclick="window.location = '{{ apidata.urls.RenewUrl }}'"
					 style="width:100%; min-height:40px;" />
				</div>
			</div>
		</div>
		<div class="col-md-6 col-md-pull-5 col-sm-12">
			Sign in to your library account to:
			<ul>
				<li>Renew your loans</li>
				<li>View the items you have on loan</li>
				<li>View your loan history</li>
				<li>See the status of any reservations you have made</li>
				<li>Change your library PIN </li>
				<li>Check any account charges and payment history</li>
				<li>Edit your profile</li>
			</ul>
			<p>
				To sign in you will need you library card number and PIN. Your card number is on the back of your card, below the bar code.<br/>				You will need to have an active email address registered on the system to confirm your new PIN. If you do not have an
				email, please contact Central Library on 01253 478080.<br/> Help with
				<a href="/Residents/Libraries-arts-and-heritage/Libraries/Logging-into-your-library-account.aspx" style="text-decoration:none;">logging in </a>
			</p>
		</div>
	</div>

	{{> resetpin-partial apidata }} {{> resetpin-confirm-partial }}
</script>

<script id="resetpin-partial" type="text/x-handlebars-template">
    <div id="resetpin-form" style="display:none;">
		<div class="row library-banner clearfix" style="background-color:#fff;">
			<div class="col-md-6 col-sm-6 col-xs-12 library-block-left">
				<h3><strong>Reset your pin</strong></h3>
			</div>
		</div>
		<div class="row zero-pad-all">
			<div class="col-md-12">
				<form id="reset-pin-form" action="javascript:return;" method="post" class="form-horizontal">
					<div class=" row form-group">
						<label class="control-label col-sm-3 col-md-3" for="userId">Bar code number:</label>
						<div class="col-sm-6 col-md-6">
							<input id="userId" name="userId" type="text" class="form-control" maxlength="16" value="" placeholder="Enter barcode number"
							/>
						</div>
					</div>
					<div class="row form-group">
						<div class="col-sm-offset-3 col-md-offset-3 col-sm-6 col-md-6">
							<div class="row library-padding">
								<div class="col-sm-6 col-xs-6 zero-pad-all"><button type="button" class="btn btn-red" onclick="window.location.href = '{{ apidata.urls.LoginUrl }}'">Back to login</button></div>
								<div class="col-sm-6 col-xs-6 zero-pad-right"><button id="reset-pin" type="submit" class="btn btn-cta">Reset Pin</button></div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</script>

<script id="resetpin-confirm-partial" type="text/x-handlebars-template">
    <div id="resetpin-confirm-form" style="display:none;">
		<div class="row library-banner clearfix" style="background-color:#fff;">
			<div class="col-md-12 col-sm-12 col-xs-12 library-block-left">
				<h3><strong>Reset your pin (enter new password)</strong></h3>
			</div>
		</div>
		<div class="row zero-pad-all">
			<div class="col-md-12">
				<form id="reset-confirm-form" action="javascript:return;" method="post" class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-2" for="newpin">New Pin:</label>
						<div class="col-sm-10">
							<input id="newPassword" name="newPassword" type="password" class="form-control" placeholder="Enter new pin" />
						</div>
					</div>
					<div class="form-group">
						<label class="control-label col-sm-2" for="confirmpin">Confirm Pin:</label>
						<div class="col-sm-10">
							<input id="confirmPassword" name="confirmPassword" type="password" class="form-control" placeholder="Confirm new pin" />
						</div>
					</div>
					<div class="form-group">
						<div class="col-sm-offset-2 col-sm-10">
							<button type="submit" class="btn btn-cta">Submit</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</script>

<script id="your-status-template" type="text/x-handlebars-template">
    {{#if apidata}}
	<div class="library-menu">
		<h4><strong>Your status</strong></h4><br /><br />
		<div class="pull-left">
			<strong>Checkouts</strong><br /> Total:&nbsp;{{ apidata.TotalCheckout }}<br />
			<strong>Holds</strong><br /> Total:&nbsp;{{ apidata.TotalHolds }}<br />
			<strong>Fines</strong><br /> Total due:&nbsp;&pound;&nbsp;{{ moneyFormat apidata.TotalFines '.' }}<br /> {{#if apidata.Overdue}}
			<span style="color:red;">You have overdue items.</span><br /> {{/if}} {{#if apidata.Pickup}}
			<span style="color:red;">You have items ready for pickup.</span> {{/if}}
		</div>
	</div>
	{{/if}}
</script>

<script id="account-template" type="text/x-handlebars-template">
    <div class="accordion library clearfix">
		<ul id="accordion-ul" class="outer-ul">
			<li class="head">
				<a id="link-1" class="link-head" href="#">
					<h2 class="clearfix"><span class="pull-left">Personal information</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
				</a>
				<div class="accordion-togglable" style="display: none;">
					<div class="row">
						<div class="col-md-12 col-sm-12 col-xs-12 library-container">
							{{> mydetails-partial apiAccountInfo.data }} {{> changepin-partial }} {{> preferences-partial }}
						</div>
					</div>
				</div>
			</li>
			<li class="head">
				<a id="link-2" class="link-head" href="#">
					<h2 class="clearfix"><span class="pull-left">Items on loan </span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
				</a>
				<div class="accordion-togglable" style="display: none;">
					<div class="row">
						<div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all library-container">
							{{> onloan-partial apiAccountInfo }}
						</div>
					</div>
				</div>
			</li>
			<li class="head">
				<a id="link-3" class="link-head" href="#">
					<h2 class="clearfix"><span class="pull-left">Items on hold</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
				</a>
				<div class="accordion-togglable" style="display: none;">
					<div class="row">
						<div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all library-container">
							{{> onhold-partial apiAccountInfo.data }}
						</div>
					</div>
				</div>
			</li>
			<li class="head">
				<a id="link-4" class="link-head" href="#">
					<h2 class="clearfix"><span class="pull-left">My lists</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
				</a>
				<div class="accordion-togglable" style="display: none;">
					<div class="row">
						<div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all library-container">
							{{> mylist-partial apiMyList }}
						</div>
					</div>
				</div>
			</li>
			<li class="head">
				<a id="link-5" class="link-head" href="#">
					<h2 class="clearfix"><span class="pull-left">Charges </span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
				</a>
				<div class="accordion-togglable" style="display: none;">
					<div class="row">
						<div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all library-container">
							{{> fines-partial apiAccountInfo.data.feeInfoField }}
						</div>
					</div>
				</div>
			</li>
            <li class="head" style="display:none;">
                <a id="link-5" class="link-head" href="#"><h2 class="clearfix"><span class="pull-left">Ancestry</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2></a>
                <div class="accordion-togglable" style="display: none;">
                    <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all library-container">
                            <br/>
                            <p>
                               Please find below your <strong>ancestry link</strong> simply double click on the button below to be redirected
                               to the ancestry website.
                            </p>
                            <div class="col-xs-6 col-md-4 col-sm-6" style="float:right;">

                                <button id="ancestry-link" class="btn btn-block btn-cta" style="margin:0px;">Go to Ancestry</button>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
		</ul>
	</div>
</script>

<!-- partials for accordion account template-->
<script id="mydetails-partial" type="text/x-handlebars-template">
    <div class="row library-padding">
		<div class="col-md-12 col-sm-12" style="background-color:#fff;">
			<address>
				<strong>{{ patronInfoField.displayNameField }}</strong><br /> {{#each patronAddressInfoField.address1InfoField }}{{ addressValueField
				}}
				<br />{{/each}}
			</address>
		</div>
	</div>
</script>

<script id="changepin-partial" type="text/x-handlebars-template">

    <h4 id="change-pin">Change pin&nbsp;<span class="arrow up"></span></h4>
	<div id="change-pin-container" class="row zero-pad-all" style="display:none;">
		<div class="col-md-12">
			<form id="changepin-form" action="javascript:return;" method="post" class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-sm-2" for="pwd">Change Pin:</label>
					<div class="col-sm-10">
						<input id="currentPassword" name="currentPassword" type="password" class="form-control" maxlength="12" placeholder="Enter current pin"
						/>
					</div>
				</div>
				<div class="form-group">
					<label class="control-label col-sm-2" for="newpin">New Pin:</label>
					<div class="col-sm-10">
						<input id="newPassword" name="newPassword" type="password" class="form-control" placeholder="Enter new pin" />
					</div>
				</div>
				<div class="form-group">
					<label class="control-label col-sm-2" for="confirmpin">Confirm Pin:</label>
					<div class="col-sm-10">
						<input id="confirmPassword" name="confirmPassword" type="password" class="form-control" placeholder="Confirm new pin" />
					</div>
				</div>
				<div class="form-group">
					<div class="col-sm-offset-2 col-sm-10">
						<label><input type="checkbox"> Remember me</label>
					</div>
				</div>
				<div class="form-group">
					<div class="col-sm-offset-2 col-sm-10">
						<button type="submit" class="btn btn-cta">Update</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</script>

<script id="preferences-partial" type="text/x-handlebars-template">

    <h4 id="preferences">Preferences&nbsp;<span class="arrow up"></span></h4>
	<div id="preferences-container" class="row zero-pad-all" style="display:none;">
		<div class="col-md-12">
			<form class="form-horizontal">
				<div class="form-group" style="display:none;">
					<label class="control-label col-md-3 col-sm-3" for="language">Default Language</label>
					<div class="col-sm-6 col-md-4">
						<select id="language" class="form-control">
                            <option value="en_GB">English (United Kingdom)</option>
                            <option value="en_US">English (United States)</option>
                        </select>
					</div>
				</div>
				<div class="form-group" style="display:none;">
					<label class="control-label col-md-3 col-sm-3" for="account">Default My Account Tab:</label>
					<div class="col-sm-6 col-md-4">
						<select id="acount" class="form-control">
                            <option value="PERSONAL">Personal</option>
                            <option value="CHECKOUTS">Checkouts</option>
                            <option value="HOLDS">Holds</option>
                            <option value="FINES">Fines</option>
                        </select>
					</div>
				</div>
				<div class="form-group" style="display:none;">
					<label class="control-label col-md-3 col-sm-3" for="pref">Preferred List:</label>
					<div class="col-sm-6 col-md-4">
						<select id="pref" class="form-control">
                            <option value="-1">No Default List</option>
                            <option value="0">Temporary List</option>
                        </select>
					</div>
				</div>
				<div class="form-group" style="display:block;">
					<label class="control-label col-md-3 col-sm-3" for="library">Preferred Pickup Library</label>
					<div class="col-sm-6 col-md-4">
						<select id="library" class="form-control">
                          <option value="ANC">Anchorsholme Library</option>       
                          <option value="CEN">Central Library</option>
                          <option value="LNG">Langdale Library</option>
                          <option value="LAY">Layton Library</option>
                          <option value="GRA">Library @thegrange</option>
                          <option value="MOR">Moor Park Library</option>
                          <option value="PAL">Palatine Library</option>
                          <option value="REV">Revoe Library</option>
                        </select>
					</div>
				</div>
			</form>
		</div>
	</div>
</script>

<script id="onloan-partial" type="text/x-handlebars-template">
    {{#if data.patronCheckoutInfoField.length }}
    <div class="row library-banner clearfix">
        <div class="col-md-6 col-sm-6 col-xs-6 library-block-left">
            <strong> Total items on loan:</strong>&nbsp;{{ data.patronCheckoutInfoField.length }}<br />
            <strong> items Overdue:</strong>&nbsp;{{ itemsOverdue data.patronCheckoutInfoField  }}<br />
        </div>
        <div class="col-md-6 col-sm-6 col-xs-6 library-block-right">
            <select class="onloan-orderby">
                <option value="-1">-- Order results by --</option>
                <option value="Title">Title</option>
                <option value="Author">Author</option>
                <option value="Publish">Publication Date</option>
            </select>
        </div>
    </div>

    {{#each data.patronCheckoutInfoField }}
    <div class="row">
        <div class="col-md-9 col-sm-9-library-block-left clearfix" style="margin-bottom:15px;">
            <div class="onloan-image-warning">
                {{#if overdueField}}
                <img alt="" src="/siteElements/channelshift/content/images/library/red.png" title="This item is overdue" />
                {{/if}}

                <input id="renew-hidden-{{titleKeyField }}" type="hidden" class="custom-control-input" value="{{itemIDField}}" />
            </div>
            <div class="onloan-image">
                {{#array_item ../checkoutItems @index}}
                {{#compareshort (getPropertyValueField bibliographicInfoField "labelField"  "Electronic access" "urlField") "eq" ""}}
                {{#if iSBNField.length}}
                <img src='{{buildLibrarySrc iSBNField.[0] }}' alt="{{ titleField   }}" class="search-image" />
                {{/if}}
                {{ else }}
                <img src='{{ getPropertyValueField bibliographicInfoField "labelField" "Electronic access" "urlField" }}' alt="{{ titleField }}" class="search-image" />
                {{/compareshort}}
                {{/array_item}}
            </div>
            <div class="onloan-text">
                <strong>{{ titleField }}</strong><br />
                <strong>{{ authorField }}, ({{ itemTypeDescriptionField }})</strong><br />
                {{#array_item ../checkoutItems @index}}
                {{ dotdotdot (getPropertyValueField bibliographicInfoField "labelField"  "Summary" "textField") 160 }}<br />
                {{/array_item}}
                {{#compare renewalsField '<' 9}}
                    {{#compare unseenRenewalsField '=='  3}}
                    <span style="color:red; font-weight:bold;">The online renewal limit has been reached: You must contact your library in order to renew this item. </span><br /><br />
                    {{ else}}
                    <br />
                    {{/compare}}
                 {{else}}
                    <span style="color:red; font-weight:bold;">The renewal limit of 9 has been reached: You must contact your library for further details.</span><br /><br />
                 {{/compare}}
                <strong class="returnby">Please return by {{ sqldateToUkFormat dueDateField 'T' }}</strong>
            </div>
        </div>
        <div class="col-md-3 col-sm-3 col-xs-12 library-block-right" style="float:right;">
            {{#compare renewalsField '<' 9}}
                {{#compare unseenRenewalsField '<'  3}}
                    <button id="renew-{{ titleKeyField }}" type="button" class="btn btn-cta renew-click">&nbsp;&nbsp;Renew Now&nbsp;&nbsp;</button>
                {{else}}
                     <button type="button" class="btn btn-cta disabled btn-disabled" style="width:90%;">Not Renewable</button>
                {{/compare}}
            {{else}}
                     <button type="button" class="btn btn-cta disabled btn-disabled" style="width:90%;">Not Renewable</button>
            {{/compare}}
        </div>
    </div>
    {{/each}}
    {{else }}
    <div class="row">
        <div class="col-md-12" style="min-height:120px;">
            <strong style="text-align:center; margin-left:auto; margin-right:auto; padding-top:30px; display:block;">There are no items currently on loan.</strong>
        </div>
    </div>
    {{/if }}

</script>

<script id="onhold-partial" type="text/x-handlebars-template">
    {{#if patronHoldInfoField.length }}
    <div class="row library-banner clearfix">
        <div class="col-md-12 col-sm-12 library-block-left">
            <strong> Total items on hold:</strong>&nbsp;{{ patronHoldInfoField.length }}<br />
            <strong> Pickup items:</strong>&nbsp;{{ pickupItemsTotal patronHoldInfoField }}
        </div>   
    </div>
    <div class="row">
        <div class="col-md-12 zero-pad-left">
            <label class="custom-control custom-checkbox">
                <input id="patron-hold-info-all" type="checkbox" class="custom-control-input" onchange="">
                <span class="custom-control-indicator select-all-text">Select all</span>
            </label>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12 zero-pad-left">
            <table class="tbl-responsive patron-hold-info">
                <tbody>
                    <tr>
                       
                        <th>Title&nbsp;</th>
                        <th>Status&nbsp;</th>
                        <th>Pickup at&nbsp;</th>
                        <th>&nbsp;Expires</th>
                        <th>Place in Queue</th>
                    </tr>
                    {{#each patronHoldInfoField }}
                    <tr>
                        <td style="background-color:#e3e4e6;">
                            <div class="onhold-table-container clearfix" >
                                <div class="onhold-suspend-image" >
                                    {{#checkSuspended suspendStartDateField suspendEndDateField }}
                                    <img alt="" src="/siteElements/channelshift/content/images/library/calendar.png" title="Suspended {{ dateToUkFormat ../suspendStartDateField '- ' }} - {{ dateToUkFormat ../suspendEndDateField '-
			 '}}" />
                                    {{/checkSuspended}}
                                    {{#holdItemStatus available availableDate availableExpiresDate }}
                                    <img alt="" src="/siteElements/channelshift/content/images/library/green!.png" title="available from {{ dateToUkFormat ../availableDateField '- ' }} - {{ dateToUkFormat ../availableExpiresDateField '-
			 '}}" />
                                    {{/holdItemStatus}}
                                </div>
                                <div class="onhold-checkbox">
                                    <label class="custom-control custom-checkbox">
                                        <input id="held-item-{{holdKeyField}}" type="checkbox" class="custom-control-input" value="{{ holdKeyField }}" onchange="" />
                                        <span class="custom-control-indicator"></span>
                                    </label>
                                </div>
                                <div class="onhold-title" >
                                    <strong>{{ titleField }}</strong><br />
                                    <strong>{{ authorField }}</strong>
                                </div>
                            </div>
                        </td>
                        {{#checkSuspended suspendStartDateField suspendEndDateField }}
                        <td><span class="mobile-title"><strong>Status:</strong></span>Suspended</td>
                        {{else}}
                        <td><span class="mobile-title"><strong>Status:</strong></span>{{ holdItemStatusText ../availableField ../availableDateField ../availableExpiresDateField }}</td>
                        {{/checkSuspended}}
                        <td><span class="mobile-title"><strong>Pick up:</strong></span>{{ pickupLibraryDescriptionField }}</td>
                        <td><span class="mobile-title"><strong>Expires:</strong></span>{{ dateToUkFormat expiresDateField 'T ' }}</td>
                        <td><span class="mobile-title"><strong>Queue:</strong></span>{{ queuePositionField}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            <div class="row library-padding">
                <div class="col-xs-3 onhold-cancel"><button id="onhold-cancel" class="btn btn-block btn-red">Cancel</button></div>
                <div class="col-xs-3 onhold-edit"><button id="onhold-edit" class="btn btn-block btn-cta">Edit Collection Location</button></div>
                <div class="col-xs-3 onhold-suspend"><button id="onhold-suspend" class="btn btn-block btn-cta">Suspend</button></div>
                <div class="col-xs-3 onhold-unsuspend"><button id="onhold-unsuspend" class="btn btn-block btn-cta">Unsuspend</button></div>
            </div>
        </div>
    </div>
    {{else }}
    <div class="row">
        <div class="col-md-12" style="min-height:120px;">
            <strong style="text-align:center; margin-left:auto; margin-right:auto; padding-top:30px; display:block;">There are no items currently on hold. </strong>
        </div>
    </div>
    {{/if }}

</script>

<script id="mylist-partial" type="text/x-handlebars-template">
    <div id="mylist-container" class="clearfix">
        {{#if this.length }}
        <div class="row library-banner clearfix">
            <div class="col-md-6 col-sm-6 col-xs-6 library-block-left">
                <strong> Total items in my list:</strong>&nbsp; {{ this.length }}
            </div>
            <div class="col-md-6 col-sm-6 col-xs-6 library-block-right">
                <select class="mylist-orderby">
                    <option value="-1">-- Order results by --</option>
                    <option value="Title">Title</option>
                    <option value="Author">Author</option>
                    <option value="Publish">Publication Date</option>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 zero-pad-left">
                <label class="custom-control custom-checkbox">
                    <input id="mylist-all" type="checkbox" class="custom-control-input" onchange="">
                    <span class="custom-control-indicator select-all-text">Select all</span>
                </label>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 zero-pad-left">
                <table class="tbl-responsive">
                    <tbody>
                        {{#each this }}
                        <tr>
                            <td style="background-color:#e3e4e6;">
                                <div class="clearfix mylist-checkboxes">
                                    <div class="clearfix" style="display:table; width:100%;">
                                        <div style="display:table-cell; float:left; min-width:25px;">
                                            <label class="custom-control custom-checkbox">
                                                <input id="mylist_{{ titleIDField }}" type="checkbox" class="custom-control-input" value="{{ titleIDField }}" />
                                                <span class="custom-control-indicator"></span>
                                            </label>
                                        </div>
                                        <div class="mylist-image">
                                            {{#compareshort (getPropertyValueField bibliographicInfoField "labelField"  "Electronic access" "urlField") "eq" ""}}
                                            {{#if iSBNField.length}}
                                            <img src='{{buildLibrarySrc iSBNField.[0] }} ' alt="{{ apidata.titleField   }}" class="search-image" />
                                            {{/if}}
                                            {{ else }}
                                            <img src='{{ getPropertyValueField bibliographicInfoField "labelField"
			 "Electronic access" "urlField" }}
			 ' alt="{{ titleField }}" class="search-image" />
                                            {{/compareshort}}
                                        </div>
                                        <div class="mylist-title" >
                                            <strong>{{ titleField  }}</strong><br />
                                            <strong>{{ authorField }}</strong><br />
                                            {{#foreach bibliographicInfoField }}
                                            {{#compareshort labelField "eq" "Summary"}}<p>{{ dotdotdot textField 120 }}</p> {{/compareshort}}
                                            {{/foreach}}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {{/each }}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="row library-padding">
            <div class="col-xs-3"><button id="mylist-delete" class="btn btn-block btn-cta">Delete</button></div>
            <div class="col-xs-3"><button id="mylist-reserve-item" class="btn btn-block btn-cta reserve-item-click">Reserve</button></div>
            <div class="col-xs-3"><button id="mylist-email" class="btn btn-block btn-cta">Email</button></div>
            <div class="col-xs-3"><button onclick="window.print()" class="btn btn-block btn-cta">Print</button></div>
        </div>
        {{else }}
        <div class="row">
            <div class="col-md-12" style="min-height:120px;">
                <strong style="text-align:center; margin-left:auto; margin-right:auto; padding-top:30px; display:block;">There are no items stored in my lists. </strong>
            </div>
        </div>
        {{/if }}
    </div>
    {{> mylist-email-partial this }}
</script>

<script id="mylist-email-partial" type="text/x-handlebars-template">

    <div id="email-mylist-container" class="zero-pad-all library-container clearfix" style="display:none;">
        <div class="row library-banner clearfix">
            <div class="col-md-12 col-sm-12 col-xs-12 library-block-left">
                <strong>Please enter email address below</strong>
            </div>
        </div>
        <div id="email-mylist-container" class="row zero-pad-all">
            <div class="col-md-12">
                <form id="email-mylist-form" action="javascript:return;" method="post" class="form-horizontal">
                    <div class="row form-group">
                        <label class="control-label col-sm-2" for="email">Email Address:</label>
                        <div class="col-sm-6 col-md-6">
                            <input id="email" name="email" type="text" class="form-control" maxlength="40" placeholder="Enter email address" />
                        </div>
                    </div>
                    <div class="row form-group">
                        <div class="col-sm-offset-2 col-sm-3 col-md-2 col-xs-6 zero-pad-all">
                            <button id="mylist-email-cancel" type="button" class="btn btn-red">Cancel</button>
                         
                        </div>
                        <div class="col-sm-offset-2  col-sm-3 col-md-2 col-xs-6 zero-pad-right">
                            <button type="submit" class="btn btn-cta">Send Email</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</script>

<script id="fines-partial" type="text/x-handlebars-template">
    {{#if this.length }}
    <div class="row library-banner clearfix">
        <div class="col-md-8 col-sm-8 library-block-left">
            <strong>Current fines / blocks</strong>
        </div>
        <div class="col-md-4 col-sm-4 library-block-right">&nbsp;</div>
    </div>
    <div class="row">
        <div class="col-md-12 zero-pad-left">
            <table class="tbl-responsive">
                <tbody>
                    <tr><th>Title/ Explanation&nbsp;</th><th>Reason&nbsp;</th><th>Amount&nbsp;</th></tr>
                    {{#each this }}
                    <tr>
                        <td><span class="mobile-title"><strong>Title:</strong></span>{{ feeItemInfoField.titleField }}</td>
                        <td><span class="mobile-title"><strong>Reason:</strong></span>{{ billReasonDescriptionField }}</td>
                        <td><span class="mobile-title"><strong>Amount:</strong></span>&pound;{{ moneyFormat amountField.valueField '.' }} {{{ paidFor amountOutstandingField.valueField }}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>
    </div>
    {{else }}
    <div class="row">
        <div class="col-md-12" style="min-height:120px;">
            <strong style="text-align:center; margin-left:auto; margin-right:auto; padding-top:30px; display:block;">There are no items  stored in My lists. </strong>
        </div>
    </div>
    {{/if }}
</script>

<script id="edit-location-template" type="text/x-handlebars-template">
    {{#if apidata.length }}
    <h2 style="margin-top:0px;">Edit a pick up location</h2>
    <div class="row library-banner clearfix">
        <div class="col-md-12 col-sm-12 library-block-left">
            <strong>Place holds(s) - </strong>a charge may apply
        </div>
    </div>

    <table class="tbl-responsive">
        <tbody>
            <tr>
                <th>Title&nbsp;</th>
                <th>Author</th>
                <th>Pickup Library&nbsp;</th>
            </tr>
            {{#each apidata }}
            <tr>
                <td><span>{{ titleField }}</span></td>
                <td><span class="mobile-title"><strong>Author:</strong></span>{{ authorField }}</td>
                <td>
                    <span class="mobile-title"><strong>Library:</strong></span>
                    {{#select pickupLibraryIDField}}
                    <select id="select-location-ddl_{{ holdKeyField}}" class="select-edit-location" style="float:none;">
                        <option value="ANC">Anchorsholme</option>
                        <option value="CEN" selected="selected">Central</option>
                        <option value="LNG">Langdale Library</option>
                        <option value="LAY">Layton</option>
                        <option value="GRA">Library @thegrange</option>
                        <option value="MOR">Moor Park</option>
                        <option value="PAL">Palatine</option>
                        <option value="REV">Revoe</option
                    </select>
                    {{/select}}
                </td>
            </tr>
            {{/each}}
        </tbody>
    </table>

    <div class="row library-padding">
        <div class="col-sm-3 col-xs-6 zero-pad-all"><button id="back-to-account" class="btn btn-block btn-red">Back to account</button></div>
        <div class="col-sm-3 col-xs-6 zero-pad-right"><button id="update-location" class="btn btn-block btn-cta">Update location</button></div>
    </div>
    {{/if}}
</script>

<script id="suspend-item-template" type="text/x-handlebars-template">
    {{#if apidata.length }}
    <div class="row">
        <div id="suspend-item-container" class="col-md-12" style="max-width:520px;">
            <h2>Suspend holds</h2>
            <p>When do you want the selected holds to be suspended?</p>
            <form id="suspenditem-form" action="javascript:return;" method="post" class="form-horizontal">
                {{#each apidata }}
                <input id="suspend_{{ holdKeyField}}" class="suspend-holdkeys" type="hidden" value="{{ holdKeyField}}" />
                {{/each}}
                <div class="row form-group">
                    <label class="col-md-3  col-xs-3 control-label">Start date</label>
                    <div class="col-md-5 col-xs-9 zero-pad-all" >
                        <div class="input-group input-append date">
                            <!--
                            <input type="text" class="form-control " name="StartDateTime" id="StartDateTime" placeholder="date calendar" style="max-width:340px;" />
                            <span class="input-group-addon add-on"><span class="glyphicon glyphicon-calendar"></span></span>
                            -->
                            <input name="StartDateTime" id="StartDateTime" type="date" value=""  />
                        </div>
                    </div>
                </div>
                <div class="row form-group">
                    <label class="col-md-3 col-xs-3 control-label">End date</label>
                    <div class="col-md-5 col-xs-9 zero-pad-all">
                        <div class="input-group input-append date">
                            <!--
                            <input type="text" class="form-control " name="EndDateTime" id="EndDateTime" placeholder="date calendar"  style="max-width:340px;"/>
                            <span class="input-group-addon add-on"><span class="glyphicon glyphicon-calendar"></span></span>
                            -->
                            <input name="EndDateTime" id="EndDateTime" type="date" value=""  />
                        </div>
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col-xs-12 col-md-12 col-md-offset-3 col-sm-offset-3 zero-pad-all clearfix">
                        <div class="row library-padding">
                             <div class="col-xs-6 col-md-3 col-sm-3 zero-pad-all"><button id="back-to-account" class="btn btn-block btn-red">Back to account</button></div>
                            <div class="col-xs-6 col-md-3 col-sm-3 zero-pad-right" ><button id="submit-suspendItem" type="submit" class="btn btn-block btn-cta">Save</button></div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    {{/if}}
</script>