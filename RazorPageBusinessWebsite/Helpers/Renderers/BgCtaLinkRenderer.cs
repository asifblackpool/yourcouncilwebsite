using Content.Modelling.Models.Components.Data;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using System.Text;

namespace RazorPageBusinessWebsite.Helpers.Renderers
{
    public class BgCtaLinkRenderer : IBgCtaLinkRenderer
    {
        private readonly IHtmlHelper _htmlHelper;

        // Inject IHtmlHelper in the constructor
        public BgCtaLinkRenderer(IHtmlHelper htmlHelper)
        {
            _htmlHelper = htmlHelper;
        }

        public async Task<IHtmlContent> RenderBgCtaButtonAsync(BGCTALink cta, string buttonClass)
        {
            if (cta == null)
                return HtmlString.Empty;

            await Task.Delay(100); // Replace with actual async work if needed

            // Assuming RenderBgCtaButton returns TagBuilder
            var buttonTag = _htmlHelper.RenderBgCtaButton(cta, buttonClass);

            // TagBuilder implements IHtmlContent, so we can use it directly
            var container = new HtmlContentBuilder();
            container.AppendHtml("<div class=\"button-container\">");
            container.AppendHtml(buttonTag); // TagBuilder can be appended directly
            container.AppendHtml("</div>");

            return container;
        }
    }
}
