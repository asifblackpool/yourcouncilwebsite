
using global::RazorPageBusinessWebsite.ViewModels;
using RazorPageBusinessWebsite.Services.Interfaces;
using RazorPageBusinessWebsite.Models.Helpers;
using SerializationHelper = RazorPageBusinessWebsite.Helpers.Serialisation.SerializationHelper;

namespace RazorPageBusinessWebsite.Services
{
    public class ContentViewModelService
    {
        private readonly IDataService<dynamic> _dataService;
        private readonly ILogger<ContentViewModelService> _logger;

        public ContentViewModelService(IDataService<dynamic> dataService, ILogger<ContentViewModelService> logger)
        {
            _dataService = dataService;
            _logger = logger;
        }

        public async Task<DetailsViewModel> GetViewModelForPathAsync(string path)
        {
            var items = await _dataService.GetAllAsync(path);
            if (items == null || !items.Any())
            {
                _logger.LogWarning($"No content found for path: {path}");
                return new DetailsViewModel();
            }

 
            return ViewModelPopulator.PopulateFromItems(items,_dataService.StatusMessage());
        }

    }
}


