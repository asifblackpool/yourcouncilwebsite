<div class="row">
	<div id="roadworks-container" class="col-md-12 col-sm-12; pull-left" style="padding:10px;">
		<div class="menu" style="width:100%; background-color:silver;"><span style="cursor:pointer; margin:5px;" onclick="openNav()"><strong>Filter</strong></span></div>
		<div class="Flexible-container" style="border:solid 0px red;">
			<div class="embed-container">

				<div id="map" style="height:600px; width:100%"></div>
				<div id="mySidenav" class="sidenav" style="z-index:9999;">
					<a href="javascript:void(0)" class="closebtn" onclick="closeNav()" style="text-decoration:none;">&times;</a><br/>
					<ul class="roadworks-menu"> 

					</ul>
				</div>
				<div id="traffic-information-detail" class="trafficinfo" style="display:none;">

					<div id="roadworks-loading-indicator" style="position:relative; left: 40%; top: 50%; display:none;">
						<strong><img src="/SiteElements/ChannelShift/Content/images/gif.gif" />  ... Loading</strong>
					</div>
					<!-- traffic info template -->
					<div class="traffic-content"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<div id="table-wrapper" style="display:none;">
	<table id="roadworks" class="display no-wrap" cellspacing="0" width="100%">
		<thead>
			<tr>
				<th>&nbsp;Address</th>
				<th style="text-align:center;">Location</th>
				<th style="text-align:center;">Description</th>
				<th>Start</th>
				<th>End</th>
				<th>Responsible Organisation</th>
				<th>Traffic Management</th>
				<th>Work Type</th>
				<th>Works Status</th>
			</tr>
		</thead>
	</table>
</div>

<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="/siteElements/channelShift/Scripts/thirdparty/collapsibleLists/collapsiblelists.min.js"></script>
<link href="/SiteElements/ChannelShift/content/styles/bundles/year-2023/roadworks.min.css" rel="stylesheet" />
<script src="/SiteElements/ChannelShift/scripts/jquery/jquery.dataTables.min.js"></script>
<script src="/SiteElements/ChannelShift/scripts/jquery/jquery.dataTables.responsive.min.js"></script>
<script type="text/javascript" src="/SiteElements/ChannelShift/Scripts/services/roadworks/openstreetmaproadworkservices.js"></script>
<script type="text/javascript">
	$(document).ready(function () {
         openstreetmaproadworkservices.init();

         $(document).on('click', '#traffic-close-btn', function (e) {
             e.preventDefault(); // cancel default behavior
             openstreetmaproadworkservices.closeRoadworkInformation();
         });
     });

     function openNav() {
         openstreetmaproadworkservices.closeRoadworkInformation();
         openstreetmaproadworkservices.openMapSideBar();
     }

     function closeNav() {
         openstreetmaproadworkservices.closeMapSideBar();
     }

</script>