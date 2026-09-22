using Content.Modelling.Models.Components.Data;
using Content.Modelling.Models.Templates.Base;
using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc;
using Content.Modelling.Models.AssetGallery;
using RazorPageYourCouncilWebsite.Core.Models.ViewModels;
using Zengenti.Contensis.Delivery;
using RazorPageYourCouncilWebsite.Components.Extensions;

namespace RazorPageYourCouncilWebsite.Components
{
    public class AdditionalInformationViewComponent : ViewComponent
    {
        private readonly ContensisClient _contensisClient;

        public AdditionalInformationViewComponent(ContensisClient contensisClient)
        {
            _contensisClient = contensisClient;
        }

        public IViewComponentResult Invoke(BaseBG? model)
        {
            // Try to get model from parameter first
            if (model == null)
            {
                // Try to get from ViewData
                model = ViewData["Model"] as BaseBG;

                // Try to get from ViewBag
                if (model == null && ViewBag.Model is BaseBG viewBagModel)
                {
                    model = viewBagModel;
                }
            }

            // If still null, try to get from ViewContext
            if (model == null)
            {
                model = ViewContext.ViewData.Model as BaseBG;
            }

            if (model == null)
                return Content(string.Empty);

            // IMPORTANT: check most derived types first, so that if
            // BGStandardWithImages / BGStandardWithDocuments inherit from
            // BGStandard, they don't get swallowed by the BGStandard branch.

            // 1) BGStandardWithDocuments
            if (model is BGStandardWithDocuments withDocs)
            {
                var viewModel = new AdditionalInformationViewModel
                {
                    LinkedEntries = withDocs.GetReferencedEntries(_contensisClient, 1, null)
                };

                return View(ViewComponentExtensions.GetViewPath("AdditionalInformation"), viewModel);
            }

            // 2) BGStandardWithImages  (must come BEFORE BGStandard)
            if (model is BGStandardWithImages withImages)
            {
                var viewModel = new AdditionalInformationViewModel
                {
                    Assets = withImages.Assets ?? new List<Asset>(),
                    LinkedEntries = withImages.GetReferencedEntries(_contensisClient, 1, null),
                    Url = withImages.Url ?? string.Empty
                };

                return View(ViewComponentExtensions.GetViewPath("AdditionalInformation"), viewModel);
            }

            // 3) BGStandard (base / plain variant)
            if (model is BGStandard standard)
            {
                var viewModel = new AdditionalInformationViewModel
                {
                    Assets = standard.Assets ?? new List<Asset>(),
                    DataNavigationLinks = standard.GetDataNavigationLinks ?? new List<DataNavigationLink>(),
                    LinkedEntries = standard.GetReferencedEntries(_contensisClient, 1, null)
                };

                return View(ViewComponentExtensions.GetViewPath("AdditionalInformation"), viewModel);
            }

            // Unknown / unsupported model type
            return Content(string.Empty);
        }
    }
}