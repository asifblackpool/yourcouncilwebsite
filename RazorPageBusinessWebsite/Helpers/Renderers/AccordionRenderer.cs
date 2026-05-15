using Content.Modelling.Helpers;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using RazorPageBusinessWebsite.Helpers.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using System;

namespace RazorPageBusinessWebsite.Helpers.Renderers
{
    public class AccordionRenderer : IAccordionRenderer
    {
        public IHtmlContent Render(string accordionName, List<AccordionContent> items)
        {
            var accordion = new TagBuilder("div");
            accordion.AddCssClass("accordion");
            accordion.Attributes.Add("id", accordionName.Replace(" ", "_"));

            int counter = 1;
            foreach (var item in items)
            {
                var itemDiv = new TagBuilder("div");
                itemDiv.AddCssClass("accordion-item");

                /*
                    <div class="accordion">
                        <div class="accordion-item">
                            <button aria-controls="accordion-content-1" aria-expanded="false" class="accordion-header">
		                        <span>1. Details of the final venue for your ceremony</span><span class="arrow"></span>
	                        </button>
                            <div class="accordion-content" id="accordion-content-1" style="display: none;">
		                        <p>content to go here</p>
	                        </div>
                        </div>
                    </div>

                */

                //build Button
                var button = new TagBuilder("button");
                button.AddCssClass("accordion-header");
                button.Attributes.Add("type", "button");
                button.Attributes.Add("aria-controls", "accordion-content"+ counter);
                button.Attributes.Add("aria-expanded", "false");
                button.InnerHtml.AppendHtml(counter.BuildSpans(item.Title.SafeString()));
                itemDiv.InnerHtml.AppendHtml(button);

                // Build Body Content
                var body = new TagBuilder("div");
                body.AddCssClass("accordion-content");
                body.Attributes.Add("id", "accordion-content" + counter);
                body.Attributes.Add("style", "display:none;");
                body.InnerHtml.AppendHtml(item.Body.SafeString());

                itemDiv.InnerHtml.AppendHtml(body);

                accordion.InnerHtml.AppendHtml(itemDiv);
                counter++;
            }

            return accordion;
        }
    }
}
