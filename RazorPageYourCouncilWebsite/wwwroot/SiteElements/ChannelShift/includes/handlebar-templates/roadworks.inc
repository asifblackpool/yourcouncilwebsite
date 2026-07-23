<script id="roadworks-template" type="text/x-handlebars-template">
    <div class="row button-container">
        <div class="col-md-12" style="color:#fff;">
            <button id="traffic-close-btn" class="btn btn-default btn-md"><span style="font-size:2em; position:relative; top:-2px;">&#8678;</span></button>
            {{ dotdotdot apidata.SiteLocation 16 }}
        </div>
    </div>
    <div class="traffic-panel">
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Site Location</div>
                <div class="traffic-panel-detail">{{ apidata.SiteLocation }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Works Type</div>
                <div class="traffic-panel-detail">{{ apidata.WorksTypeDescription }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Address1</div>
                <div class="traffic-panel-detail">{{ apidata.Address1 }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Works</div>
                <div class="traffic-panel-detail">{{apidata.WorksStatus }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Description</div>
                <div class="traffic-panel-detail">{{ apidata.Description }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Start</div>
                <div class="traffic-panel-detail">{{ apidata.StartDate }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">End</div>
                <div class="traffic-panel-detail">{{ apidata.EndDate }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Responsible Organisation</div>
                <div class="traffic-panel-detail">{{ apidata.PromoterOrganisation }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Works Locataion Text</div>
                <div class="traffic-panel-detail">{{ apidata.SiteLocation }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Easting</div>
                <div class="traffic-panel-detail">{{ apidata.Easting }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Northing</div>
                <div class="traffic-panel-detail">{{ apidata.Northing}}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="traffic-panel-label">Traffic Management</div>
                <div class="traffic-panel-detail">{{ apidata.TrafficManagement }}</div>
            </div>
        </div>
    </div>
</script>

<script id="roadworks-sidebar-template" type="text/x-handlebars-template">

{{#if apidata.length}}
     {{#each apidata}}
        <li class="fixed-list">
            <div class="checkbox location-type roadwork-status">
                <label><input id="roadworks-{{ Id }}" value="{{ WorksType }}" name="roadworksCheckbox" class="checkbox-places" type="checkbox" title="{{ WorksType }}">{{ WorksType }}</label>
                <img src="/SiteElements/ChannelShift/Content/images/maps/{{ImageUrl }}" alt="{{WorksType}}" />
                <ul class="tree all-items-{{ Id}}"  >
                    <li>
                        <a href="#" class="pseudo-link">All Items</a>
                        <ul class="ul-roadwork">{{> roadworks-sidebar-link-partial this.RoadWorksList}}</ul>
                    </li>      
              </ul>
            </div>
        </li>
    {{/each}}
{{/if}}
  
</script>

<script id="roadworks-sidebar-link-partial" type="text/x-handlebars-template">
    {{#each this}}
    <li class="fixed-list">
        <div class="checkbox location-type">
            <label>
                <a id="roawork-traffic-link-{{ this.Id}}"  class="roadwork-traffic-link" href="#" title="{{this.SiteLocation}}">{{ dotdotdot this.SiteLocation 20}}</a>
            </label>
        </div>
    </li>
    {{/each }}
</script>
