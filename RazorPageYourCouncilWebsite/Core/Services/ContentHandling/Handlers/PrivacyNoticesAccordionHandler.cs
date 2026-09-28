using System.Threading.Tasks;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class PrivacyNoticesAccordionHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly IPrivacyNoticesAccordionRenderer _renderer;

        public PrivacyNoticesAccordionHandler(
            ISerializationHelper serializer,
            IPrivacyNoticesAccordionRenderer renderer)
        {
            _serializer = serializer;
            _renderer = renderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
            => className == typeof(PrivacyNoticesAccordionComponent).Name;

        public Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            throw new InvalidOperationException("PrivacyNoticesAccordionHandler requires ViewContext. " + "Ensure the Canvas view calls HandleAsync(item, ViewContext).");
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item, ViewContext viewContext)
        {
            var model = await _serializer.DeserializeAsync<PrivacyNoticesAccordionComponent>(item);

            if (model == null
                || string.IsNullOrWhiteSpace(model.Title)
                || string.IsNullOrWhiteSpace(model.Label))
            {
                return HtmlString.Empty;
            }

            return await _renderer.RenderAsync(model.Title, model.Label, viewContext);
        }
    }
}