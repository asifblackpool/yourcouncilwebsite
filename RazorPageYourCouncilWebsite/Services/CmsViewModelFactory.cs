using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using RazorPageYourCouncilWebsite.ViewModels;

namespace RazorPageYourCouncilWebsite.Services
{
    public class CmsViewModelFactory : ICmsViewModelFactory
    {
        private readonly ContentViewModelService _viewModelService;

        public CmsViewModelFactory(ContentViewModelService viewModelService)
        {
            _viewModelService = viewModelService;
        }

        public async Task<(string ViewName, object ViewModel)> CreateAsync(CmsNode node, Guid? entryId = null)
        {
            DetailsViewModel detailsViewModel =
                await _viewModelService.GetViewModelForPathAsync(node.Path, entryId);

            var wrapper = new ViewModelWrapper { ViewModel = detailsViewModel };
            return ("DynamicPage", wrapper);
        }
    }
}