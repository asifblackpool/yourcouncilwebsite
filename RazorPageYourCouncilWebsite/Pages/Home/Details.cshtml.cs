using Microsoft.AspNetCore.Mvc.RazorPages;
using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Core.Interfaces;

namespace RazorPageYourCouncilWebsite.Pages.Home
{
    public class DetailsModel : PageModel
    {
        private readonly IContentRepository _contentRepo;
        private readonly ICmsViewModelFactory _viewModelFactory;

        public DetailsModel(IContentRepository contentRepo, ICmsViewModelFactory viewModelFactory)
        {
            _contentRepo = contentRepo;
            _viewModelFactory = viewModelFactory;
        }

        public object ViewModel { get; private set; }
        public string ViewName { get; private set; }

        public async Task OnGetAsync(string slug)
        {
            // Build the Contensis path based on slug
            string siteViewRoot = WebsiteConstants.SITE_VIEW_PATH.TrimStart('/'); // "your-council"
            string nodePath = string.IsNullOrEmpty(slug)
                ? $"/{siteViewRoot}"           // "/your-council" for root
                : $"/{siteViewRoot}/{slug}";    // "/your-council/Comments-compliments-and-complaints", etc.

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