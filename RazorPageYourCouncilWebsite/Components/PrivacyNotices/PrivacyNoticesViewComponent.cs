using Content.Modelling.HtmlWrapper.PrivacyNotices;
using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Components.Extensions;

namespace RazorPageYourCouncilWebsite.Components.PrivacyNotices
{
    public class PrivacyNoticesViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(PrivacyNoticeAccordionSection section)
        {
            if (section == null)
            {
                return Content(string.Empty);
            }

            return View(ViewComponentExtensions.GetViewPath("PrivacyNotices"), section);
        }
    }
}
