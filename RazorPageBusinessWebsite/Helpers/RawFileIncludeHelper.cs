
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Caching.Memory;


namespace RazorPageBusinessWebsite.Helpers
{
    public static class RawFileIncludeHelper
    {
        // Simple version – reads file on every request
        public static async Task<HtmlString> IncludeRawAsync(this IHtmlHelper html, string virtualPath)
        {
            var env = html.ViewContext.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();

            // Normalize the virtual path (remove ~/ and fix slashes)
            string relativePath = virtualPath.Replace("~/", "").Replace('/', Path.DirectorySeparatorChar);
            // Build physical path using WebRootPath (wwwroot)
            string physicalPath = Path.Combine(env.WebRootPath, relativePath);

            if (!File.Exists(physicalPath))
                return new HtmlString($"<!-- File not found: {virtualPath} -->");

            var content = await File.ReadAllTextAsync(physicalPath);
            return new HtmlString(content);
        }

        // Cached version – requires memory cache to be registered
        public static async Task<HtmlString> IncludeRawCachedAsync(this IHtmlHelper html, string virtualPath, int cacheMinutes = 60)
        {
            var cacheKey = $"RawFile_{virtualPath}";

            // Try to get from cache
            var cache = html.ViewContext.HttpContext.RequestServices.GetService<IMemoryCache>();
            if (cache != null && cache.TryGetValue(cacheKey, out string? cachedContent) && cachedContent != null)
                return new HtmlString(cachedContent);

            var env = html.ViewContext.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();

            // Normalize the virtual path (remove ~/ and fix slashes)
            string relativePath = virtualPath.Replace("~/", "").Replace('/', Path.DirectorySeparatorChar);
            // Build physical path using WebRootPath (wwwroot)
            string physicalPath = Path.Combine(env.WebRootPath, relativePath);

            if (!File.Exists(physicalPath))
                return new HtmlString($"<!-- File not found: {virtualPath} -->");

            var content = await File.ReadAllTextAsync(physicalPath);

            // Store in cache if available
            if (cache != null)
            {
                cache.Set(cacheKey, content, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(cacheMinutes)
                });
            }

            return new HtmlString(content);
        }
    }
}