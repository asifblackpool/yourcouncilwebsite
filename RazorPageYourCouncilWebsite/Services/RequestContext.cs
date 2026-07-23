using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Primitives;

namespace RazorPageYourCouncilWebsite.Services
{

    public interface IRequestContext
    {
        bool IsPreview { get; }
        string Host { get; }
        IHeaderDictionary Headers { get; }
        QueryString? QueryString { get; }
    }


    public class RequestContext : IRequestContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private bool? _cachedIsPreview;
        private string? _cachedHost;

        public RequestContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string Host
        {
            get
            {
                if (_cachedHost != null) return _cachedHost;

                var request = _httpContextAccessor.HttpContext?.Request;

                _cachedHost = request?.Host.Host.ToLower().Trim() ?? string.Empty;

                return _cachedHost;
            }
        }

        public IHeaderDictionary? Headers
        {
            get
            {
             
                return _httpContextAccessor.HttpContext?.Request.Headers;
            }
        }

      
        public QueryString? QueryString
        {
            get { return _httpContextAccessor?.HttpContext?.Request.QueryString; }
        }

        public bool IsPreview
        {
            get
            {
                if (_cachedIsPreview.HasValue) return _cachedIsPreview.Value;

                var host = Host;

                _cachedIsPreview =
                    host.Contains("preview") ||
                    host == "localhost" ||
                    host == "127.0.0.1";

                return _cachedIsPreview.Value;
            }
        }

     
    }


    #region RequestContextExtensions

    public static class RequestContextExtensions
    {
        public static string? GetQueryStringVersionStatus(this IRequestContext requestContext)
        {
            if (requestContext.QueryString == null)
                return null;

            // Parse the query string into a dictionary of StringValues
            var queryParams = QueryHelpers.ParseQuery(requestContext.QueryString.Value.ToString());

            // Try to get the "versionstatus" parameter (case-insensitive)
            if (queryParams.TryGetValue("versionstatus", out StringValues values))
            {
                return values.ToString().ToLowerInvariant();
            }

            return null;
        }
    }


    #endregion
}
