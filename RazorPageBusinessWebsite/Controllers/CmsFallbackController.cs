using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Controllers.Base;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Controllers
{
    public class CmsFallbackController : DynamicCmsController
    {
        public CmsFallbackController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<BusinessController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        public async Task<IActionResult> Dynamic(string section, string slug)
        {
            return await RenderDynamicPageAsync(section, slug);
        }
    }
}
