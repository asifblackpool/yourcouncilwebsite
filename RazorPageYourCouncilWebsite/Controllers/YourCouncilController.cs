using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Controllers.Base;
using RazorPageYourCouncilWebsite.Services.Interfaces;

namespace RazorPageYourCouncilWebsite.Controllers
{
    public class YourCouncilController : DynamicCmsController
    {
        public YourCouncilController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<YourCouncilController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        [HttpGet]
        public async Task<IActionResult> Dynamic(string slug)
        {
            slug ??= "";
         return await RenderDynamicPageAsync(WebsiteConstants.View_Folder, slug);
        }
    }
}
