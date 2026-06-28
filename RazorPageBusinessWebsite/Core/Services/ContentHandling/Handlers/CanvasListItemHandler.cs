using Content.Modelling.Helpers;
using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Lists;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json.Linq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageBusinessWebsite.Helpers.Extensions;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class CanvasListItemHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly ITextProcessor _textProcessor;
        private readonly IContentFragmentHelper _contentFragmentHelper;

        public CanvasListItemHandler(
            ISerializationHelper serializer,
            ITextProcessor textProcessor,
            IContentFragmentHelper contentFragmentHelper)
        {
            _serializer = serializer;
            _textProcessor = textProcessor;
            _contentFragmentHelper = contentFragmentHelper;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
        {
            return className == typeof(CanvasListItem).Name ||
                   className == typeof(CanvasListBlock).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();
            var canvasItem = item.Content;

            if (canvasItem == null)
                return htmlContent;

            try
            {
                string? content = canvasItem.ToString();
                JToken token = JToken.Parse(content.SafeString());

                if (token.Type == JTokenType.Array)
                {
                    // Handle array of list items
                    var html = await HandleArrayTokenAsync(token);
                    htmlContent.AppendHtml(html);
                }
                else if (token.Type == JTokenType.Object)
                {
                    // Try deserializing as CanvasListBlock first
                    try
                    {
                        var listBlock = await _serializer.DeserializeAsync<CanvasListBlock>(item);
                        if (listBlock != null)
                        {
                            // Use the recursive renderer for full list blocks
                            htmlContent.AppendHtml(await HandleListBlockAsync(listBlock));
                        }
                    }
                    catch
                    {
                        // Fallback to deserializing as list of items
                        var items = await _serializer.DeserializeAsync<CanvasListBlock>(item);
                        if (items != null)
                        {
                            htmlContent.AppendHtml(await HandleDeserializedItemsAsync(items));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing CanvasList Block Item: {ex.Message} -->");
            }

            return htmlContent;
        }

        // 👇 FIXED: No async keyword, returns Task<IHtmlContent> synchronously
        private Task<IHtmlContent> HandleListBlockAsync(CanvasListBlock listBlock)
        {
            string html = listBlock.RenderHtmlRecursive("shade-black");
            return Task.FromResult<IHtmlContent>(new HtmlString(html));
        }


        private async Task<IHtmlContent> HandleArrayTokenAsync(JToken token)
        {
            await Task.CompletedTask;
            
            var ul = new TagBuilder("ul");
            ul.AddCssClass("shade-black");

            foreach (JToken jItem in token)
            {
                JToken? valueToken = jItem["value"];
                var html = CanvasListItemRenderer.RenderTextWithLinks(valueToken);

                var li = new TagBuilder("li");
                li.InnerHtml.AppendHtml(html);
                ul.InnerHtml.AppendHtml(li);
            }

            return ul;
        }

        // 👇 FIXED: No async keyword, returns Task<IHtmlContent> synchronously
        private Task<IHtmlContent> HandleDeserializedItemsAsync(CanvasListBlock listBlock)
        {
            string html = listBlock.RenderHtmlRecursive("shade-black");
            return Task.FromResult<IHtmlContent>(new HtmlString(html));
        }
    }
}