

using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Content.Modelling.Models.Components;
using System.Text.Encodings.Web;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using Zengenti.Contensis.Delivery;
using Content.Modelling.Helpers;

namespace RazorPageBusinessWebsite.Helpers.Renderers
{
    public class GovUkAccordionWithImagesRenderer : IGovUkAccordionWithImagesRenderer
    {
        private readonly IHtmlHelper _htmlHelper;
        private readonly HtmlEncoder _htmlEncoder;
        private readonly ILogger<GovUkAccordionWithImagesRenderer> _logger;

        public GovUkAccordionWithImagesRenderer(IHtmlHelper htmlHelper,HtmlEncoder htmlEncoder, ILogger<GovUkAccordionWithImagesRenderer> logger)
        {
            _htmlHelper = htmlHelper;
            _htmlEncoder = htmlEncoder;
            _logger = logger;
        }

        public IHtmlContent RenderGovUkAccordion(string accordionTitle, List<AccordionContentWithImages> items, GovUkAccordionOptions? options = null)
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

        private IHtmlContent CreateAccordionSection(AccordionContentWithImages item, string accordionTitle, int counter)
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

            // Images
            if (item.MultipleImage != null && item.MultipleImage.Count > 0)
            {
                bodyDiv.InnerHtml.AppendHtml(new HtmlString("<br />"));
                bodyDiv.InnerHtml.AppendHtml(BuildImagesHtml(item.MultipleImage));
            }

            contentDiv.InnerHtml.AppendHtml(bodyDiv);
            sectionDiv.InnerHtml.AppendHtml(contentDiv);

            return sectionDiv;
        }

        private IHtmlContent BuildImagesHtml(List<Image> images)
        {
            try
            {
                var container = new TagBuilder("div");
                container.AddCssClass("accordion-images-container govuk-!-margin-top-4");

                if (images == null || !images.Any())
                    return container;

                int imageCounter = 1;
                foreach (var image in images)
                {
                    // Add comprehensive null checking
                    if (image?.Asset == null)
                        continue;

                    try
                    {
                        // Get image URL safely
                        string imageUrl = string.Empty;
                        try
                        {
                            imageUrl = ImageHelper.GetImageUrl(image);
                        }
                        catch (Exception ex)
                        {
                            imageUrl = "/images/placeholder.jpg"; // Fallback
                        }

                        if (string.IsNullOrEmpty(imageUrl))
                            continue;

                        var figure = new TagBuilder("figure");
                        figure.AddCssClass("govuk-image govuk-!-margin-bottom-4");

                        var img = new TagBuilder("img");
                        img.AddCssClass("govuk-image__img");
                        img.Attributes["src"] = imageUrl;

                        // Safe alt text with fallback
                        var altText = !string.IsNullOrEmpty(image.AltText?.SafeString())
                            ? image.AltText.SafeString()
                            : $"Image {imageCounter}";
                        img.Attributes["alt"] = _htmlEncoder.Encode(altText);

                        img.Attributes["loading"] = "lazy";

                        figure.InnerHtml.AppendHtml(img);

                        // Optional caption
                        if (!string.IsNullOrEmpty(image.Caption))
                        {
                            var figcaption = new TagBuilder("figcaption");
                            figcaption.AddCssClass("govuk-image__caption");
                            figcaption.InnerHtml.Append(_htmlEncoder.Encode(image.Caption.SafeString()));
                            figure.InnerHtml.AppendHtml(figcaption);
                        }

                        container.InnerHtml.AppendHtml(figure);
                        imageCounter++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing image {ImageIndex}", imageCounter);
                        // Continue with next image
                    }
                }

                return container;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building images HTML");
                return new HtmlString($"<!-- Error loading images: {_htmlEncoder.Encode(ex.Message)} -->");
            }
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















