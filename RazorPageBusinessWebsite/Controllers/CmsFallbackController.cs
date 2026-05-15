using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Controllers.Base;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Controllers
{
    public class CmsFallbackController : DynamicCmsController
    {
        public CmsFallbackController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory)
            : base(cmsClient, viewModelFactory) { }

        public async Task<IActionResult> Dynamic(string section, string slug)
        {
            return await RenderDynamicPageAsync(section, slug);
        }
    }
}
