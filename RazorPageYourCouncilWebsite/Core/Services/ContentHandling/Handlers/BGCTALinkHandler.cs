using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Components.Data;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class BGCTALinkHandler : IContentHandler
    {
        private readonly IBgCtaLinkRenderer _ctaRenderer;

        public BGCTALinkHandler(IBgCtaLinkRenderer ctaRenderer)
        {
            _ctaRenderer = ctaRenderer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
        {
            return className == typeof(BGCTALink).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            if (item?.Content == null)
                return HtmlString.Empty;

            try
            {
                var result = JsonConvert.DeserializeObject<BGCTALink>(item.Content);
                if (result == null)
                    return HtmlString.Empty;

                return await _ctaRenderer.RenderBgCtaButtonAsync(result, "standard-link-button");
            }
            catch (Exception ex)
            {
                // Log error here
                return new HtmlString($"<!-- Error processing BGCTALink: {ex.Message} -->");
            }
        }
    }
}
