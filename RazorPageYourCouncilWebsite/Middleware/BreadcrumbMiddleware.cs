using RazorPageYourCouncilWebsite.Services;
using RazorPageYourCouncilWebsite.Services.Breadcrumb;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Zengenti.Contensis.Delivery;


namespace RazorPageYourCouncilWebsite.Middleware
{
    // Middleware/BreadcrumbMiddleware.cs
    public class BreadcrumbMiddleware
    {
        private readonly RequestDelegate _next;

        public BreadcrumbMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, BreadcrumbService breadcrumbService, ILogger<BreadcrumbMiddleware> logger)
        {
            try
            {
                breadcrumbService.Reset();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to reset breadcrumbs. Continuing without reset.");
            }

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during request processing after breadcrumb middleware");
                throw; // rethrow to let the error page handle it
            }
        }
    }
}


