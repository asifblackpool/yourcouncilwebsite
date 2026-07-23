<script id="assets-listing-template" type="text/x-handlebars-template">

	{{#each apiAssets }}
	<div class="row listing-item ">
		<div class="col-md-5 col-sm-5 property-image padding-left-zero">
			<a id="image_{{Id}}" class="detail-link" href="#">
				<img src="{{ ../imageBaseUrl}}{{ picture }}" alt="{{ title }}" />
			</a>
		</div>
		<div class="col-md-7 col-sm-7 pull-right property-details">
			<span>{{ type }}</span>
			<h2 class="listing-title">
				<a id="title_{{Id}}" class="detail-link" href="#">{{ title }}</a>
			</h2>
			<span class="listing-cost"><strong>{{ cost }}</strong></span><br/>
			<span class="listing-size">{{ size }} </span>
			<span class="item-address">{{ addresswithoutName }}</span>
			<p class="listing-description">{{{dotdotdot features 350 }}}</p>
		</div>

	</div>
	<hr /> {{/each}}
</script>

<script id="asset-detail-template" type="text/x-handlebars-template">
	{{#if apidata }}
	<div class="row btn-top-container">
		<button type="button" class="back-to-search btn btn-primary btn-sm">Back to Search</button>
	</div>
	<div class="row asset-item">
		<div class="col-md-12 col-sm-12">
			<h3 style="margin-top:0px;">{{ apidata.title }}</h3>
			<span class="item-address">{{ apidata.fulladdress }}</span>
			<div class="row">
				<div class="col-md-6 col-sm-6 zero-pad-all"><strong>{{ apidata.size}}</strong></div>
				<div class="col-md-6 col-sm-6 pull-right">
					<span class="item-cost"><strong>{{ apidata.cost }}</strong></span>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 col-sm-6" style="margin-top:20px;">
			<div id='carousel-custom' class='carousel slide' data-ride='carousel'>
				<div class='carousel-outer'>
					<div class='carousel-inner'>
						{{#each apidata.pictures }}
						<div class='item {{#if @first}}active{{/if}}'>
							<img class="main-image" src='{{../imageBaseUrl }}{{this.url}}' alt='{{ this.alt }} {{ ./apidata.title }}' style='{{#compare ../apidata.picturesTotal "<"  2}} height:410px;{{else}}height:300px;{{/compare}}' />
						</div>
						{{/each}}
					</div>
					<a class='left carousel-control' href='#carousel-custom' data-slide='prev'><span class='glyphicon arrow-position'>&#60;</span></a>
					<a class='right carousel-control' href='#carousel-custom' data-slide='next'><span class='glyphicon arrow-position'>&#62;</span></a>
				</div>
				<ol class='carousel-indicators mCustomScrollbar' style='{{#lessthanlimit apidata.picturesTotal 2}}display:none;{{/lessthanlimit}}'>
					{{#each apidata.pictures }}
					<li data-target='#carousel-custom' data-slide-to='{{@index}}' class='{{#if @first}}active{{/if}}'>
						<img src='{{../imageBaseUrl }}{{ this.url}}' alt='{{ this.alt }} {{ ./apidata.title }}' />
					</li>
					{{/each}}
				</ol>
			</div>
		</div>
		<div class="col-md-6 col-sm-6" style="margin-top:20px;">
			<div class="iframe-rwd clearfix">
				<iframe width="425" height="350" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q={{apidata.map.lat }},{{ apidata.map.long }}&amp;key=AIzaSyBUNEUcvMCl007BXEMgiWmCswpLqqGZucM">
				</iframe>
			</div>
		</div>
	</div>
	<div class="row" style="padding-top:20px; min-height:100px;">
		<h2>Detailed view</h2>
		<div class="col-md-6 col-sm-6 zero-pad-all">
			<span><strong>Type:&nbsp;</strong>{{ apidata.type }}</span><br/>
			<span><strong>Uses:&nbsp;</strong>{{ apidata.uses}}</span>
		</div>
		<div class="col-md-6 col-sm-6">
			<button type="button" class="btn btn-primary btn-sm asset-btn" onclick="window.open('/Business/Business-support-and-advice/Forms/Asset-call-back.aspx?property={{ slugify apidata.title}}')">
                Request Call Back/Viewing
            </button> {{#compare apidata.brochure '!=' "" }}
			<button type="button" onclick="window.open('{{ imageBaseUrl }}{{ apidata.brochure }}', '_blank');" class=" btn btn-primary btn-sm asset-btn">
                Download a Brochure
            </button> {{/compare}}

		</div>
	</div>
	<div class="row">
		<h3 style="margin-top:5px;">Features</h3>
		{{{apidata.features }}}
	</div>
	<div class="row">
		<h3 style="margin-top:5px;">Description</h3>
		{{{apidata.description }}}
	</div>
	<div class="row btn-bottom-container"><button type="button" class="back-to-search btn btn-primary btn-sm">Back to Search</button></div>

	{{/if }}
</script>