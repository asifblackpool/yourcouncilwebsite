using Content.Modelling.Helpers;
using Content.Modelling.Models.Canvas.Images;
using Content.Modelling.Models.Canvas.Paragraphs;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageBusinessWebsite.Helpers.Serialisation;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class CanvasParagraphHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly ITextProcessor _textProcessor;

        public CanvasParagraphHandler(ISerializationHelper serializer, ITextProcessor textProcessor)
        {
            _serializer = serializer;
            _textProcessor = textProcessor;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className) => className == typeof(CanvasParagraph).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var objItem = await _serializer.DeserializeAsync<CanvasParagraph>(item);

            if (objItem != null)
            {
                var processedText = await _textProcessor.ProcessAsync(objItem?.Value);
                if (objItem?.Properties != null && objItem.Properties.ParagraphType == "lead")
                {
                    return new HtmlString($"<p class=\"shade-black lead-paragraph\">{processedText}</p>");
                }
                else
                {
                    return new HtmlString($"<p class=\"shade-black\">{processedText}</p>");
                }

            }


            return new HtmlString($"");
        }
    }
}
