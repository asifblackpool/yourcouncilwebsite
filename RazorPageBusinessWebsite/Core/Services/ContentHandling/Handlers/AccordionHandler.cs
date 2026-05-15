using Content.Modelling.Models.Accordions;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class AccordionHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly IGovUkAccordionRenderer _accordionRenderer;

        public AccordionHandler(ISerializationHelper serializer, IGovUkAccordionRenderer accordionRenderer)
        {
            _serializer = serializer;
            _accordionRenderer = accordionRenderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className) => className == typeof(Accordion).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the accordion content
                var accordion = await _serializer.DeserializeAsync<Accordion>(item);

                if (accordion != null)
                {
                    // Get accordion content items
                    var accordionList = accordion.GetSerialisedContent();
                    var accordionName = accordion.AccordionName ?? string.Empty;

                    // Render the accordion

                    var renderedAccordion = _accordionRenderer.RenderGovUkAccordion(accordionName, accordionList);
                    htmlContent.AppendHtml(renderedAccordion);
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Accordion Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
