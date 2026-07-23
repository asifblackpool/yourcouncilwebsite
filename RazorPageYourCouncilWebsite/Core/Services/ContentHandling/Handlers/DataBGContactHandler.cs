using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Html;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using content.modelling.Models.Data;
using RazorPageYourCouncilWebsite.Helpers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
   

    public class DataBGContactPanelHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;

        public DataBGContactPanelHandler(ISerializationHelper serializer)
        {
            _serializer = serializer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();


        public bool CanHandle(string className) => className == typeof(DataBGContactPanel).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the quote content
                var dataBGContact = await _serializer.DeserializeAsync<DataBGContactPanel>(item);

                if (dataBGContact != null)
                {
                    ServiceContact sc   = new ServiceContact();
                    sc.ServiceName      = dataBGContact.ServiceName;
                    sc.Telephone1       = dataBGContact.PhoneNumber11;
                    sc.Telephone2       = dataBGContact.PhoneNumber1;
                    sc.Telephone3       = dataBGContact.PhoneNumber2;
                    sc.Address          = dataBGContact.Address;
                    sc.EmailAddress     = dataBGContact.EmailAddress;
                    sc.Notes            = dataBGContact.Notes;

               
                    // Use the sidebar display (your current implementation)
                    htmlContent.AppendServiceContact(sc, ServiceContactHelper.SidebarOptions);

                    // If you also want the HTML string with default options (for logging, storing, etc.)
                    //var htmlStringWithOptions = ServiceContactHelper.Render(sc, ServiceContactHelper.DefaultOptions);

                    // You could also append it if needed:
                    // htmlContent.AppendHtml(htmlStringWithOptions);
                }
                else
                {
                    htmlContent.AppendHtml("<!-- Error: Data BG Contact is null -->");
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Data BG Contact Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
