using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Mvc;

namespace RazorPageBusinessWebsite.Components
{
    [ViewComponent]
    public class CanvasViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(SerialisedContent content)
        {
            // You can modify the model here if needed
            if (content != null)
            {

                return View(content);
            }
            return View();
        }

        // Alternative async version if you need to do async work
        /*
        public async Task<IViewComponentResult> InvokeAsync(GreetingModel model)
        {
            // Do async work if needed
            return View(model);
        }
        */
    }
}
