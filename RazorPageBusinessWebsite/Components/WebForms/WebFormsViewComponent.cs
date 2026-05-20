using Microsoft.AspNetCore.Mvc;
using RazorPageBusinessWebsite.Components.Extensions;
using Zengenti.Contensis.Delivery;


namespace RazorPageBusinessWebsite.Components.WebForms
{
    public class WebFormsViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(Content.Modelling.Models.Forms.WebForms frm)
        {
            // You can pass additional data via ViewData if needed
            ViewData["RenderTime"] = DateTime.Now;

            if (frm != null)
            {
             
                return View(ViewComponentExtensions.GetViewPath("WebForms"), frm);

            }
            return View(ViewComponentExtensions.GetViewPath("WebfFroms"));
        }
    }


}
