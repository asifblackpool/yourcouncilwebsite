<script id="elections-accordion-template" type="text/x-handlebars-template">
    {{#if apiShow}}
    <h2 style="font-weight:bold;">Overall totals</h2>
    <table class="tbl-responsive" border="1">

        <tbody>
            <tr>
                <th>Party&nbsp;</th>
                <th>Seats&nbsp;</th>
            </tr>
            {{#each apiResults}}
            <tr>
                <td style="font-weight:bold;">{{ party}}</td>
                <td style="font-weight:bold;">{{ seats}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
    <br />
    <h2 style="font-weight:bold;">Overall Party Results</h2>
    <canvas id="responsive-canvas-analysis" style="width:100%; border:solid 1px black"></canvas>
    <br />
    <br />
    <br />
    {{/if}}
    <div class="accordion clearfix">
        <ul id="accordion-ul" class="outer-ul">
            {{#each apiData }}
            <li class="head">
                <a id="link_{{sheetId}}" class="link-head" href="#">
                    <h2 class="clearfix"><span class="pull-left">{{ name }}</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2>
                </a>
                <div id="{{sheetId }}" class="accordion-togglable" style="display: none; background-color:#fff;">
                    <div id="sheet_{{sheetId}}" class="row" style="margin-left:15px; margin-right:15px; background-color:#fff;">

                    </div>
                </div>
            </li>
            {{/each}}
        </ul>
    </div>
</script>

<script id="elections-item-template" type="text/x-handlebars-template">
    <table class="tbl-responsive" border="1">
        <caption style="font-weight:bold;">{{ apisheet.sheetName }} results</caption>
        <tbody>
            <tr>
            <th>Candidate name&nbsp;</th>
            <th>Description&nbsp;</th>
            <th>&nbsp;Total number of votes</th>
            <th>Percentage of votes&nbsp;</th></tr>
            {{#each apivote}}
            <tr>
                {{#compareshort elected "eq" "Yes"}}
                    <td style="font-weight:bold;">{{candidate}}</td>
                    <td style="font-weight:bold;">{{ outputEmpty party 'Blank'}}</td>
                    <td style="font-weight:bold;">{{votes}}</td>
                    <td style="font-weight:bold;">{{percentage}}</td>
                {{else}}
                    <td>{{candidate}}</td>
                    <td>{{outputEmpty party 'Blank' }}</td>
                    <td>{{votes}}</td>
                    <td>{{percentage}}</td>
                {{/compareshort}}
            </tr>
            {{/each}}
        </tbody>
    </table>
    <br/>
    <canvas id="responsive-canvas-{{ apisheet.sheetId}}" style="width:100%; border:solid 1px black"></canvas>
    
    {{#foreach apistatement}}
        {{#if $first}} 
            <h3 style="font-weight:bold;">{{ paragraph }}</h3>
        {{else }}
            <p>{{ paragraph }}</p>
        {{/if}}
    {{/foreach}}


    {{#foreach apiturnout}}
    {{#if $first}}
    <h3 style="font-weight:bold;">{{ paragraph }}</h3>
    {{else }}
    <p>{{ paragraph }}</p>
    {{/if}}
    {{/foreach}}
</script>


