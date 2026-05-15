using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Renderers.Components;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using System.Text.Encodings.Web;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class DividerHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly ViewComponentRenderer _renderer;

        public DividerHandler(ViewComponentRenderer renderer, ISerializationHelper serializer)
        {
            _renderer = renderer;
            _serializer = serializer;
        }

        public string ContentType => "Divider";

        public bool CanHandle(string className) => className == typeof(Divider).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the quote content
                var content = await _serializer.DeserializeAsync<Divider>(item);
                string temp = await _renderer.RenderAsync(ContentType, content);
                htmlContent.AppendHtml(temp);

            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Divider Handler: {ex.Message} -->");
            }

            return htmlContent;

        }


    }
}
