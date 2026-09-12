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

        public ZengentiClientAdapter(
            ContensisClient contensisClient,
            IMemoryCache cache,
            ILogger<ZengentiClientAdapter> logger)
        {
            _contensisClient = contensisClient;
            _cache = cache;
            _logger = logger;
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
            var entry = await _contensisClient.Entries.GetAsync(entryId);

            if (entry == null) return null;

            var entryJson = JObject.FromObject(entry);

            _logger.LogInformation(
                "Path={Path} | ContentType={CT} | Fields=[{Fields}] | mainContent={MC}",
                path,
                entry.ContentTypeId ?? "<null>",
                string.Join(", ", entryJson.Properties().Select(p => p.Name)),
                entry.Get<string>("mainContent") is string mc
                    ? (mc.Length > 80 ? mc.Substring(0, 80) + "..." : mc)
                    : "<null or not string>");

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
                var entry = await _contensisClient.Entries.GetAsync(childEntryId);

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
                var entry = await _contensisClient.Entries.GetAsync(childEntryId);

                slugs.Add(entry?.Slug ?? child.Slug);
            }

            _cache.Set(cacheKey, slugs, CacheOptions());
            return slugs;
        }

        // ─── private ─────────────────────────────────────────────────────

        /// <summary>
        /// Resolve one entry id to its JSON. Cached by entry id.
        /// </summary>
        private async Task<JObject?> ResolveEntryAsync(Guid entryId)
        {
            var cacheKey = $"entry:{entryId}";
            if (_cache.TryGetValue(cacheKey, out JObject? cached) && cached != null)
                return cached;

            try
            {
                var entry = await _contensisClient.Entries.GetAsync(entryId);
                if (entry == null) return null;

                var json = JObject.FromObject(entry);

                _cache.Set(cacheKey, json, CacheOptions());
                return json;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to resolve entry {EntryId}", entryId);
                return null;
            }
        }

        private static MemoryCacheEntryOptions CacheOptions() =>
            new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(CacheTtl)
                .SetSize(1);
    }
}