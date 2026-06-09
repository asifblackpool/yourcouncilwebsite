
 <script id="councillor-postcode-template" type="text/x-handlebars-template">
    {{#if this.apidata.length}}
    <h3>Your council ward area is <strong>{{ wardTitle }}</strong></h3>
    <span>Your councillors are </span>
    <div class="row">
        {{#each apidata}}
        <div class="col-md-6 col-sm-12">
            <span class="media-left">
                <iframe id="councillor_{{math index}}" name="councillor_{{math index}}" frameborder="0" scrolling="no" width="90" height="136" src="{{ photosmallurl }}"></iframe>
            </span>
            <div>
                <strong>{{ fullusername }}</strong><br />
                <span>{{ politicalpartytitle }}</span><br /><br />
                <dl class="dl-horizontal">
                    <dt><strong>Surgery:&nbsp;</strong></dt><dd>{{ surgerydetails.line1 }}</dd>
                    {{#checkIf this.workaddress.phone.length '>' 0 '||' this.homeaddress.phone.length '>' 0}}
                    <dt><strong>Tel:</strong></dt>
                    {{/checkIf}}
                    <dd>
                        {{#if this.workaddress.phone.length}}
                        {{ workaddress.phone }}&nbsp;&nbsp;
                        {{/if}}
                        {{#if this.homeaddress.phone.length}}
                        {{ homeaddress.phone }}
                        {{/if}}
                    </dd>
                    {{#checkIf this.workaddress.mobile.length '>' 0 '||' this.homeaddress.mobile.length '>' 0}}
                    <dt><strong>Mobile</strong></dt>
                    {{/checkIf}}
                    <dd>
                        {{#if this.workaddress.mobile.length}}
                        {{ workaddress.mobile }}&nbsp;&nbsp;
                        {{/if}}
                        {{#if this.homeaddress.mobile.length}}
                        {{ homeaddress.mobile }}
                        {{/if}}
                    </dd>
                    <dt><strong>Email:&nbsp;</strong></dt>
                    <dd><a href="mailto:{{ workaddress.email }}">{{ workaddress.email }}</a></dd>
                </dl>
            </div>
        </div>
        {{/each}}
    </div>
    {{else}}
    <strong style="display:inline-block; margin-bottom:20px;">{{ msg }}</strong>
    {{/if}}
</script>
