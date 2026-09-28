using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    /// <summary>
    /// Renders the GOV.UK privacy notices accordion from a title + label.
    /// Delegates to PrivacyNoticeHtmlWrapper and the shared ViewComponent
    /// hosted in Content.Modelling.
    /// </summary>
    public interface IPrivacyNoticesAccordionRenderer
    {
        Task<IHtmlContent> RenderAsync(string title, string label, ViewContext viewContext);
    }
}