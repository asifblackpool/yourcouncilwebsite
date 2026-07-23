using Microsoft.Extensions.Caching.Memory;
using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using System.Xml;

namespace RazorPageYourCouncilWebsite.Services
{
    public class ZengentiClient : IZengentiClient
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<ZengentiClient> _logger;

        public ZengentiClient(IMemoryCache cache, ILogger<ZengentiClient> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<List<string>> GetTopLevelSectionNamesAsync()
        {
            // Simulate fetch from Zengenti siteView root (e.g., GET /?format=json&depth=1)
            // In reality, call your Zengenti API and extract child node names.
            await Task.Delay(50); // simulate network
            return new List<string> { "Your-Council", "have-your-say", "Citizenship" };
        }

        public async Task<CmsNode?> GetNodeByPathAsync(string path)
        {
            var cacheKey = $"cms_node_{path}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);

                // Simulate CMS lookup – replace with real API call
                _logger.LogInformation("Fetching node from Zengenti: {Path}", path);
                await Task.Delay(20);

                // Return dummy data for known paths
                if (path == "/Your-Council")
                    return new CmsNode { Path = "/Your-Council", Title = "Your-Council", ContentType = "SectionRoot" };
                if (path == "/Your-Council/Have-your-say")
                    return new CmsNode { Path = "/Your-Council/Have-your-say", Title = "Have-your-say", ContentType = "HaveYourSayPage", HtmlContent = "<p>Have your say information...</p>" };

                return null;
            });
        }

        public async Task<List<CmsNode>> GetChildNodesAsync(string parentPath)
        {
            // Similarly fetch children from CMS
            await Task.Delay(20);
            if (parentPath == "/Your-Council")
                return new List<CmsNode>
                {
                    new CmsNode { Path = "/Your-Council/Have-your-say", Title = "Have your say", ContentType = "HaveYourSayPage" },

            };
            return new List<CmsNode>();
        }
    }
}
