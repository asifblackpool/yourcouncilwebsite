using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Core.Models.ViewModels;
using Zengenti.Contensis.Delivery;
using Content.Modelling.Models.Accordions;
using RazorPageBusinessWebsite.Components.Extensions;

namespace RazorPageBusinessWebsite.Components.Accordions
{
    public class AccordionsViewComponent : ViewComponent
    {
        private readonly ContensisClient _contensisClient;

        public AccordionsViewComponent(ContensisClient contensisClient)
        {
            _contensisClient = contensisClient;
        }

        public IViewComponentResult Invoke(BGServiceLandingAccordion? model = null)
        {
            // Try to get model from parameter first
            if (model == null)
            {
                model = ViewData["Model"] as BGServiceLandingAccordion;
                if (model == null && ViewBag.Model is BGServiceLandingAccordion viewBagModel)
                    model = viewBagModel;
            }

            if (model == null)
                model = ViewContext.ViewData.Model as BGServiceLandingAccordion;

            // Resolve ALL entries (non-generic version returns List<object>)
            var resolvedEntries = model.GetResolvedEntries(_contensisClient, versionStatus: 1, languageCode: null);

            var viewModel = new AccordionViewModels
            {
                Entries = resolvedEntries   // List<object>
            };

            return View(ViewComponentExtensions.GetViewPath("Accordions"), viewModel);
        }
    }
}




