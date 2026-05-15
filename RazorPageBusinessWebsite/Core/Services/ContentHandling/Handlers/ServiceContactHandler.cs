using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Html;
using RazorPageBusinessWebsite.Helpers.Wrappers;

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
                // Deserialize the quote content
                var serviceContact = await _serializer.DeserializeAsync<ServiceContact>(item);

                if (serviceContact != null)
                {
                    // Example 1: Basic usage
                    //htmlContent.AppendServiceContact(serviceContact);

                    // Example 2: With custom options
                    var options = new ServiceContactOptions
                    {
                        ServiceTypeText = "Blackpool Council Service",
                        ShowOpeningHours = false,
                        AdditionalInfo = "Response time: 3-5 working days",
                        PhonePriority = PhoneNumberPriority.FirstNonEmpty,
                        Layout = ContactLayout.Cards,
                        AdditionalCssClasses = "my-service-contact"
                    };

                    //htmlContent.AppendServiceContact(serviceContact, options);

                    // Example 3: Minimal display for sidebars
                    var minimalOptions = new ServiceContactOptions
                    {
                        ShowServiceType = false,
                        ShowSectionTitles = false,
                        CompactMode = true,
                        ContainerCssClass = "service-contact-sidebar"
                    };

                    htmlContent.AppendServiceContact(serviceContact, minimalOptions);

                    // Example 4: String extension usage
                    //var htmlString = serviceContact.ToContactCardHtml();

                    // Or with options
                    var htmlStringWithOptions = serviceContact.ToContactCardHtml(options);
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
