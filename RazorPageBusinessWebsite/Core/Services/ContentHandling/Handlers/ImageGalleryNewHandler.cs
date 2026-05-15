using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Renderers.Components;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class ImageGalleryNewHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly ViewComponentRenderer _renderer;

        public ImageGalleryNewHandler(ViewComponentRenderer renderer, ISerializationHelper serializer)
        {
            _renderer = renderer;
            _serializer = serializer;
        }

        public string ContentType => ComponentKeys.IMAGE_GALLERY_NEW;

        public bool CanHandle(string className) => className == typeof(MultipleImages).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the quote content
                var content = await _serializer.DeserializeAsync<MultipleImages>(item);
                string temp = await _renderer.RenderAsync(ContentType, content);
                htmlContent.AppendHtml(temp);

            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Image Gallery new Handler: {ex.Message} -->");
            }

            return htmlContent;

        }
    }
}
