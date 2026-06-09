
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers;
using RazorPageBusinessWebsite.Helpers.Wrappers;



namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
        public class PostCodeSearchHandler : IContentHandler
        {
            private readonly ISerializationHelper _serializer;
            private readonly IHttpContextAccessor _httpContextAccessor;
            private readonly IConfiguration _configuration;

          

            public PostCodeSearchHandler(ISerializationHelper serializer, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
            {
                _serializer = serializer;
                _httpContextAccessor = httpContextAccessor;
                _configuration = configuration;
            }

            string IContentHandler.ContentType => throw new NotImplementedException();

            public bool CanHandle(string className) => className == typeof(PostCodeSearch).Name;

            public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
            {
                var htmlContent = new HtmlContentBuilder();
                var context = _httpContextAccessor.HttpContext;

            try
                {
                    var component = await _serializer.DeserializeAsync<PostCodeSearch>(item);
                    if (component == null)
                    {
                        htmlContent.AppendHtml("<!-- PostCodeSearch component deserialization failed -->");
                        return htmlContent;
                    }

                // Include the Handlebars template from the .inc file
                string filepath = "/SiteElements/ChannelShift/includes/handlebar-templates/postcode/postcode-search.inc";
                var templateHtml = await ResourceHelper.IncludeRawFileAsync(context, filepath);
                

                if (component == null)
                {
                    htmlContent.AppendHtml($"<!-- Include Raw file not found {filepath} -->");
                    return htmlContent;
                }
                htmlContent.AppendHtml(templateHtml);

                // 1. Output the HTML markup (structure + Handlebars template)
                if (!string.IsNullOrEmpty(component.HtmlContent))
                    {
                        htmlContent.AppendHtml(component.HtmlContent);
                    }

                    // 2. Output CSS link (if URL provided)
                    if (!string.IsNullOrEmpty(component.StyleSheet))
                    {
                        var version = "1.0.0"; // change this when CSS changes
                        var urlWithVersion = $"{component.StyleSheet}?v={version}";
                        htmlContent.AppendHtml($"<link rel=\"stylesheet\" href=\"{urlWithVersion}\"/>");
                    }

                    // 3. Output JavaScript (if URL provided)
                    if (!string.IsNullOrEmpty(component.JavaScript))
                    {
                        htmlContent.AppendHtml($"<script src=\"{component.JavaScript}\"></script>");
                    }
                }
                catch (Exception ex)
                {
                    htmlContent.AppendHtml($"<!-- Error processing PostCodeSearch Handler: {ex.Message} -->");
                }

                return htmlContent;
            }

         
    }
    
}
