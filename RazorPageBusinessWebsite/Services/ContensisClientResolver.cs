using Microsoft.AspNetCore.Http;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Services
{
    public interface IContensisClientResolver
    {
        ContensisClient GetClient();
        string showHost { get; }
        bool isPreview { get; }
        string showVersionStatus { get; }
    }

    public class ContensisClientResolver : IContensisClientResolver
    {
        private ContensisClient? _cachedClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private string? _computedVersionStatus;
        private bool? _computedIsPreview;

        public ContensisClientResolver(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public ContensisClient GetClient()
        {
            if (_cachedClient != null)
                return _cachedClient;

            string versionStatus = DetermineVersionStatus();
            _cachedClient = ContensisClientFactory.CreateClient(
                isPreview: versionStatus == "latest",
                QueryStringversionStatus: versionStatus
            );
            return _cachedClient;
        }

        private string DetermineVersionStatus()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            // If there's no active HTTP request (e.g., startup, background job), default to published
            if (httpContext == null)
            {
                _computedVersionStatus = "published";
                _computedIsPreview = false;
                return _computedVersionStatus;
            }

            var request = httpContext.Request;

            // 1. Query string override
            if (request.Query.TryGetValue("versionstatus", out var queryValues))
            {
                string? queryVersion = queryValues.FirstOrDefault();
                if (!string.IsNullOrEmpty(queryVersion) && (queryVersion == "latest" || queryVersion == "published"))
                {
                    _computedVersionStatus = queryVersion;
                    _computedIsPreview = queryVersion == "latest";
                    return _computedVersionStatus;
                }
            }

            // 2. Header from reverse proxy
            if (request.Headers.TryGetValue("x-entry-versionstatus", out var headerValues))
            {
                string? headerVersion = headerValues.FirstOrDefault();
                if (!string.IsNullOrEmpty(headerVersion) && (headerVersion == "latest" || headerVersion == "published"))
                {
                    _computedVersionStatus = headerVersion;
                    _computedIsPreview = headerVersion == "latest";
                    return _computedVersionStatus;
                }
            }

            // 3. Host-based fallback
            string host = httpContext.Request.Host.Host.ToLower();
            bool isPreviewHost = host.Contains("preview-blackpool") || host.Contains("cloud.contensis.com") || host.Contains("localhost");

            _computedVersionStatus = isPreviewHost ? "latest" : "published";
            _computedIsPreview = isPreviewHost;
            return _computedVersionStatus;
        }

        // Interface properties
        public string showVersionStatus => _computedVersionStatus ?? DetermineVersionStatus();
        public string showHost => _httpContextAccessor.HttpContext?.Request.Host.Host.ToLower() ?? "no-request";
        public bool isPreview => _computedIsPreview ?? (_computedVersionStatus == "latest");
    }
}