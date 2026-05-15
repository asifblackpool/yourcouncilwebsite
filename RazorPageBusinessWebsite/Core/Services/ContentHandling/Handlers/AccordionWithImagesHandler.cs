using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Renderers;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class AccordionWithImagesHandler : IContentHandler
    {
        private readonly IGovUkAccordionWithImagesRenderer _accordionRenderer;
       

        public AccordionWithImagesHandler(IGovUkAccordionWithImagesRenderer accordionRenderer)
        {
            _accordionRenderer = accordionRenderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
        {
            return className == typeof(AccordionContentWithImages).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            if (!CanHandle(item?.ClassName) || string.IsNullOrEmpty(item.Content))
            {
                return htmlContent;
            }

            try
            {
                if (!CanHandle(item?.ClassName) || string.IsNullOrEmpty(item.Content))
                    return HtmlString.Empty;

                // Parse and deserialize
                var content = item.Content.Trim();
                var jsonObject = JObject.Parse(content);
                var accordionArray = jsonObject[ComponentKeys.ACCORDION_CONTENT_IMAGES];

                if (accordionArray == null)
                    return HtmlString.Empty;

                var allItems = accordionArray.ToObject<List<AccordionContentWithImages>>();

                if (allItems == null || !allItems.Any())
                    return HtmlString.Empty;

                // Render and return directly
                return _accordionRenderer.RenderGovUkAccordion(string.Empty, allItems);
            }
            catch (Exception ex)
            {
                // Log the error properly
                Console.WriteLine($"AccordionWithImagesHandler error: {ex.Message}");
                return HtmlString.Empty;
            }
        }
    }
}
