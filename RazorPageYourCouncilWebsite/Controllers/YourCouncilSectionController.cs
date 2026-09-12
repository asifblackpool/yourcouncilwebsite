using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Controllers.Base;
using RazorPageYourCouncilWebsite.Services.Interfaces;

namespace RazorPageYourCouncilWebsite.Controllers
{
    public class YourCouncilSectionController : DynamicCmsController
    {
        // Tell the base controller to look for views in the "Your council" folder
        protected override string ViewFolder => WebsiteConstants.VIEW_FOLDER;

        public YourCouncilSectionController(
            IZengentiClient cmsClient,
            ICmsViewModelFactory viewModelFactory,
            ILogger<YourCouncilSectionController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        public async Task<IActionResult> Index(string section, string slug)
        {
            if (string.IsNullOrEmpty(section))
                return NotFound();

            // Build the full slug for RenderDynamicPageAsync directly.
            // We do NOT need to enumerate children of "your-council" to
            // validate the section — the fetch inside RenderDynamicPageAsync
            // will 404 naturally if the path doesn't exist.
            string fullSlug = string.IsNullOrEmpty(slug)
                ? section
                : $"{section}/{slug}";

            // sectionRoot is "your-council" (the ViewFolder).
            // RenderDynamicPageAsync builds the full path and fetches once.
            return await RenderDynamicPageAsync(ViewFolder, fullSlug);
        }
    }
}