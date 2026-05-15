using Content.Modelling.Models.Canvas.Quote;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    public class QuoteHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;

        public QuoteHandler(ISerializationHelper serializer)
        {
            _serializer = serializer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className) => className == typeof(Quote).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the quote content
                var quoteItem = await _serializer.DeserializeAsync<Quote>(item);

                if (quoteItem?.Value != null)
                {
                    // Wrap the quote in a <blockquote> for styling
                    htmlContent.AppendHtml("<blockquote class=\"quote\">");
                    htmlContent.AppendHtml(quoteItem.Value);
                    htmlContent.AppendHtml("</blockquote>");
                }
                else
                {
                    htmlContent.AppendHtml("<!-- Error: Quote content is null -->");
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Quote Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
