using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Controllers.Base;
using RazorPageYourCouncilWebsite.Services.Interfaces;

namespace RazorPageYourCouncilWebsite.Controllers
{
    public class CmsFallbackController : DynamicCmsController
    {
        public CmsFallbackController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<YourCouncilController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        public async Task<IActionResult> Dynamic(string section, string slug)
        {
            return await RenderDynamicPageAsync(section, slug);
        }
    }
}
