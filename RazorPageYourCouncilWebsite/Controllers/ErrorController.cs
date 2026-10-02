using Microsoft.AspNetCore.Mvc;

namespace RazorPageYourCouncilWebsite.Controllers
{
    [Route("Error")]
    public class ErrorController : Controller
    {
        [Route("")]
        [Route("{statusCode:int?}")]
        public IActionResult Index(int? statusCode = null)
        {
            Response.StatusCode = statusCode ?? 500;
            return View("~/Views/Shared/Error.cshtml");
        }
    }
}
