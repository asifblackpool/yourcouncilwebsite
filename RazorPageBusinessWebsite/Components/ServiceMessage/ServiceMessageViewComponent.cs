using Microsoft.AspNetCore.Mvc;


namespace RazorPageBusinessWebsite.Components.ServiceMessage
{
    public class ServiceMessageViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(Content.Modelling.Models.Components.ServiceMessage message)
        {
            // You can pass additional data via ViewData if needed
            ViewData["RenderTime"] = DateTime.Now;
            return View(message);
        }
    }
}
