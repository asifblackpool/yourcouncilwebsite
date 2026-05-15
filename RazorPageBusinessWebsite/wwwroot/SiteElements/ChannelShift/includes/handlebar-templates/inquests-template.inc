<script id="inquest-template" type="text/x-handlebars-template">
	<br/> {{#each apiInquests }}
		<div class="row">
			<div class="col-md-6 col-sm-6">
				<span class="inquest-label">Date of hearing:</span>
			<span>{{ checkDateDifference dateOfHearing.from dateOfHearing.to }}</span>
		</div>
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Type:</span>
			<span> {{ typeOfInquestOrHearing }}</span>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Name of deceased:</span>
			<span>{{ nameOfTheDeceased}}</span>
		</div>
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Age:</span>
			<span>{{ age}}</span><span>&nbsp;&nbsp;{{ ageType }}</span>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Date of death:</span>
			<span>{{ dateToUkFormatWithReplace dateOfDeath 'T' '-' }}</span>
		</div>
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Place of death:</span>
			<span>{{ placeOfDeath }}</span>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Coroner:</span>
			<span>{{ coroner }}</span>
		</div>
		<div class="col-md-6 col-sm-6">
			<span class="inquest-label">Coroner's officer:</span>
			<span>{{ coronersOfficer}}</span>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12">
			<span class="inquest-label">Notes:</span>
			<span>{{notes}}</span>
		</div>
	</div>
	<hr />
	<br /> {{/each}}
</script>