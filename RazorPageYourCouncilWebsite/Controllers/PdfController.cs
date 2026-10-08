using Microsoft.AspNetCore.Mvc;
using Zengenti.Contensis.Delivery;
using Zengenti.Search;

namespace RazorPageYourCouncilWebsite.Controllers
{
    [Route("pdf")]
    public class PdfController : Controller
    {
        private readonly ContensisClient _contensisClient;
        private readonly ILogger<PdfController> _logger;
        private readonly HttpClient _httpClient;

        public PdfController(
            ContensisClient contensisClient,
            ILogger<PdfController> logger,
            IHttpClientFactory httpClientFactory)
        {
            _contensisClient = contensisClient;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpGet("download")]
        public async Task<IActionResult> Download([FromQuery] string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return BadRequest("A path is required.");
            }

            var cleanPath = path.Replace("\\", "/").Trim('/');

            _logger.LogInformation("PDF download requested for path: {Path}", cleanPath);

            // ── Step 1: find the asset entry by URI ──────────────────────
            Guid assetId;
            try
            {
                var query = new Query(
                    new EqualTo<string>("sys.contentTypeId", "pdf"),
                    new EqualTo<string>("sys.versionStatus", "published"),
                    new Contains("sys.uri", $"/{cleanPath}")
                );

                var results = await _contensisClient.Entries.SearchAsync(query);

                if (results?.Items == null || !results.Items.Any())
                {
                    _logger.LogWarning("No asset found for path {Path}", cleanPath);
                    return NotFound($"No asset found at path: {cleanPath}");
                }

       
                var assetEntry = results.Items.First();
                assetId = assetEntry.Id;   // already a Guid, no parsing needed

                if (assetId == Guid.Empty)
                {
                    _logger.LogWarning("Asset entry had an empty ID");
                    return NotFound();
                }
                _logger.LogDebug("Asset found. ID={AssetId}", assetId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to search for asset at {Path}", cleanPath);
                return StatusCode(500, "Failed to locate the asset.");
            }

            // ── Step 2: fetch the binary from the Delivery API ───────────
            try
            {
                var alias = Environment.GetEnvironmentVariable("ALIAS") ?? "blackpool";
                var projectId = Environment.GetEnvironmentVariable("PROJECT_API_ID") ?? "";

                var fileUrl = $"https://api-{alias}.cloud.contensis.com/api/delivery/projects/{projectId}/entries/{assetId}/file";

                _logger.LogDebug("Fetching binary from {FileUrl}", fileUrl);

                var request = new HttpRequestMessage(HttpMethod.Get, fileUrl);

               //https//api-blackpool.cloud.contensis.com/api/delivery/projects/lgwebsite/entries/97d1b5cf-ef3d-4a8c-906f-31b183127799
               //?accessToken=Jfnb6XnfR2I6keXe5LspZkkca5RcMjK5lmLkz7v2nevr8xR6

                // Add the access token if you have one in config
                var accessToken = Environment.GetEnvironmentVariable("CONTENSIS_ACCESS_TOKEN");
                accessToken = "Jfnb6XnfR2I6keXe5LspZkkca5RcMjK5lmLkz7v2nevr8xR6";
                if (!string.IsNullOrWhiteSpace(accessToken))
                {
                    request.Headers.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue(accessToken);
                }

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Binary fetch failed. Status={Status}, Url={Url}",
                        response.StatusCode, fileUrl);
                    return NotFound("File could not be retrieved.");
                }

                var stream = await response.Content.ReadAsStreamAsync();
                var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/pdf";
                var fileName = Path.GetFileName(cleanPath);

                return File(stream, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch binary for asset {AssetId}", assetId);
                return StatusCode(500, "Failed to fetch the file.");
            }
        }
    }
}