// Core/Services/ContentHandling/Handlers/AccordionWithCtaHandler.cs (Simplified)
using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class AccordionWithCtaHandler : IContentHandler
    {
        private readonly IGovUkAccordionWithCtaButtonRenderer _accordionRenderer;

        public AccordionWithCtaHandler(IGovUkAccordionWithCtaButtonRenderer accordionRenderer)
        {
            _accordionRenderer = accordionRenderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
        {
            return className == typeof(AccordionWithCTAContent).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            if (string.IsNullOrEmpty(item.Content))
                return HtmlString.Empty;

            try
            {
                List<AccordionWithCTAContent> accordionItems;
                // Do this:
            

                // Get all items:
        
                var content = item.Content.Trim();
                var jsonObject = JObject.Parse(content);
                var accordionArray = jsonObject[ComponentKeys.ACCORDION_CONTENT_CTA];

                // Get all items:
                var allItems = accordionArray?.ToObject<List<AccordionWithCTAContent>>();

               
                if (allItems?.Count == 0)
                    return HtmlString.Empty;

                string accordionTitle = allItems?.First().Title
                    ?? "Accordion";

                bool rememberExpanded = allItems?.Count > 3;

                var options = new GovUkAccordionOptions
                {
                    AccordionId = $"accordion-{Guid.NewGuid():N}",
                    RememberExpandedState = rememberExpanded
                };

                if (allItems == null) 
                    return HtmlString.Empty;

                var temp = _accordionRenderer.RenderGovUkAccordion(accordionTitle, allItems, options);

                return temp;
            }
            catch
            {
                return new HtmlString("<!-- Error rendering accordion with Cta button -->");
            }
        }
    }
}