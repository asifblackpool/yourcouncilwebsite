<script id="healthy-choices-template" type="text/x-handlebars-template">

	{{#each apidata }}

	<div class="zero-pad-all clearfix" style="margin-bottom:15px;">
		<h3><strong>{{ businessName }}</strong></h3>
        <div class="col-md-12 col-sm-12 zero-pad-all">
            <div class="row">
                <div class="col-md-6 col-sm-6 zero-pad-all">
            
                    <table class="healthy-choices-table" style="width:100%">
                        <tr>
                            <th scope="row" style="vertical-align:top;">Address:</th>
                            <td>{{{ address }}}</td>
                        </tr>
                        <tr>
                            <th scope="row" style="vertical-align:top;">Type:</th>
                            <td>{{ typename }}</td>
                        </tr>
                        <tr>
                            <th scope="row" style="vertical-align:top;">Date awarded:</th>
                            <td>{{ dateToUkFormatWithReplace dateAwarded 'T' '-' }}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6 col-sm-6 zero-pad-all">

                    <table class="healthy-choices-table" style="width:100%">
                        <tr>
                            <th scope="row">Telephone:</th>
                            <td>{{ telephone }}</td>
                        </tr>
                        <tr>
                            <th scope="row">Web:</th>
                            <td>{{ link websiteText webside }}</td>
                        </tr>
                        <tr>
                            <th scope="row">Email:</th>
                            <td style="word-break:break-word;">{{ emaillink email email }}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="zero-pad-all" style="margin-top:15px;">
        <div class="col-md-6 col-sm-6 zero-pad-all">
            {{#if imageUrl.length}}
            <img src="https://www.blackpool.gov.uk{{ imageUrl}}" alt="{{imageCaption }}" class="image-response" />
            {{else }}
                <strong>no image </strong>
            {{/if}}
        </div>
        <div class="col-md-6 col-sm-6 zero-pad-all">
                <div id="map-placeholder-{{ sys.id }}">
                    <div id="map-{{sys.id}}" class="row" style="display:block; min-height:350px; width:100%; margin-bottom:30px;"></div>
                </div>
            </div>
        </div>
    <div class="zero-pad-all" style="margin-top:15px;">
    <div class="col-md-12 col-sm-12 zero-pad-all">
       <hr style="border-top: solid 1.5px #eee;" /><br />
   </div>
</div>
{{/each}}
</script>