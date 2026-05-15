using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Controllers.Base
{
    public abstract class DynamicCmsController : Controller
    {
        protected readonly IZengentiClient _cmsClient;
        protected readonly ICmsViewModelFactory _viewModelFactory;

        protected DynamicCmsController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory)
        {
            _cmsClient = cmsClient;
            _viewModelFactory = viewModelFactory;
        }

        protected async Task<IActionResult> RenderDynamicPageAsync(string sectionRoot, string slug)
        {
            var fullPath = string.IsNullOrEmpty(slug) ? $"/{sectionRoot}" : $"/{sectionRoot}/{slug}";
            var node = await _cmsClient.GetNodeByPathAsync(fullPath);
            if (node == null) return NotFound();

            var (viewName, viewModel) = await _viewModelFactory.CreateAsync(node);
            return View(viewName, viewModel);
        }
    }
}
