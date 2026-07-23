
    using Microsoft.AspNetCore.Html;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Content.Modelling.Models.Components;
    using System.Text.Encodings.Web;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;


namespace RazorPageYourCouncilWebsite.Helpers.Renderers
    {
        public class GovUkAccordionRenderer : IGovUkAccordionRenderer
        {
            private readonly IHtmlHelper _htmlHelper;
            private readonly HtmlEncoder _htmlEncoder;
            private readonly ILogger<GovUkAccordionRenderer> _logger;

            public GovUkAccordionRenderer(IHtmlHelper htmlHelper, HtmlEncoder htmlEncoder, ILogger<GovUkAccordionRenderer> logger)
            {
                _htmlHelper = htmlHelper;
                _htmlEncoder = htmlEncoder;
                _logger = logger;
            }

            public IHtmlContent RenderGovUkAccordion(string accordionTitle, List<AccordionContent> items, GovUkAccordionOptions? options = null)
            {
                if (items == null || !items.Any())
                {
                    _logger.LogWarning("No accordion items provided for rendering");
                    return HtmlString.Empty;
                }

                options ??= new GovUkAccordionOptions();

                // Create the container with your exact string format
                var containerDiv = new TagBuilder("div");
                containerDiv.AddCssClass("govuk-accordion");
                containerDiv.Attributes["data-module"] = "govuk-accordion";
                containerDiv.Attributes["id"] = $"accordion-default-{SanitizeId(accordionTitle)}";

                // Add remember expanded if needed
                if (options.RememberExpandedState)
                {
                    containerDiv.Attributes["data-remember-expanded"] = "true";
                }

                // Add data-title attribute
                containerDiv.Attributes["data-title"] = _htmlEncoder.Encode(accordionTitle);

                // Render sections directly without extra method
                int counter = 1;
                foreach (var item in items)
                {
                    var section = CreateAccordionSection(item, accordionTitle, counter);
                    containerDiv.InnerHtml.AppendHtml(section);
                    counter++;
                }

                return containerDiv;
            }

            private IHtmlContent CreateAccordionSection(AccordionContent item, string accordionTitle, int counter)
            {
                var sectionDiv = new TagBuilder("div");
                sectionDiv.AddCssClass("govuk-accordion__section");

                // Header
                var headerDiv = new TagBuilder("div");
                headerDiv.AddCssClass("govuk-accordion__section-header");

                var heading = new TagBuilder("h2");
                heading.AddCssClass("govuk-accordion__section-heading");

                var buttonSpan = new TagBuilder("span");
                buttonSpan.AddCssClass("govuk-accordion__section-button");
                buttonSpan.Attributes["id"] = $"accordion-default-heading-{SanitizeId(accordionTitle)}-{counter}";
                buttonSpan.InnerHtml.Append(_htmlEncoder.Encode(item.Title ?? $"Section {counter}"));

                heading.InnerHtml.AppendHtml(buttonSpan);
                headerDiv.InnerHtml.AppendHtml(heading);
                sectionDiv.InnerHtml.AppendHtml(headerDiv);

                // Content
                var contentDiv = new TagBuilder("div");
                contentDiv.AddCssClass("govuk-accordion__section-content");
                contentDiv.Attributes["id"] = $"accordion-default-content-{counter}";

                var bodyDiv = new TagBuilder("div");
                bodyDiv.AddCssClass("govuk-body");

                // Body content
                if (!string.IsNullOrEmpty(item.Body))
                {
                    bodyDiv.InnerHtml.AppendHtml(new HtmlString(item.Body));
                }


                contentDiv.InnerHtml.AppendHtml(bodyDiv);
                sectionDiv.InnerHtml.AppendHtml(contentDiv);

                return sectionDiv;
            }

            private string SanitizeId(string input)
            {
                if (string.IsNullOrEmpty(input))
                    return "default";

                // Remove spaces and special characters for ID safety
                // Keep it simple and consistent with your existing patterns
                return System.Text.RegularExpressions.Regex.Replace(
                    input.ToLowerInvariant(),
                    @"[^a-z0-9\-]",
                    "-"
                ).Trim('-');
            }

        }
    }

