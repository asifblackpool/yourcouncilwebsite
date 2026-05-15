using Content.Modelling.Helpers;
using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Lists;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json.Linq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;
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

        public bool CanHandle(string className) => className == typeof(CanvasListItem).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();
            var canvasItem = item.Content;

            if (canvasItem == null)
            {
                return htmlContent;
            }

            try
            {
                if (canvasItem != null)
                {
                    string? content = canvasItem == null ? string.Empty : canvasItem.ToString();
                    JToken token = JToken.Parse(content.SafeString());

                    if (token.Type == JTokenType.Array)
                    {
                        var html = await HandleArrayTokenAsync(token);
                        htmlContent.AppendHtml(html);
                    }
                    else if (token.Type == JTokenType.Object)
                    {
                        var items = await _serializer.DeserializeAsync<List<CanvasListItem>>(item);
                        if (items != null)
                        {
                            htmlContent.AppendHtml(await HandleDeserializedItemsAsync(items));
                        }
                    }
                }
                else
                {
                    return htmlContent;
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing CanvasListItem: {ex.Message} -->");
            }

            return htmlContent;
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

        private async Task<IHtmlContent> ProcessValueTokenAsync(JToken? valueToken)
        {
            var content = new HtmlContentBuilder();

            if (valueToken == null) return content;

            switch (valueToken.Type)
            {
                case JTokenType.String:
                    content.Append(await _textProcessor.ProcessAsync(valueToken.ToString()));
                    break;

                case JTokenType.Array:
                    var innerUl = new TagBuilder("ul");
                    foreach (var subItem in valueToken)
                    {
                        var innerLi = new TagBuilder("li");
                        innerLi.InnerHtml.AppendHtml(await ProcessValueTokenAsync(subItem["value"]));
                        innerUl.InnerHtml.AppendHtml(innerLi);
                    }
                    content.AppendHtml(innerUl);
                    break;

                case JTokenType.Object:
                    foreach (JProperty prop in valueToken)
                    {
                        var propDiv = new TagBuilder("div");
                        propDiv.InnerHtml.AppendHtml(
                            $"<strong>{prop.Name}:</strong> {await _textProcessor.ProcessAsync(prop.Value.ToString())}");
                        content.AppendHtml(propDiv);
                    }
                    break;

                default:
                    content.AppendHtml(await _textProcessor.ProcessAsync(valueToken.ToString()));
                    break;
            }

            return content;
        }

        private async Task<IHtmlContent> HandleDeserializedItemsAsync(List<CanvasListItem> items)
        {
            var ul = new TagBuilder("ul");
            ul.AddCssClass("shade-black");

            foreach (var canvasItem in items)
            {
                var li = new TagBuilder("li");

                switch (canvasItem.Content)
                {
                    case SimpleValue simple:
                        li.InnerHtml.Append(await _textProcessor.ProcessAsync(simple.Text));
                        break;

                    case ComplexValue complex:
                        var objFragment = (ComplexValue)canvasItem.Content;
                        if (objFragment != null && objFragment.Fragments != null)
                        {
                            List<ContentFragment> fragments = objFragment.Fragments;
                            li.InnerHtml.AppendHtml(
                                await _contentFragmentHelper.BuildHtmlFragmentAsync(fragments, "<li>{0}</li>")
                            );
                        }

                        break;

                    default:
                        throw new InvalidOperationException("Unknown content type");
                }

                ul.InnerHtml.AppendHtml(li);
            }

            return ul;
        }
    }
}
