using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Components.Extensions;
using RazorPageYourCouncilWebsite.Core.Models;

namespace RazorPageYourCouncilWebsite.Components
{

    public class TitleViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            string noTitle = "No title";
            var temp = ViewData["Model"] as dynamic; // Using dynamic for flexibility

            var model = new LayoutModel
            {
                Title = (temp?.PageTitle != null) ? temp.PageTitle.ToString() : noTitle,
                IsHomePage = ViewContext.RouteData.Values["page"]?.ToString() == "/Home/Index"
            };

            return View(ViewComponentExtensions.GetViewPath("Title"), model);
        }
    }
}
