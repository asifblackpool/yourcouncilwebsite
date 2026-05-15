
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Services.Breadcrumb;
using System.Text;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Components
{
    // Components/BreadcrumbViewComponent.cs
    public class BreadcrumbViewComponent : ViewComponent
    {
        private readonly BreadcrumbService _breadcrumbService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BreadcrumbViewComponent(BreadcrumbService breadcrumbService,
                                     IHttpContextAccessor httpContextAccessor)
        {
            _breadcrumbService = breadcrumbService;
            _httpContextAccessor = httpContextAccessor;
        }

        public IViewComponentResult Invoke()
        {
            if (_httpContextAccessor != null && _httpContextAccessor.HttpContext != null)
            {
                var breadcrumbs = _breadcrumbService.GetBreadcrumbs(_httpContextAccessor.HttpContext);
                return View(breadcrumbs);
            }
            return View(new List<Core.Models.BreadcrumbItem>());
        }
    }


}


