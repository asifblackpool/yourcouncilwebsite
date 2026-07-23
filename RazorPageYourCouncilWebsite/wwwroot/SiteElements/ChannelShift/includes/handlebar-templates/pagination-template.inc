<script id="top-template" type="text/x-handlebars-template">
	<br />
	<strong>{{ apiTitle }}: {{ apiTotal}} </strong>
	<br />
	<div class="row">
		<div class="col-md-12 pull-left">
			<ul id="top_pager" class="pagination pagination-lg">
				{{#each apipages}} {{#if @first }}
				<li>
					<a id="top_prev" href="#" class="left-link pager-prev" style="text-decoration:none;display:none;">Prev</a>
				</li>
				<li>
					<a id="top_first-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link left-link" style="text-decoration:none;display:none">{{ PageNumber }}</a>
				</li>
				<li class="dots-left" style="display:none"><strong>...</strong></li>
				{{/if }}
				<li>
					<a id="top_pager-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link center-links" style="text-decoration:none;">{{ PageNumber}}</a>
				</li>
				{{#if @last }}
				<li class="dots-right" style="display:none"><strong>...</strong></li>
				<li>
					<a id="top_last-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link right-link" style="text-decoration:none;display:none">{{ PageNumber }}</a>
				</li>
				<li>
					<a id="top_next" href="#" class="right-link pager-next" style="text-decoration:none;display:none">Next</a>
				</li>
				{{/if }} {{/each}}
			</ul>
		</div>
	</div>
</script>

<script id="bottom-template" type="text/x-handlebars-template">
	<div class="row">
		<div class="col-md-12 pull-left">
			<ul id="bottom_pager" class="pagination pagination-lg">
				{{#each apipages}} {{#if @first }}
				<li>
					<a id="bottom_prev" href="#" class="left-link pager-prev" style="text-decoration:none;display:none;">Prev</a>
				</li>
				<li>
					<a id="bottom_first-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link left-link" style="text-decoration:none;display:none">{{ PageNumber }}</a>
				</li>
				<li class="dots-left" style="display:none"><strong>...</strong></li>
				{{/if }}
				<li>
					<a id="bottom_pager-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link center-links" style="text-decoration:none;">{{ PageNumber}}</a>
				</li>
				{{#if @last }}
				<li class="dots-right" style="display:none"><strong>...</strong></li>
				<li>
					<a id="bottom_last-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link right-link" style="text-decoration:none;display:none">{{ PageNumber }}</a>
				</li>
				<li>
					<a id="bottom_next" href="#" class="right-link pager-next" style="text-decoration:none;display:none">Next</a>
				</li>
				{{/if }} {{/each}}
			</ul>
		</div>
	</div>
</script>