<script id="webcast-video-timestamp-template" type="text/x-handlebars-template">
    {{#if apitimestampdata.length}}
        <p>To view individual agenda items click on the links below. </p>
        <h2>Agenda</h2>
        <p>
            {{#each apitimestampdata}}
            <span>
            {{#if this.link.length }}
                <a class="you-tube-link" href="{{ this.link }}">{{ this.title}}</a>
            {{else }}
                {{ this.title}}
            {{/if}}
            <br /></span>
            {{/each}}
        </p>
    {{/if}}
        {{#if democracy.link.length }}
            <p>For full agenda, attendance details and supporting documents visit:<br /><span><a target="_blank" href="{{ democracy.link }}">{{ democracy.text}}</a> </span></p>
        {{/if}}
        {{#unless apidefault.isLatest }}
        <h2>Latest webcast</h2>
        <ul>
            <li><a id="webcast_{{ apidefault.Id }}" class="other-webcast-link" href="#">{{ apidefault.Title}}</a> </li>
       </ul>
       {{/unless}}
</script>
<script id="webcast-video-links-template" type="text/x-handlebars-template">
    {{#if apidata.length }}
    <h2>Other webcasts</h2>
    <p>See webcasts for: </p>
    <ul>
        {{#each apidata}}
        <li><a id="webcast_{{ Id }}"  class="other-webcast-link" href="#">{{ Title}}</a> </li>
        {{/each}}
    </ul>
    {{/if}}
</script>
