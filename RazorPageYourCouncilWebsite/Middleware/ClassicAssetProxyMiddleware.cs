using System.Net.Http.Headers;

namespace RazorPageYourCouncilWebsite.Middleware
{
    /// <summary>
    /// Proxies asset requests (PDFs, CSVs, XMLs, Office docs) to the
    /// Classic IIS backend, so that files living in Classic CMS folders
    /// (Assets, Documents, etc.) are served correctly instead of being
    /// routed to the Block renderer.
    ///
    /// Determines the upstream host from the incoming request's host:
    ///   - any host containing "preview"  → iis-preview-blackpool.cloud.contensis.com
    ///   - everything else (live)         → iis-live-blackpool.cloud.contensis.com
    /// </summary>
    public class ClassicAssetProxyMiddleware
    {
        private static readonly string[] AssetExtensions = new[]
        {
            ".pdf", ".csv", ".xml",
            ".doc", ".docx",
            ".xls", ".xlsx",
            ".ppt", ".pptx",
            ".zip", ".txt", ".rtf"
        };

        private const string PreviewBackend = "https://iis-preview-blackpool.cloud.contensis.com";
        private const string LiveBackend = "https://iis-live-blackpool.cloud.contensis.com";

        private readonly RequestDelegate _next;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ClassicAssetProxyMiddleware> _logger;

        public ClassicAssetProxyMiddleware(RequestDelegate next,IHttpClientFactory httpClientFactory,ILogger<ClassicAssetProxyMiddleware> logger)
        {
            _next = next;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {

            var isLocalDev =
                  context.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                  context.Request.Host.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);

            var proxyTestBypass = context.Request.Query.ContainsKey("proxytest");

            if (isLocalDev && !proxyTestBypass)
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value ?? string.Empty;

            if (!IsAssetRequest(path))
            {
                await _next(context);
                return;
            }

            var upstream = ResolveUpstream(context);
            var upstreamUrl = upstream + context.Request.Path + context.Request.QueryString;

            _logger.LogInformation("Proxying asset request: {Path} → {Upstream}", context.Request.Path, upstreamUrl);

            try
            {
                var client = _httpClientFactory.CreateClient("ClassicAssetProxy");

                using var request = new HttpRequestMessage(HttpMethod.Get, upstreamUrl);

                // Forward the incoming Accept header so the backend can
                // decide how to represent the file if it matters.
                if (context.Request.Headers.TryGetValue("Accept", out var accept))
                {
                    request.Headers.TryAddWithoutValidation("Accept", accept.ToString());
                }

                using var response = await client.SendAsync(
                    request, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);

                context.Response.StatusCode = (int)response.StatusCode;

                CopyHeader(response, context, "Content-Type");
                CopyHeader(response, context, "Content-Length");
                CopyHeader(response, context, "Content-Disposition");
                CopyHeader(response, context, "Last-Modified");
                CopyHeader(response, context, "ETag");
                CopyHeader(response, context, "Cache-Control");
                CopyHeader(response, context, "Expires");
                CopyHeader(response, context, "Accept-Ranges");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Classic backend returned {Status} for {Url}",
                        response.StatusCode, upstreamUrl);

                    // If it's not a success, don't stream the body —
                    // let the client see the status and a small message.
                    await context.Response.WriteAsync(
                        $"Asset could not be retrieved ({response.StatusCode}).");
                    return;
                }

                await response.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to proxy asset request to Classic: {Url}", upstreamUrl);

                if (!context.Response.HasStarted)
                {
                    context.Response.StatusCode = StatusCodes.Status502BadGateway;
                    await context.Response.WriteAsync("Asset temporarily unavailable.");
                }
            }
        }

        private static bool IsAssetRequest(string path)
        {
            if (string.IsNullOrEmpty(path)) return false;

            // Strip query string if present (path should already exclude it,
            // but belt-and-braces).
            var qIndex = path.IndexOf('?');
            if (qIndex >= 0) path = path.Substring(0, qIndex);

            foreach (var ext in AssetExtensions)
            {
                if (path.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        private static string ResolveUpstream(HttpContext context)
        {
            // Look at the original host the client requested. Behind the
            // Contensis proxy this arrives as x-orig-host, but fall back to
            // the standard Host header in case it's absent.
            var host =
                context.Request.Headers["x-orig-host"].FirstOrDefault()
                ?? context.Request.Host.Host
                ?? string.Empty;

            if (host.Contains("preview", StringComparison.OrdinalIgnoreCase))
                return PreviewBackend;

            return LiveBackend;
        }

        private static void CopyHeader(HttpResponseMessage source, HttpContext context, string headerName)
        {
            if (source.Headers.TryGetValues(headerName, out var values))
            {
                context.Response.Headers[headerName] = values.ToArray();
                return;
            }

            if (source.Content.Headers.TryGetValues(headerName, out var contentValues))
            {
                context.Response.Headers[headerName] = contentValues.ToArray();
            }
        }
    }
}