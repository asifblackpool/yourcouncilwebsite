using Content.Modelling.Models.Canvas.Images;
using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Core.Models.ViewModels;
using RazorPageBusinessWebsite.Helpers;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using Sprache;
using Zengenti;

namespace RazorPageBusinessWebsite.Components.ImageGalleryNew
{
    public class WebFormsViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(Content.Modelling.Models.Components.MultipleImages ign)
        {
            // You can pass additional data via ViewData if needed
            ViewData["RenderTime"] = DateTime.Now;

            if (ign != null)
            {
                List<SimpleImageViewModel> list = new List<SimpleImageViewModel>();
                foreach (var item in ign.MultipleImage)
                {
                    list.Add(new SimpleImageViewModel()
                    {
                        AltText = item.AltText,
                        Caption = item.Caption,
                        ImageUrl = (item.Asset!= null) ? ImageHelper.GetImageUrl(item.Asset.System?.Uri) : "#"
                    });

                    return View(list);
                }
            }
            return View(null);
        }
    }


}
