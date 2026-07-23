<script id="community-events-template" type="text/x-handlebars-template">
    {{#each apidata }}
	<div class="row" style="padding-top:5px;">
		<div class="col-md-7 col-sm-7 pull-left event-details">
			<h3><strong><a id="link_{{ Id}}" href="{{ ../imageBaseUrl}}{{ picture }}" class="detail-link">{{ title}}</a></strong></h3>
            <fieldset>
                <legend style="display:none;">{{ title }}</legend>
                <div id="date-from" style="float:left; width:50%;">
                    <strong>From:</strong>&nbsp;{{ sqldateToUkFormat startdate 'T' }}
                </div>
                <div id="date-to" style="float:left;width:50%;">
                    <strong>To:</strong>&nbsp;{{ sqldateToUkFormat enddate 'T' }}
                </div>
                <strong class="events-venue">Venue:</strong>&nbsp;{{ venue.venue }}<br/>
                <strong class="events-type">Event/Course type:</strong>&nbsp;{{ coursetype }}<br/>
                <strong>Days and time:</strong>&nbsp;{{ daysandtime }}<br/>
            </fieldset>
        </div>
        <div class="col-md-5 col-sm-5 events-image padding-left-zero">
            <a id="image_{{Id}}" class="detail-link" href="#">
                <img src="{{ ../imageBaseUrl}}{{ picture }}" alt="{{ title }}" aria-labelledby="link_{{ Id}}" />
            </a>
        </div>
    </div>
    <hr />
    {{/each}}
</script>

<script id="community-events-detail-template" type="text/x-handlebars-template">
    <br />
    <div class="row btn-top-container">
        <button type="button" class="back-to-search btn btn-info btn-sm btn-primary">Back to Search</button>
    </div>
    <div class="row asset-item">
        <div class="col-md-12 col-sm-12">
            <h2 style="margin-top:0px;"><strong>{{ apidata.title }}</strong></h2>
            <span class="">
                <a id="course-type_{{Id}}" class="coursetype-link" href="javascript:void(0);"><strong>{{ apidata.venue.venue }}</strong></a>
            </span>
            <input id="hidden-venue" type="hidden" readonly="readonly" value="{{ apidata.venue.sys.id }}" />
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 col-sm-6" style="margin-top:20px;">

            <div id='carousel-custom' class='carousel slide' data-ride='carousel'>
                <div class='carousel-outer'>
                    <div class='carousel-inner'>
                        {{#each apidata.pictures }}
                        <div class='item {{#if @first}}active{{/if}}'>
                            <img class="main-image"
                                 src='{{../imageBaseUrl }}{{this.url}}'
                                 alt='{{ this.alt }}'
                                 style='{{#compare ../apidata.picturesTotal "<"  2}} height:410px;{{else}}height:300px;{{/compare}}' />
                        </div>
                        {{/each}}
                    </div>
                    <a class='left carousel-control' href='#carousel-custom' data-slide='prev'><span class='glyphicon arrow-position'>&#60;</span></a>
                    <a class='right carousel-control' href='#carousel-custom' data-slide='next'><span class='glyphicon arrow-position'>&#62;</span></a>
                </div>
                <ol class='carousel-indicators mCustomScrollbar' style='{{#lessthanlimit apidata.picturesTotal 2}}display:none;{{/lessthanlimit}}'>
                    {{#each apidata.pictures }}
                    <li data-target='#carousel-custom' data-slide-to='{{@index}}' class='{{#if @first}}active{{/if}}'>
                        <img src='{{../imageBaseUrl }}{{ this.url}}' alt='{{ this.alt }}' />
                    </li>
                    {{/each}}
                </ol>
            </div>
        </div>
        <div class="col-md-6 col-sm-6" style="margin-top:20px;">
            <div class="iframe-rwd clearfix">
                <iframe width="425"
                        height="350"
                        frameborder="0"
                        style="border:0"
                        src="https://www.google.com/maps/embed/v1/place?q={{apidata.map.lat }},{{ apidata.map.long }}&amp;key=AIzaSyBUNEUcvMCl007BXEMgiWmCswpLqqGZucM"></iframe>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12 col-sm-12 pull-left event-details">

            <fieldset>
                <div style="float:left; width:50%;">
                    <strong>From:</strong>&nbsp;{{ sqldateToUkFormat apidata.startdate 'T' }}
                </div>
                <div style="float:left; width:50%;">
                    <strong>To:</strong>&nbsp;{{ sqldateToUkFormat apidata.enddate 'T' }}
                </div>
                <div style="float:left; width:100%;">
                    <strong>Days and time:</strong>&nbsp;{{ apidata.daysandtime }}
                </div>

                <div style="float:left; width:50%;">
                    <strong>Type:</strong>&nbsp;{{ apidata.coursetype }}
                </div>
                {{#if apidata.coursecode.length}}
                <div style="float:left; width:50%;">
                    <strong>Course code:</strong>&nbsp;{{ apidata.coursecode  }}
                </div>
                {{/if}}
                <p style="display:table; width:100%;">
                    <strong>Description</strong><br />{{ apidata.description }}
                </p>

            </fieldset>
        </div>

    </div>
</script>