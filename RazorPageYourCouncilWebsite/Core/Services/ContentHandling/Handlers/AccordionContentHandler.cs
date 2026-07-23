// Core/Services/ContentHandling/Handlers/AccordionWithCtaHandler.cs (Simplified)
using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class AccordionContentHandler : IContentHandler
    {
        private readonly IGovUkAccordionRenderer _accordionRenderer;

        public AccordionContentHandler(IGovUkAccordionRenderer accordionRenderer)
        {
            _accordionRenderer = accordionRenderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
        {
            return className == typeof(AccordionContent).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            if (string.IsNullOrEmpty(item.Content))
                return HtmlString.Empty;

            try
            {
                List<IGovUkAccordionRenderer> accordionItems;
                // Do this:


                // Get all items:

                var content = item.Content.Trim();
                var jsonObject = JObject.Parse(content);
                var accordionArray = jsonObject[ComponentKeys.ACCORDION_CONTENT];

                AccordionContent? accordion = null;

                // Get all item
                if (accordionArray != null)
                {
                    accordion = accordionArray?.ToObject<AccordionContent>();
                }
                else
                {
                    if (item.Key == ComponentKeys.ACCORDION_CONTENT)
                    {
                        accordion = jsonObject?.ToObject<AccordionContent>();
                    }
                    else
                    {
                        accordion = new AccordionContent();
                    }
                    
                }
           


                if (accordion?.Body == string.Empty)
                    return HtmlString.Empty;

                string accordionTitle = accordion?.Title ?? "Accordion";

                bool? rememberExpanded = accordion?.IsExpanded;

                var options = new GovUkAccordionOptions
                {
                    AccordionId = $"accordion-{Guid.NewGuid():N}",
                    RememberExpandedState = (rememberExpanded == null) ? false : (bool)rememberExpanded
                };

                if (accordion== null)
                    return HtmlString.Empty;

                List<AccordionContent> accordionContentList = new List<AccordionContent>();
                accordionContentList.Add(accordion);
                var temp = _accordionRenderer.RenderGovUkAccordion(accordionTitle, accordionContentList, options);

                return temp;
            }
            catch
            {
                return new HtmlString("<!-- Error rendering accordion content -->");
            }
        }
    }
}