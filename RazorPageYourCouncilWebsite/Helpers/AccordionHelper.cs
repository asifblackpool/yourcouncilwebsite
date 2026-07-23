using Content.Modelling.Helpers;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Net.NetworkInformation;

namespace RazorPageYourCouncilWebsite.Helpers
{


public static class AccordionHelper
    {
        public static IHtmlContent RenderAccordion(this IHtmlHelper htmlHelper,
            string accordionName,
            IEnumerable<AccordionContent> accordionList)
        {
            if (accordionList == null || !accordionList.Any())
            {
                return HtmlString.Empty;
            }

            var container = new TagBuilder("div");
            container.AddCssClass("accordion-container");

            // Add accordion name/title
            var heading = new TagBuilder("h2");
            heading.InnerHtml.Append(accordionName);
            container.InnerHtml.AppendHtml(heading);

            // Create accordion container
            var accordion = new TagBuilder("div");
            accordion.AddCssClass("accordion");

            int counter = 1;
            foreach (var item in accordionList)
            {
                var accordionItem = CreateAccordionItem(item, counter);
                accordion.InnerHtml.AppendHtml(accordionItem);
                counter++;
            }

            container.InnerHtml.AppendHtml(accordion);
            return container;
        }

        private static TagBuilder CreateAccordionItem(AccordionContent item, int index)
        {
            var itemContainer = new TagBuilder("div");
            itemContainer.AddCssClass("accordion-item");

            // Create header button
            var header = new TagBuilder("button");
            header.AddCssClass("accordion-header");
            header.Attributes.Add("aria-expanded", "false");
            header.Attributes.Add("aria-controls", $"accordion-content-{index}");

            var titleSpan = new TagBuilder("span");
            titleSpan.InnerHtml.Append(item.Title.SafeString());
            header.InnerHtml.AppendHtml(titleSpan);

            var strongTag = new TagBuilder("strong");
            strongTag.InnerHtml.Append("Show");

            var arrowSpan = new TagBuilder("span");
            arrowSpan.AddCssClass("arrow");

            arrowSpan.InnerHtml.Append("+ ");            
            arrowSpan.InnerHtml.AppendHtml(strongTag);   // ✅ use Append, not direct assignmen
            header.InnerHtml.AppendHtml(arrowSpan);

            // Create content div
            var content = new TagBuilder("div");
            content.AddCssClass("accordion-content");
            content.Attributes.Add("id", $"accordion-content-{index}");
            content.InnerHtml.AppendHtml(item.Body.SafeString());

            itemContainer.InnerHtml.AppendHtml(header);
            itemContainer.InnerHtml.AppendHtml(content);

            return itemContainer;
        }
    }
}
