using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    public interface IAccordionRenderer
    {
        IHtmlContent Render(string accordionName, List<AccordionContent> items);
    }
}
