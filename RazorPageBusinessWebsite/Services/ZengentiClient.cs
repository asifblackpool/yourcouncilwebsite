using Microsoft.Extensions.Caching.Memory;
using RazorPageBusinessWebsite.Models;
using RazorPageBusinessWebsite.Services.Interfaces;
using System.Xml;

namespace RazorPageBusinessWebsite.Services
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
            return new List<string> { "Business", "Residential-landlords", "Licensing", "Commercial-waste" };
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
                if (path == "/Business")
                    return new CmsNode { Path = "/Business", Title = "Business", ContentType = "SectionRoot" };
                if (path == "/Business/business-rates")
                    return new CmsNode { Path = "/Business/business-rates", Title = "Business Rates", ContentType = "BusinessRatesPage", HtmlContent = "<p>Business rates information...</p>" };

                return null;
            });
        }

        public async Task<List<CmsNode>> GetChildNodesAsync(string parentPath)
        {
            // Similarly fetch children from CMS
            await Task.Delay(20);
            if (parentPath == "/Business")
                return new List<CmsNode>
                {
                    new CmsNode { Path = "/Business/business-rates", Title = "Business Rates", ContentType = "BusinessRatesPage" },
                new CmsNode { Path = "/Business/commercial-waste", Title = "Commercial Waste", ContentType = "CommercialWastePage" }
            };
            return new List<CmsNode>();
        }
    }
}
