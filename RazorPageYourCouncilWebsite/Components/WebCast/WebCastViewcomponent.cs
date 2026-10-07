using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Components.Extensions;

namespace RazorPageYourCouncilWebsite.Components.Webcast
{
    public class WebCastViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(string? introOverride)
        {
            return View(ViewComponentExtensions.GetViewPath("WebCast"), introOverride);
        }
    }
}