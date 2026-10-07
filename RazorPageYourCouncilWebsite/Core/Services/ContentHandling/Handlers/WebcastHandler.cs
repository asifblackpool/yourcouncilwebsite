
using content.modelling.Models.Components;
using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
 {
    public class WebcastHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly IWebCastRenderer _renderer;

        public WebcastHandler(ISerializationHelper serializer,IWebCastRenderer renderer)
        {
            _serializer = serializer;
            _renderer = renderer;
        }

        string IContentHandler.ContentType => ComponentKeys.WEBCAST;

        public bool CanHandle(string className)
            => string.Equals(className, typeof(WebCast).Name, StringComparison.OrdinalIgnoreCase)
            || string.Equals(className, ComponentKeys.WEBCAST, StringComparison.OrdinalIgnoreCase);

        public Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            throw new InvalidOperationException("WebcastHandler requires ViewContext. " + "Ensure the Canvas view calls HandleAsync(item, ViewContext).");
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item, ViewContext viewContext)
        {
            var model = await _serializer.DeserializeAsync<WebCast>(item);

            // The webcast renders even with no override — the view falls
            // back to the default copy.
            return await _renderer.RenderAsync(model?.IntroOverride, viewContext);
        }
    }
}

