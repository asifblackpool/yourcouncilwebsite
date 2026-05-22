using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Controllers.Base;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Controllers
{
    public class BusinessController : DynamicCmsController
    {
        public BusinessController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<BusinessController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        [HttpGet]
        public async Task<IActionResult> Dynamic(string slug)
        {
            slug ??= "";
            return await RenderDynamicPageAsync("Business", slug);
        }
    }
}
