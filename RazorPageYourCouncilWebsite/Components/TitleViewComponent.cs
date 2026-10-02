using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Components.Extensions;
using RazorPageYourCouncilWebsite.Core.Models;

namespace RazorPageYourCouncilWebsite.Components
{
    public class TitleViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            const string noTitle = "No title";

            var model = new LayoutModel
            {
                Title = ResolveTitle() ?? noTitle,
                IsHomePage = ViewContext.RouteData.Values["page"]?.ToString() == "/Home/Index"
            };

            return View(ViewComponentExtensions.GetViewPath("Title"), model);
        }

        private string? ResolveTitle()
        {
            // 1. Explicit heading override — used by the error page and any
            //    page that wants a short heading distinct from the <title>.
            var pageHeading = ViewData["PageHeading"]?.ToString();
            if (!string.IsNullOrWhiteSpace(pageHeading))
                return pageHeading;

            // 2. CMS model (normal content pages) — read PageTitle via reflection
            //    rather than dynamic, to avoid RuntimeBinderException on null.
            if (ViewData["Model"] is not null)
            {
                var pageTitleProp = ViewData["Model"]!.GetType().GetProperty("PageTitle");
                var pageTitle = pageTitleProp?.GetValue(ViewData["Model"])?.ToString();
                if (!string.IsNullOrWhiteSpace(pageTitle))
                    return pageTitle;
            }

            // 3. ViewData["Title"] — set by static Razor Pages and controllers
            var viewDataTitle = ViewData["Title"]?.ToString();
            if (!string.IsNullOrWhiteSpace(viewDataTitle))
                return viewDataTitle;

            return null;
        }
    }
}