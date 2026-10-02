using Content.Modelling.Helpers.Canvas;
using Content.Modelling.Services;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Services
{
    public class ZengentiClientAdapter : IZengentiClient
    {
        private readonly ContensisClient _contensisClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ZengentiClientAdapter> _logger;

        private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ZengentiClientAdapter(
                    ContensisClient contensisClient, IMemoryCache cache,ILogger<ZengentiClientAdapter> logger,IHttpContextAccessor httpContextAccessor)
        {
            _contensisClient = contensisClient;
            _cache = cache;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        // ─── public API ──────────────────────────────────────────────────

        public async Task<CmsNode?> GetNodeByPathAsync(string path)
        {
            var cacheKey = $"node:{path}";
            if (_cache.TryGetValue(cacheKey, out CmsNode? cached) && cached != null)
                return cached;

            // Node fetch — we only need id/path/slug here.
            var node = await _contensisClient.Nodes.GetByPathAsync(
                path, entryFields: null, entryLinkDepth: 0);

            if (node == null) return null;

            // Fetch the entry directly. Node.EntryAsync() takes no parameters
            // and lazily resolves the entry without honouring entryFields,
            // which is why title and mainContent were coming back empty.
            var entryId = node.EntryId ?? node.Id;

            // Safe fetch: if the entry has a broken composed field (e.g. 'canvas'),
            // the SDK throws a NullReferenceException inside ObjectFactory.
            // TryGetEntryAsync logs and returns null so one bad entry can't take
            // the whole request down.
            var entry = await TryGetEntryAsync(entryId);
            if (entry == null) return null;

            var entryJson = JObject.FromObject(entry);

            async Task<JObject?> Resolver(Guid id) => await ResolveEntryAsync(id);

            await CanvasHydrator.HydrateAsync(entryJson, Resolver);

            var result = new CmsNode
            {
                EntryId = entryId,
                Path = node.Path,
                Slug = node.Slug,
                Title = entry.Get<string>("title") ?? node.DisplayName,
                ContentType = entry.ContentTypeId ?? "unknown",
                HtmlContent = entry.Get<string>("mainContent") ?? "",
                EntryJson = entryJson.ToString(Newtonsoft.Json.Formatting.None)
            };

            _cache.Set(cacheKey, result, CacheOptions());
            return result;
        }

        public async Task<JObject?> GetHydratedEntryByIdAsync(Guid entryId)
            => await ResolveEntryAsync(entryId);

        public async Task<List<CmsNode>> GetChildNodesAsync(string parentPath)
        {
            var cacheKey = $"children:{parentPath}";
            if (_cache.TryGetValue(cacheKey, out List<CmsNode>? cached) && cached != null)
                return cached;

            var parentNode = await _contensisClient.Nodes.GetByPathAsync(
                parentPath, entryFields: null, entryLinkDepth: 0);

            if (parentNode == null) return new List<CmsNode>();

            var children = await parentNode.ChildrenAsync();
            var list = new List<CmsNode>();

            foreach (var child in children)
            {
                var childEntryId = child.EntryId ?? child.Id;

                // Same guard as GetNodeByPathAsync — a child with a broken
                // composed field must not throw.
                var entry = await TryGetEntryAsync(childEntryId);

                list.Add(new CmsNode
                {
                    EntryId = childEntryId,
                    Path = child.Path,
                    Slug = child.Slug,
                    Title = entry?.Get<string>("title") ?? child.DisplayName,
                    ContentType = entry?.ContentTypeId ?? "unknown",
                    HtmlContent = string.Empty
                });
            }

            _cache.Set(cacheKey, list, CacheOptions());
            return list;
        }

        public async Task<List<string>> GetTopLevelSectionNamesAsync()
        {
            const string cacheKey = "top-level-sections";
            if (_cache.TryGetValue(cacheKey, out List<string>? cached) && cached != null)
                return cached;

            var rootNode = await _contensisClient.Nodes.GetRootAsync(
                entryFields: null, entryLinkDepth: 0);

            var children = await rootNode.ChildrenAsync();
            var slugs = new List<string>();

            foreach (var child in children)
            {
                var childEntryId = child.EntryId ?? child.Id;

                // Same guard again.
                var entry = await TryGetEntryAsync(childEntryId);

                slugs.Add(entry?.Slug ?? child.Slug);
            }

            _cache.Set(cacheKey, slugs, CacheOptions());
            return slugs;
        }

        // ─── private ─────────────────────────────────────────────────────

        private async Task<Entry?> TryGetEntryAsync(Guid entryId)
        {
            try
            {
                return await _contensisClient.Entries.GetAsync(entryId);
            }
            catch (Exception ex)
            {
                // Log the full exception (message + stack trace) — this is what
                // shows up in the terminal.
                _logger.LogError(
                    ex,
                    "Contensis entry {EntryId} could not be deserialised — " +
                    "likely a broken composed field (e.g. 'canvas'). " +
                    "Check the entry in the CMS and republish.",
                    entryId);

                // Stash the reason — including the full stack trace — so the
                // error page can display it in Development.
                var ctx = _httpContextAccessor.HttpContext;
                if (ctx is not null)
                {
                    var fullStackTrace = ex.ToString(); // includes type, message, inner exceptions, and stack trace

                    ctx.Items["CmsError"] =
                        $"Entry {entryId} could not be resolved: {ex.Message}"
                        + "\n\n"
                        + fullStackTrace;
                }

                return null;
            }
        }

        /// <summary>
        /// Resolve one entry id to its JSON. Cached by entry id.
        /// </summary>
        private async Task<JObject?> ResolveEntryAsync(Guid entryId)
        {
            var cacheKey = $"entry:{entryId}";
            if (_cache.TryGetValue(cacheKey, out JObject? cached) && cached != null)
                return cached;

            var entry = await TryGetEntryAsync(entryId);
            if (entry == null) return null;

            var json = JObject.FromObject(entry);

            _cache.Set(cacheKey, json, CacheOptions());
            return json;
        }

        private static MemoryCacheEntryOptions CacheOptions() =>
            new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(CacheTtl)
                .SetSize(1);
    }
}