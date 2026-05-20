using Microsoft.AspNetCore.Mvc.RazorPages;
using RazorPageBusinessWebsite.Models;
using RazorPageBusinessWebsite.Services.Interfaces;
using RazorPageBusinessWebsite.Constants;
using RazorPageBusinessWebsite.Core.Interfaces;

namespace RazorPageBusinessWebsite.Pages.Home
{
    public class IndexModel : PageModel
    {
        private readonly IContentRepository _contentRepo;
        private readonly ICmsViewModelFactory _viewModelFactory;

        public IndexModel(IContentRepository contentRepo, ICmsViewModelFactory viewModelFactory)
        {
            _contentRepo = contentRepo;
            _viewModelFactory = viewModelFactory;
        }

        public object ViewModel { get; private set; }
        public string ViewName { get; private set; }

        public async Task OnGetAsync(string slug)
        {
            // Build the Contensis path based on slug
            string siteViewRoot = WebsiteConstants.SITE_VIEW_PATH.TrimStart('/'); // "business"
            string nodePath = string.IsNullOrEmpty(slug)
                ? $"/{siteViewRoot}"           // "/business" for root
                : $"/{siteViewRoot}/{slug}";    // "/business/business-rates", etc.

            // Fetch node from repository
            var node = await _contentRepo.GetNodeByPathAsync(nodePath);
            if (node == null)
            {
                // Optionally set a flag for 404
                ViewModel = null;
                return;
            }

            // Use the factory to determine view name and view model
            (ViewName, ViewModel) = await _viewModelFactory.CreateAsync(node);
        }
    }
}