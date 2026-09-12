using content.modelling.Models.Components;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using System.Text;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class ElectionResultsHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;

        public ElectionResultsHandler(ISerializationHelper serializer)
        {
            _serializer = serializer;
        }

        string IContentHandler.ContentType => typeof(ElectionResults).Name;

        public bool CanHandle(string className) => className == typeof(ElectionResults).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                var electionResults = await _serializer.DeserializeAsync<ElectionResults>(item);

                if (electionResults == null || string.IsNullOrEmpty(electionResults.GoogleSheetId))
                {
                    htmlContent.AppendHtml("<!-- Error: Election Results content is null or Google Sheet ID is missing -->");
                    return htmlContent;
                }

                // Optional title (if the component has one)
                if (!string.IsNullOrEmpty(electionResults.Title))
                {
                    htmlContent.AppendHtml(BuildTitle(electionResults.Title));
                }

                // Handlebars templates (must be present in DOM before init runs)
                htmlContent.AppendHtml(BuildAccordionTemplate());
                htmlContent.AppendHtml(BuildItemTemplate());

                // Placeholder + loading indicator
                htmlContent.AppendHtml(BuildLoadingIndicator());
                htmlContent.AppendHtml(BuildPlaceholder());

                // External scripts (guarded against duplicate loading)
                htmlContent.AppendHtml(BuildScriptIncludes());

                // Inline init with dynamic Google Sheet ID
                htmlContent.AppendHtml(BuildInitialisationScript(electionResults.GoogleSheetId));

                return htmlContent;
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Election Results Handler: {ex.Message} -->");
                return htmlContent;
            }
        }

        #region Builder Methods

        private IHtmlContent BuildTitle(string title)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<div class=\"election-results-component\">");
            sb.AppendLine($"    <h2 class=\"election-results-title\">{System.Net.WebUtility.HtmlEncode(title)}</h2>");
            return new HtmlString(sb.ToString());
        }

        private IHtmlContent BuildAccordionTemplate()
        {
            var sb = new StringBuilder();
            sb.AppendLine("<script id=\"elections-accordion-template\" type=\"text/x-handlebars-template\">");
            sb.AppendLine("    {{#if apiShow}}");
            sb.AppendLine("    <h2 style=\"font-weight:bold;\">Overall totals</h2>");
            sb.AppendLine("    <table class=\"tbl-responsive\" border=\"1\">");
            sb.AppendLine("        <tbody>");
            sb.AppendLine("            <tr>");
            sb.AppendLine("                <th>Party&nbsp;</th>");
            sb.AppendLine("                <th>Seats&nbsp;</th>");
            sb.AppendLine("            </tr>");
            sb.AppendLine("            {{#each apiResults}}");
            sb.AppendLine("            <tr>");
            sb.AppendLine("                <td style=\"font-weight:bold;\">{{ party}}</td>");
            sb.AppendLine("                <td style=\"font-weight:bold;\">{{ seats}}</td>");
            sb.AppendLine("            </tr>");
            sb.AppendLine("            {{/each}}");
            sb.AppendLine("        </tbody>");
            sb.AppendLine("    </table>");
            sb.AppendLine("    <br />");
            sb.AppendLine("    <h2 style=\"font-weight:bold;\">Overall Party Results</h2>");
            sb.AppendLine("    <canvas id=\"responsive-canvas-analysis\" style=\"width:100%; border:solid 1px black\"></canvas>");
            sb.AppendLine("    <br />");
            sb.AppendLine("    <br />");
            sb.AppendLine("    <br />");
            sb.AppendLine("    {{/if}}");
            sb.AppendLine("    <div class=\"accordion clearfix\">");
            sb.AppendLine("        <ul id=\"accordion-ul\" class=\"outer-ul\">");
            sb.AppendLine("            {{#each apiData }}");
            sb.AppendLine("            <li class=\"head\">");
            sb.AppendLine("                <a id=\"link_{{sheetId}}\" class=\"link-head\" href=\"#\">");
            sb.AppendLine("                    <h2 class=\"clearfix\"><span class=\"pull-left\">{{ name }}</span><span class=\"pull-right\"><i title=\"Open or close\" class=\"icon-arrow-down\"></i></span></h2>");
            sb.AppendLine("                </a>");
            sb.AppendLine("                <div id=\"{{sheetId }}\" class=\"accordion-togglable\" style=\"display: none; background-color:#fff;\">");
            sb.AppendLine("                    <div id=\"sheet_{{sheetId}}\" class=\"row\" style=\"margin-left:15px; margin-right:15px; background-color:#fff;\">");
            sb.AppendLine("                    </div>");
            sb.AppendLine("                </div>");
            sb.AppendLine("            </li>");
            sb.AppendLine("            {{/each}}");
            sb.AppendLine("        </ul>");
            sb.AppendLine("    </div>");
            sb.AppendLine("</script>");
            return new HtmlString(sb.ToString());
        }

        private IHtmlContent BuildItemTemplate()
        {
            var sb = new StringBuilder();
            sb.AppendLine("<script id=\"elections-item-template\" type=\"text/x-handlebars-template\">");
            sb.AppendLine("    <table class=\"tbl-responsive\" border=\"1\">");
            sb.AppendLine("        <caption style=\"font-weight:bold;\">{{ apisheet.sheetName }} results</caption>");
            sb.AppendLine("        <tbody>");
            sb.AppendLine("            <tr>");
            sb.AppendLine("            <th>Candidate name&nbsp;</th>");
            sb.AppendLine("            <th>Description&nbsp;</th>");
            sb.AppendLine("            <th>&nbsp;Total number of votes</th>");
            sb.AppendLine("            <th>Percentage of votes&nbsp;</th></tr>");
            sb.AppendLine("            {{#each apivote}}");
            sb.AppendLine("            <tr>");
            sb.AppendLine("                {{#compareshort elected \"eq\" \"Yes\"}}");
            sb.AppendLine("                    <td style=\"font-weight:bold;\">{{candidate}}</td>");
            sb.AppendLine("                    <td style=\"font-weight:bold;\">{{ outputEmpty party 'Blank'}}</td>");
            sb.AppendLine("                    <td style=\"font-weight:bold;\">{{votes}}</td>");
            sb.AppendLine("                    <td style=\"font-weight:bold;\">{{percentage}}</td>");
            sb.AppendLine("                {{else}}");
            sb.AppendLine("                    <td>{{candidate}}</td>");
            sb.AppendLine("                    <td>{{outputEmpty party 'Blank' }}</td>");
            sb.AppendLine("                    <td>{{votes}}</td>");
            sb.AppendLine("                    <td>{{percentage}}</td>");
            sb.AppendLine("                {{/compareshort}}");
            sb.AppendLine("            </tr>");
            sb.AppendLine("            {{/each}}");
            sb.AppendLine("        </tbody>");
            sb.AppendLine("    </table>");
            sb.AppendLine("    <br/>");
            sb.AppendLine("    <canvas id=\"responsive-canvas-{{ apisheet.sheetId}}\" style=\"width:100%; border:solid 1px black\"></canvas>");
            sb.AppendLine("    ");
            sb.AppendLine("    {{#foreach apistatement}}");
            sb.AppendLine("        {{#if $first}} ");
            sb.AppendLine("            <h3 style=\"font-weight:bold;\">{{ paragraph }}</h3>");
            sb.AppendLine("        {{else }}");
            sb.AppendLine("            <p>{{ paragraph }}</p>");
            sb.AppendLine("        {{/if}}");
            sb.AppendLine("    {{/foreach}}");
            sb.AppendLine("");
            sb.AppendLine("");
            sb.AppendLine("    {{#foreach apiturnout}}");
            sb.AppendLine("    {{#if $first}}");
            sb.AppendLine("    <h3 style=\"font-weight:bold;\">{{ paragraph }}</h3>");
            sb.AppendLine("    {{else }}");
            sb.AppendLine("    <p>{{ paragraph }}</p>");
            sb.AppendLine("    {{/if}}");
            sb.AppendLine("    {{/foreach}}");
            sb.AppendLine("</script>");
            return new HtmlString(sb.ToString());
        }

        private IHtmlContent BuildLoadingIndicator()
        {
            var sb = new StringBuilder();
            sb.AppendLine("<div id=\"voting-loading-indicator\" style=\"position: absolute; height: 100%; width: 100%; background-color: white; opacity: 0.65; z-index: 999999; display: none;\">");
            sb.AppendLine("    <strong>");
            sb.AppendLine("        <img style=\"position: relative; left: 50%; top: 20%;\" alt=\"\" height=\"44\" width=\"44\" src=\"/SiteElements/ChannelShift/Content/images/gif.gif\" /> ... Loading");
            sb.AppendLine("    </strong>");
            sb.AppendLine("</div>");
            return new HtmlString(sb.ToString());
        }

        private IHtmlContent BuildPlaceholder()
        {
            return new HtmlString("<div id=\"voting-elections-placeholder\"></div>");
        }

        /// <summary>
        /// Loads the external scripts with a guard so they only load once per page,
        /// even if the component is accidentally rendered multiple times.
        /// </summary>
        private IHtmlContent BuildScriptIncludes()
        {
            var sb = new StringBuilder();
            sb.AppendLine("<script type=\"text/javascript\">");
            sb.AppendLine("(function () {");
            sb.AppendLine("    if (window.__electionScriptsLoaded) { return; }");
            sb.AppendLine("    window.__electionScriptsLoaded = true;");
            sb.AppendLine("");
            sb.AppendLine("    var scripts = [");
            sb.AppendLine("        '/SiteElements/ChannelShift/scripts/bundles/chart.bundle.min.js',");
            sb.AppendLine("        '/SiteElements/ChannelShift/scripts/services/chart/chartservices.js',");
            sb.AppendLine("        '/SiteElements/ChannelShift/scripts/services/elections/electionservices.js',");
            sb.AppendLine("        '/SiteElements/ChannelShift/scripts/services/accordion/accordionservices.js'");
            sb.AppendLine("    ];");
            sb.AppendLine("");
            sb.AppendLine("    // Load sequentially to preserve dependency order");
            sb.AppendLine("    (function loadNext(i) {");
            sb.AppendLine("        if (i >= scripts.length) {");
            sb.AppendLine("            // All scripts loaded - fire the init");
            sb.AppendLine("            if (typeof window.__electionInit === 'function') { window.__electionInit(); }");
            sb.AppendLine("            return;");
            sb.AppendLine("        }");
            sb.AppendLine("        var s = document.createElement('script');");
            sb.AppendLine("        s.src = scripts[i];");
            sb.AppendLine("        s.async = false;");
            sb.AppendLine("        s.onload = function () { loadNext(i + 1); };");
            sb.AppendLine("        s.onerror = function () {");
            sb.AppendLine("            console.error('Failed to load election script: ' + scripts[i]);");
            sb.AppendLine("            loadNext(i + 1);");
            sb.AppendLine("        };");
            sb.AppendLine("        document.head.appendChild(s);");
            sb.AppendLine("    })(0);");
            sb.AppendLine("})();");
            sb.AppendLine("</script>");
            sb.AppendLine("<noscript><p>Browser does not support script.</p></noscript>");
            return new HtmlString(sb.ToString());
        }

        /// <summary>
        /// Builds the inline initialisation script that uses the dynamic Google Sheet ID.
        /// The init is registered on window.__electionInit so the script loader can call it
        /// only after all dependencies have loaded.
        /// </summary>
        private IHtmlContent BuildInitialisationScript(string googleSheetId)
        {
            var encodedSheetId = System.Text.Json.JsonSerializer.Serialize(googleSheetId);

            var sb = new StringBuilder();
            sb.AppendLine("<script type=\"text/javascript\">");
            sb.AppendLine("window.__electionInit = function () {");
            sb.AppendLine("    $(document).ready(function () {");
            sb.AppendLine("");
            sb.AppendLine("        var cb = function (sheetId) {");
            sb.AppendLine("            if (sheetId !== null) {");
            sb.AppendLine("                electionservices.getSheet(sheetId);");
            sb.AppendLine("            }");
            sb.AppendLine("        };");
            sb.AppendLine("");
            sb.AppendLine("        var hexCodes = new Array();");
            sb.AppendLine("        hexCodes.push({ key: 'con', party: 'Conservative party', hexcolor: '#0087DC' });");
            sb.AppendLine("        hexCodes.push({ key: 'lab', party: 'Labour party', hexcolor: '#D5000D' });");
            sb.AppendLine("        hexCodes.push({ key: 'lib', party: 'Liberal Democatic Party', hexcolor: '#FAA61A' });");
            sb.AppendLine("        hexCodes.push({ key: 'gr', party: 'Green Party', hexcolor: '#6AB023' });");
            sb.AppendLine("        hexCodes.push({ key: 'uk', party: 'UK', hexcolor: '#6D3177' });");
            sb.AppendLine("        hexCodes.push({ key: 'in', party: 'Independent', hexcolor: '#830065' });");
            sb.AppendLine("        hexCodes.push({ key: 'ref', party: 'Reform UK', hexcolor: '#13bfd6' });");
            sb.AppendLine("        hexCodes.push({ key: 'ot', party: 'Others', hexcolor: '#E3E4E6' });");
            sb.AppendLine("        hexCodes.push({ key: 'blk', party: 'Blank', hexcolor: '#ccd2d5' });");
            sb.AppendLine("");
            sb.AppendLine($"        electionservices.init(window.chartservices, hexCodes, {encodedSheetId}, true);");
            sb.AppendLine("");
            sb.AppendLine("        accordionservices.callback(cb, null);");
            sb.AppendLine("");
            sb.AppendLine("        setInterval('electionservices.authRefresh()', 1000 * 300);");
            sb.AppendLine("    });");
            sb.AppendLine("};");
            sb.AppendLine("");
            sb.AppendLine("// If scripts were already loaded earlier on the page, fire immediately");
            sb.AppendLine("if (window.__electionScriptsLoaded && typeof electionservices !== 'undefined') {");
            sb.AppendLine("    window.__electionInit();");
            sb.AppendLine("}");
            sb.AppendLine("</script>");
            sb.AppendLine("</div>"); // close the .election-results-component wrapper
            return new HtmlString(sb.ToString());
        }

        #endregion
    }
}