using Content.Modelling.Models.GenericTypes;
using global::RazorPageBusinessWebsite.Core.Models.Components;
using global::RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using global::RazorPageBusinessWebsite.Helpers.Wrappers;
using global::RazorPageBusinessWebsite.Helpers;
    // File: Core/Services/ContentHandling/Handlers/SearchTemplateAppHandler.cs
using Microsoft.AspNetCore.Html;


    namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
    {
        public class SearchTemplateAppHandler : IContentHandler
        {
            private readonly ISerializationHelper _serializer;
            private readonly IHttpContextAccessor _httpContextAccessor;
            private readonly IConfiguration _configuration;

            public SearchTemplateAppHandler(ISerializationHelper serializer,IHttpContextAccessor httpContextAccessor,IConfiguration configuration)
            {
                _serializer = serializer;
                _httpContextAccessor = httpContextAccessor;
                _configuration = configuration;
            }

            string IContentHandler.ContentType => throw new NotImplementedException();

            public bool CanHandle(string className) => className == typeof(SearchTemplateApp).Name;

            public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
            {
                var html = new HtmlContentBuilder();
                var context = _httpContextAccessor.HttpContext;
                if (context == null) return html;

                var component = await _serializer.DeserializeAsync<SearchTemplateApp>(item);
                if (component == null)
                {
                    html.AppendHtml("<!-- SearchTemplateApp deserialization failed -->");
                    return html;
                }

                // ------------------------------------------------------------
                // 1. Register common dependencies (once per page)
                // ------------------------------------------------------------
                ResourceHelper.AddStyle(context, "/SiteElements/ChannelShift/content/styles/jquery/jquery-ui.min.css");
                ResourceHelper.AddScript(context, "/SiteElements/ChannelShift/scripts/jquery-ui.min.js");
                ResourceHelper.AddScript(context, "/SiteElements/ChannelShift/scripts/bootstrap-select.min.js");
                ResourceHelper.AddScript(context, "/SiteElements/ChannelShift/scripts/services/pagingservices.js");

                // Google Maps (only if an API key is available)
                var apiKey = !string.IsNullOrEmpty(component.GoogleMapsApiKey)
                    ? component.GoogleMapsApiKey
                    : _configuration["GoogleMaps:ApiKey"] ?? "";
                if (!string.IsNullOrEmpty(apiKey))
                    ResourceHelper.AddScript(context, $"https://maps.googleapis.com/maps/api/js?key={apiKey}");
                    ResourceHelper.AddScript(context, "/SiteElements/ChannelShift/scripts/services/maps/mapservices.js");

                // ------------------------------------------------------------
                // 2. Register app‑specific scripts
                // ------------------------------------------------------------
                if (!string.IsNullOrEmpty(component.CustomServiceScript))
                    ResourceHelper.AddScript(context, component.CustomServiceScript);

                if (!string.IsNullOrEmpty(component.CustomRunScript))
                    ResourceHelper.AddInlineScript(context, component.CustomRunScript);

                // ------------------------------------------------------------
                // 3. Output HTML markup (wrapped with data-app-id)
                // ------------------------------------------------------------
                var appId = string.IsNullOrEmpty(component.AppId) ? "search" : component.AppId;
                if (!string.IsNullOrEmpty(component.HtmlSnippetUrl))
                {
                    var snippetHtml = await ResourceHelper.IncludeHtmlSnippetAsync(context, component.HtmlSnippetUrl);
                    html.AppendHtml(snippetHtml);
                }

                // ------------------------------------------------------------
                // 4. Output Handlebars result template
                // ------------------------------------------------------------
                if (!string.IsNullOrEmpty(component.HandlebarsTemplate))
                {
                    html.AppendHtml($@"{component.HandlebarsTemplate}");
                }

                // ------------------------------------------------------------
                // 5. Output pagination template (use default if none provided)
                // ------------------------------------------------------------
                html.AppendHtml($@"{component.PaginationTemplate}");

                return html;
            }

          
        }
    }

