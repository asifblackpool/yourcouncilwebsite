using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{

    public interface IGovUkAccordionRenderer
    {
        /// <summary>
        /// Renders a GOV.UK styled accordion with optional CTA buttons
        /// </summary>
        IHtmlContent RenderGovUkAccordion(
            string accordionTitle,
            List<AccordionContent> items,
            GovUkAccordionOptions? options = null);
    }


    public interface IGovUkAccordionWithCtaButtonRenderer
    {
        /// <summary>
        /// Renders a GOV.UK styled accordion with optional CTA buttons
        /// </summary>
        IHtmlContent RenderGovUkAccordion(
            string accordionTitle,
            List<AccordionWithCTAContent> items,
            GovUkAccordionOptions? options = null);
    }


    public interface IGovUkAccordionWithImagesRenderer
    {
        /// <summary>
        /// Renders a GOV.UK styled accordion with optional CTA buttons
        /// </summary>
        IHtmlContent RenderGovUkAccordion(
            string accordionTitle,
            List<AccordionContentWithImages> items,
            GovUkAccordionOptions? options = null);
    }


    #region helper class

    public class GovUkAccordionOptions
    {
        public string AccordionId { get; set; } = string.Empty;
        public bool RememberExpandedState { get; set; } = false;
        public string ContainerClass { get; set; } = "govuk-accordion";
        public string ModuleName { get; set; } = "govuk-accordion";
        public string? AdditionalContainerClasses { get; set; }
        public Dictionary<string, string> ContainerAttributes { get; set; } = new();
    }

    #endregion
}
