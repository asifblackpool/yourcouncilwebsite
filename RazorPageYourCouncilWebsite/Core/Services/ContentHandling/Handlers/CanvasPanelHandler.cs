using Content.Modelling.Models.Canvas.Panels;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class CanvasPanelHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly ICanvasPanelHelper _panelHelper;

        public CanvasPanelHandler(ISerializationHelper serializer, ICanvasPanelHelper panelHelper)
        {
            _serializer = serializer;
            _panelHelper = panelHelper;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className) => className == typeof(CanvasPanel).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the panel content
                var panel = await _serializer.DeserializeAsync<CanvasPanel>(item);

                if (panel != null)
                {
                    // Build and append the panel HTML
                    var panelHtml = _panelHelper.BuildPanel(panel);
                    htmlContent.AppendHtml(panelHtml);
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing CanvasPanelComplex handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
