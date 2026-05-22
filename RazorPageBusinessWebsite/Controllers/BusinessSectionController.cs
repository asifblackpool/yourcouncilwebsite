using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Controllers.Base;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Controllers
{
    public class BusinessSectionController : DynamicCmsController
    {
        // Tell the base controller to look for views in the "Business" folder
        protected override string ViewFolder => "Business";
        public BusinessSectionController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<BusinessSectionController> logger)
            : base(cmsClient, viewModelFactory, logger) { }

        public async Task<IActionResult> Index(string section, string slug)
        {
            if (string.IsNullOrEmpty(section))
                return NotFound();

            // 1. Get the "business" root node
            var businessNode = await _cmsClient.GetNodeByPathAsync("business");
            if (businessNode == null)
                return NotFound();

            // 2. Get all direct children of the business node
            var children = await _cmsClient.GetChildNodesAsync(businessNode.Path);
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

            // 5. Delegate to base dynamic rendering (sectionRoot = "business")
            return await RenderDynamicPageAsync("business", fullSlug);
        }
    }
}