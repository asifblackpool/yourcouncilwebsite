namespace RazorPageYourCouncilWebsite.Middleware
{
    /// <summary>
    /// Captures the original request path and querystring before the
    /// status-code re-execute swaps the URL to /Error, so the error page
    /// can display what the user was actually trying to reach.
    /// </summary>
    public class ErrorContextMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only capture for the original request, not the /Error re-execute
            if (!context.Request.Path.StartsWithSegments("/Error"))
            {
                context.Items["OriginalPath"] =
                    context.Request.Path + context.Request.QueryString;
            }

            await _next(context);
        }
    }

    public static class ErrorContextMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorContext(this IApplicationBuilder app)
            => app.UseMiddleware<ErrorContextMiddleware>();
    }
}