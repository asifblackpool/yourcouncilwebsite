using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Html;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using RazorPageBusinessWebsite.Helpers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class ServiceContactHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;

        public ServiceContactHandler(ISerializationHelper serializer)
        {
            _serializer = serializer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

    
        public bool CanHandle(string className) => className == typeof(ServiceContact).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                var serviceContact = await _serializer.DeserializeAsync<ServiceContact>(item);

                if (serviceContact != null)
                {
                    // Use the sidebar display (your current implementation)
                    htmlContent.AppendServiceContact(serviceContact, ServiceContactHelper.SidebarOptions);

                    // If you also want the HTML string with default options (for logging, storing, etc.)
                    var htmlStringWithOptions = ServiceContactHelper.Render(serviceContact, ServiceContactHelper.DefaultOptions);

                    // You could also append it if needed:
                    // htmlContent.AppendHtml(htmlStringWithOptions);
                }
                else
                {
                    htmlContent.AppendHtml("<!-- Error: Service Contact is null -->");
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Service Contact Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
