using Content.Modelling.Models.Components.Data;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace RazorPageBusinessWebsite.Helpers
{
    public static class BgCtaHtmlHelper
    {
        public static IHtmlContent RenderBgCtaButton(this IHtmlHelper htmlHelper, BGCTALink ctaModel, string cssclass)
        {
            if (ctaModel == null)
                return HtmlString.Empty;

            // Determine link URL
            var url = !string.IsNullOrEmpty(ctaModel.ExternalLink)
                ? ctaModel.ExternalLink
                : ctaModel.WebsitePage?.Sys?.Uri;

            if (string.IsNullOrEmpty(url))
                return HtmlString.Empty;

            // Extract hex colors (e.g., "#ffdd00" from "#ffdd00 (Yellow)")
            var bgColor = ctaModel.ButtonColor?.Split(' ').FirstOrDefault() ?? "#ffdd00";
            var textColor = ctaModel.ButtonTextColor?.Split(' ').FirstOrDefault() ?? "#041c2c";

            // Build button tag
            var buttonTag = new TagBuilder("a");
            buttonTag.AddCssClass(string.Format("{0}", cssclass));
            buttonTag.Attributes["href"] = url;
            buttonTag.Attributes["style"] = $"background-color: {bgColor}; color: {textColor};";
            buttonTag.Attributes["role"] = "button";
            if (ctaModel.ButtonText != null)
            {
                buttonTag.InnerHtml.Append(ctaModel.ButtonText);
            }
          

            // Add ARIA label if text is present
            if (!string.IsNullOrEmpty(ctaModel.ButtonText))
            {
                buttonTag.Attributes["aria-label"] = ctaModel.ButtonText;
            }

            // Handle external links
            if (!string.IsNullOrEmpty(ctaModel.ExternalLink))
            {
                //buttonTag.Attributes["target"] = "_blank";
                buttonTag.Attributes["rel"] = "noopener noreferrer";
            }

            return buttonTag;
        }
    }
}
