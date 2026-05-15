<script id="review-template" type="text/x-handlebars-template">
	<div class="row">
		<div class="md-12">
			<strong class="review-title">HAPPY MEMBERS</strong>
    </div>
  </div>
  <div class="row" style="background-color:#830065;">
    {{#each apidata}}
    <div class="col-md-2 review">
      <strong class="review-score">{{ score }}/10</strong>
      <p class="review-response">{{ response }} ...</p>
    </div>
    {{/each}}
  </div>
</script>