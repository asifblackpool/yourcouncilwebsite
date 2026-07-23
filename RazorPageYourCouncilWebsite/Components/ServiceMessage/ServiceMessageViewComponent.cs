using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Components.Extensions;
using Zengenti.Contensis.Delivery;


namespace RazorPageYourCouncilWebsite.Components.ServiceMessage
{
    public class ServiceMessageViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(Content.Modelling.Models.Components.ServiceMessage message)
        {
            // You can pass additional data via ViewData if needed
            ViewData["RenderTime"] = DateTime.Now;
            return View(ViewComponentExtensions.GetViewPath("ServiceMessage"), message);
           
        }
    }
}
