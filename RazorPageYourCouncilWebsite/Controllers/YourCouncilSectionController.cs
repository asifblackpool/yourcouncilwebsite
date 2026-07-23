using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Controllers.Base;
using RazorPageYourCouncilWebsite.Services.Interfaces;

namespace RazorPageYourCouncilWebsite.Controllers
{
    public class YourCouncilSectionController : DynamicCmsController
    {
        // Tell the base controller to look for views in the "Your council" folder
        protected override string ViewFolder => WebsiteConstants.View_Folder;
        public YourCouncilSectionController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<YourCouncilSectionController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        public async Task<IActionResult> Index(string section, string slug)
        {
            if (string.IsNullOrEmpty(section))
                return NotFound();

            // 1. Get the "your council" root node
            var node = await _cmsClient.GetNodeByPathAsync(ViewFolder);
            if (node == null)
                return NotFound();

            // 2. Get all direct children of the your council node
            var children = await _cmsClient.GetChildNodesAsync(node.Path);
            if (children == null || children.Count == 0)
                return NotFound();

            // 3. Find a child whose Slug matches the requested section (case‑insensitive)
            var matchedChild = children.FirstOrDefault(c =>
                string.Equals(c.Slug, section, StringComparison.OrdinalIgnoreCase));

            if (matchedChild == null)
                return NotFound();

            // 4. Build the full slug for RenderDynamicPageAsync
            //    Use matchedChild.Slug as the base, then append any remaining slug parts
            string fullSlug = string.IsNullOrEmpty(slug)
                ? matchedChild.Slug
                : $"{matchedChild.Slug}/{slug}";

            // 5. Delegate to base dynamic rendering (sectionRoot = "your-council")
            return await RenderDynamicPageAsync(ViewFolder, fullSlug);
        }
    }
}