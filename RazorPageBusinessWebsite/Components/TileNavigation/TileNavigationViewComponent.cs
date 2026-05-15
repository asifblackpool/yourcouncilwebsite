using Content.Modelling.Models.Components;
using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Core.Models.ViewModels;
using RazorPageBusinessWebsite.ViewModels;

namespace RazorPageBusinessWebsite.Components.TileNavigation
{
    public class TileNavigationViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(List<NavigationTile> list, TileLayout layout)
        {
            // You can pass additional data via ViewData if needed
            ViewData["RenderTime"] = DateTime.Now;
            ViewData["Layout"] = layout;

            if (list != null)
            {
                List<TileNavigationViewModel> temp = new List<TileNavigationViewModel>();
                foreach (var item in list)
                {
                    temp.Add(new TileNavigationViewModel()
                    {
                        LinkText = (item.Title != null) ? item.Title : string.Empty,
                        Url = (item.LinkUrl != null) ? item.LinkUrl : string.Empty,
                       
                    });
                }
                return View(temp);
            }
            return View(null);
        }
    }
}
