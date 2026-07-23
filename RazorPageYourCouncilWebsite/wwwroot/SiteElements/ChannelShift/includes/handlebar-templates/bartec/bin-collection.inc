<script id="bartec-bin-collection-template" type="text/x-handlebars-template">
	<div class="col-md-12 zero-pad-all">
		<h2><strong>Bin Collection</strong></h2>
    </div>
    {{#if this.apidata}}
    <div class="row text-center" style="margin-bottom:15px">
        <p><strong>To get bin collection dates please select an address below.</strong><br></p>
        <select class="selectpicker" id="bartec-ddl" name="bartec-ddl" style="display:block !important;text-align:center; margin:auto;">
            <option value="-1">-- Please select Address below --</option>
            {{#each apidata }}
            <option value="{{ uprn }}">{{ addressLine }}</option>
            {{/each}}
        </select>
        <style type="text/css">
            select.selectpicker {
                display: block !important;
                text-align: center;
                margin: auto;
            }
        </style>
    </div>
    <div id="bartec-bin-date-placeholder">&nbsp;</div>
    {{else}}
    <div class="row" style="margin-bottom:15px; text-align:center;"><strong>Bin collection address not found for the post code entered.</strong></div>
    {{/if}}
</script>
<script id="bartec-bin-dates-template" type="text/x-handlebars-template">
	{{#if apidata}}
    {{#each apidata }}
    <p><strong>{{ description }}</strong><br> Your next collection day is on {{ date }}</p>
    {{/each}}
{{else}}
    <div class="row" style="margin-bottom:15px"><strong>Bin collection dates not found for the post code entered.</strong></div><br/>
    {{/if}}
    <h4><strong>When to present your&nbsp;waste for collection</strong></h4>
    <ul>
        <li>Please ensure your Wheeled bin or red sacks are presented by <strong>7.30am</strong> on your collection day</li>
        <li>Please label your bins with your address</li>
    </ul>
</script>