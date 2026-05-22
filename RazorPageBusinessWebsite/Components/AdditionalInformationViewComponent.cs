using Content.Modelling.Models.Components.Data;
using Content.Modelling.Models.Templates.Base;
using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc;
using Content.Modelling.Models.AssetGallery;
using RazorPageBusinessWebsite.Core.Models.ViewModels;
using Zengenti.Contensis.Delivery;
using RazorPageBusinessWebsite.Components.Extensions;

namespace RazorPageBusinessWebsite.Components
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

            if (model == null || !(model is BGStandard bgStandard || model is BGStandardWithDocuments BGStandardWithDocs))
                return Content(string.Empty);


            if (model is BGStandardWithDocuments)
            {
                var temp = model as BGStandardWithDocuments;

                if (temp == null)
                    return Content(string.Empty); // Return empty if not the right type

                // Create view model with only the data needed for the sidebar
                var viewModel = new AdditionalInformationViewModel
                {
                    LinkedEntries = temp.GetReferencedEntries(_contensisClient, 1, null)
                };

                return View(viewModel);
            }

            if (model is BGStandard)
            {
                var temp = model as BGStandard;

                if (temp == null)
                    return Content(string.Empty); // Return empty if not the right type

                // Create view model with only the data needed for the sidebar
                var viewModel = new AdditionalInformationViewModel
                {

                    Assets = temp.Assets ?? new List<Asset>(),
                    DataNavigationLinks = temp.GetDataNavigationLinks ?? new List<DataNavigationLink>(),
                    LinkedEntries = temp.GetReferencedEntries(_contensisClient, 1, null)

                };

                return  View(ViewComponentExtensions.GetViewPath("AdditionalInformation"), viewModel);
            }
            // Cast to BGStandard to access the properties
            return Content(string.Empty);
          
        }
    }
}
