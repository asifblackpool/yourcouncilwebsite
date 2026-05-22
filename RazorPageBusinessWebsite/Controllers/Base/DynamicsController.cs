using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RazorPageBusinessWebsite.Models;
using RazorPageBusinessWebsite.Services.Interfaces;
using RazorPageBusinessWebsite.ViewModels;

namespace RazorPageBusinessWebsite.Controllers.Base
{
    public abstract class DynamicCmsController : Controller
    {
        protected readonly IZengentiClient _cmsClient;
        protected readonly ICmsViewModelFactory _viewModelFactory;
        protected readonly ILogger<DynamicCmsController> _logger;

        // NEW: virtual property that derived controllers can override
        protected virtual string ViewFolder => "Business";

        protected DynamicCmsController(IZengentiClient cmsClient, ICmsViewModelFactory viewModelFactory, ILogger<DynamicCmsController> logger)
        {
            _cmsClient = cmsClient;
            _viewModelFactory = viewModelFactory;
            _logger = logger;
        }

        protected async Task<IActionResult> RenderDynamicPageAsync(string sectionRoot, string slug)
        {
            var fullPath = string.IsNullOrEmpty(slug) ? sectionRoot.ToLower() : $"{sectionRoot.ToLower()}/{slug}";
            _logger.LogInformation("Rendering dynamic page. SectionRoot: {SectionRoot}, Slug: {Slug}, FullPath: {FullPath}", sectionRoot, slug, fullPath);

            var node = await _cmsClient.GetNodeByPathAsync(fullPath);
            if (node == null)
            {
                _logger.LogWarning("Node not found for path: {FullPath}", fullPath);
                return NotFound();
            }

            _logger.LogDebug("Node found: {NodePath}, ContentType: {ContentType}", node.Path, node.ContentType);

            var (viewName, viewModel) = await _viewModelFactory.CreateAsync(node);
            _logger.LogDebug("ViewName: {ViewName}, ViewModelType: {ViewModelType}", viewName, viewModel?.GetType().Name);

            // Set ViewData for compatibility with existing layout and components
            if (viewModel is ViewModelWrapper wrapper && wrapper.ViewModel is DetailsViewModel detailsVm)
            {
                ViewData["Model"] = detailsVm.ConcreteModel;
                ViewData["ModelType"] = detailsVm.ModelType;
                ViewData["ContentTypeId"] = detailsVm.ContentTypeId;

                SetViewDataFromViewModel(detailsVm);
                _logger.LogDebug("ViewData set for DetailsViewModel. ModelType: {ModelType}, Title: {Title}", detailsVm.ModelType, ViewData["Title"]);
            }
            else
            {
                _logger.LogWarning("ViewModel is not of expected type (ViewModelWrapper with DetailsViewModel). Actual type: {Type}", viewModel?.GetType().Name);
            }

            return View($"~/Views/{ViewFolder}/{viewName}.cshtml", viewModel);
        }

        #region Private helper methods 

        private void SetViewDataFromViewModel(DetailsViewModel vm)
        {
            // Reset first (optional, but good practice)
            ViewData["Title"] = null;
            ViewData["Model"] = null;
            ViewData["ImageStrip"] = null;

            // Set Model (already set elsewhere, but ensure it's there)
            ViewData["Model"] = vm.ConcreteModel;
            ViewData["ModelType"] = vm.ModelType;
            ViewData["ContentTypeId"] = vm.ContentTypeId;

            // Set Title – try ConcreteModel.PageTitle, fallback to ModelType
            if (vm.ConcreteModel != null)
            {
                var pageTitleProp = vm.ConcreteModel.GetType().GetProperty("PageTitle");
                if (pageTitleProp != null)
                {
                    var title = pageTitleProp.GetValue(vm.ConcreteModel)?.ToString();
                    if (!string.IsNullOrEmpty(title))
                    {
                        ViewData["Title"] = title;
                        _logger.LogDebug("Title set via PageTitle property: {Title}", title);
                    }
                }
            }

            // If still null, use ModelType as fallback
            if (string.IsNullOrEmpty(ViewData["Title"]?.ToString()))
            {
                ViewData["Title"] = vm.ModelType ?? "Page";
                _logger.LogDebug("Title set from ModelType: {Title}", ViewData["Title"]);
            }
        }

        #endregion
    }
}