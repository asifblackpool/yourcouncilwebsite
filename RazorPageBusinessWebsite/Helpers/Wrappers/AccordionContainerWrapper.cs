using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Tables;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text;

namespace RazorPageBusinessWebsite.Helpers.Wrappers
{
    public static class AccordionContainerWrapper
    {
        public static IHtmlContent BuildContainer(IHtmlContent content)
        {
            var wrapperDiv = new TagBuilder("div");
            wrapperDiv.AddCssClass("accordion-responsive-wrapper");
            wrapperDiv.Attributes["data-accordion-container"] = "true";

            var innerDiv = new TagBuilder("div");
            innerDiv.AddCssClass("accordion-responsive-inner");

    
            innerDiv.InnerHtml.SetHtmlContent(content);
           

            wrapperDiv.InnerHtml.AppendHtml(innerDiv);

            return wrapperDiv;
        }
    }
}
