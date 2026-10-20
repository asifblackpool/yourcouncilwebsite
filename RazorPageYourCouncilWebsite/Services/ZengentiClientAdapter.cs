using Content.Modelling.Helpers.Canvas;
using Content.Modelling.Services;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
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
        private readonly IHttpContextAccessor _httpContextAccessor;

        private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

        /// <summary>
        /// Fields we actually need on every entry we resolve. Narrowing this
        /// list is the single biggest lever on payload size — the Contensis
        /// API only returns what you ask for.
        /// </summary>
        private static readonly string[] EntryFields =
        {
            // ── Common page metadata ──
            "pageTitle",                        // title field on standardWebpage*, websiteLandingPage*, websiteSubsectionLandingPage
            "title",                            // legacy — no-op on current content types, kept for safety
            "slug",                             // node metadata — no-op, kept for safety
            "metaTitle",                        // standardWebpage, websiteLandingPageMain, websiteLandingPageMainCopy, websiteSubsectionLandingPage
            "shortText1",                       // meta title on standardWebpageImages, standardWebpageCopy, standardWebpageImagesCopy
            "metaDescription",
            "pageAlias",
            "chatBotID",
            "removeThisPageFromSearchEngines",
            "whichSectionOfTheWebsiteIsThisPageLocated",

            // ── Page content ──
            "canvas",
            "mainContent",                      // legacy — no-op, kept for safety
            "dataNavigationLink",               // standardWebpage additional info
            "entry",                            // standardWebpage / landing page child entries

            // ── Forms ──
            "formID",                           // standardWebpageCopy (legacy form embed)

            // ── Service announcements ──
            "serviceAnnouncement",              // websiteSubsectionLandingPage, standardWebpageCopy, standardWebpageImagesCopy

            // ── Tile landing pages ──
            "navigationTile",                   // websiteLandingPageMainCopy
            "howManyTilesInARowDoYouWant",      // websiteLandingPageMainCopy

            // ── Assets and links ──
            "asset",                            // standardWebpage, standardWebpageImages
            "url",                              // standardWebpageImages

            // ── Inline data entries: dataBGContactPanel ──
            "serviceName",
            "address",
            "phoneNumber11",                    // yes, this is Phone number 1 — the CMS field id is odd
            "phoneNumber1",                     // Phone number 2
            "phoneNumber2",                     // Phone number 3
            "emailAddress",
            "notes"
        };

        /// <summary>
        /// Per-request byte budget for the hydrated page tree. Once exceeded,
        /// remaining inline entries are left unresolved rather than expanding
        /// the tree further. Prevents a single pathological page from
        /// exhausting the container heap.
        /// </summary>
        private const long MaxHydratedBytes = 2_000_000;   // 2 MB

        /// <summary>
        /// Hard cap on how much a single resolved entry may contribute to the
        /// budget. Entries larger than this are logged and skipped.
        /// </summary>
        private const long MaxSingleEntryBytes = 500_000;  // 500 KB

        public ZengentiClientAdapter(
            ContensisClient contensisClient,
            IMemoryCache cache,
            ILogger<ZengentiClientAdapter> logger,
            IHttpContextAccessor httpContextAccessor)
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

            var entryId = node.EntryId ?? node.Id;

            // Fetch the entry with explicit field selection and no link
            // resolution. This is what prevents the huge payloads that were
            // blowing up deserialisation.
            var entry = await TryGetEntryAsync(entryId);
            if (entry == null) return null;

            var entryJson = JObject.FromObject(entry);

            // Skip hydration entirely for entries without a canvas — no
            // stubs to resolve, so no need to walk the tree.
            if (entryJson["canvas"] != null)
            {
                async Task<JObject?> Resolver(Guid id) => await ResolveEntryAsync(id);

                await CanvasHydrator.HydrateAsync(
                    entryJson,
                    Resolver,
                    maxDepth: 3,
                    maxResolvedBytes: MaxHydratedBytes);
            }

            // Serialise once. The string is what goes in the cache and what
            // the view consumes — we don't keep the JObject around.
            var entryJsonString = entryJson.ToString(Formatting.None);

            var result = new CmsNode
            {
                EntryId = entryId,
                Path = node.Path,
                Slug = node.Slug,
                // Title: pageTitle is the real title field on every content type
                // we use. title is legacy. Fall back to the node display name
                // if neither is populated.
                Title = entry.Get<string>("pageTitle")
                     ?? entry.Get<string>("title")
                     ?? node.DisplayName,
                ContentType = entry.ContentTypeId ?? "unknown",
                HtmlContent = entry.Get<string>("mainContent") ?? "",
                EntryJson = entryJsonString
            };

            _cache.Set(cacheKey, result, CacheOptions(entryJsonString.Length));
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

                // For child listings we only need the title and slug, not the
                // canvas. pageTitle is the real title field; title is legacy.
                var entry = await TryGetEntryAsync(
                    childEntryId,
                    fields: new[] { "pageTitle", "title", "slug" });

                list.Add(new CmsNode
                {
                    EntryId = childEntryId,
                    Path = child.Path,
                    Slug = child.Slug,
                    Title = entry?.Get<string>("pageTitle")
                         ?? entry?.Get<string>("title")
                         ?? child.DisplayName,
                    ContentType = entry?.ContentTypeId ?? "unknown",
                    HtmlContent = string.Empty
                });
            }

            _cache.Set(cacheKey, list, CacheOptions(list.Count * 64));
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

                var entry = await TryGetEntryAsync(
                    childEntryId,
                    fields: new[] { "slug" });

                slugs.Add(entry?.Slug ?? child.Slug);
            }

            _cache.Set(cacheKey, slugs, CacheOptions(slugs.Count * 32));
            return slugs;
        }

        // ─── private ─────────────────────────────────────────────────────

        /// <summary>
        /// Fetch an entry with explicit field selection and no link resolution.
        /// Returns null on any error so a single bad entry can't take the
        /// whole request down.
        /// </summary>
        private async Task<Entry?> TryGetEntryAsync(
            Guid entryId,
            string[]? fields = null)
        {
            try
            {
                return await _contensisClient.Entries.GetAsync(
                    entryId,
                    fields: fields ?? EntryFields,
                    linkDepth: 0);
            }
            catch (OutOfMemoryException)
            {
                // Don't try to build a fancy error message — the heap is
                // already exhausted. Fail fast and let the request 500.
                _logger.LogError(
                    "OutOfMemoryException resolving Contensis entry {EntryId}. " +
                    "Failing fast to avoid cascading failure.",
                    entryId);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Contensis entry {EntryId} could not be deserialised — " +
                    "likely a broken composed field (e.g. 'canvas'). " +
                    "Check the entry in the CMS and republish.",
                    entryId);

                var ctx = _httpContextAccessor.HttpContext;
                if (ctx is not null)
                {
                    ctx.Items["CmsError"] =
                        $"Entry {entryId} could not be resolved: {ex.Message}"
                        + "\n\n"
                        + ex.ToString();
                }

                return null;
            }
        }

        /// <summary>
        /// Resolve one entry id to its JSON. Cached as a compact string, not
        /// as a JObject — that way each call returns a fresh mutable tree and
        /// the cache holds only the serialised payload.
        /// </summary>
        private async Task<JObject?> ResolveEntryAsync(Guid entryId)
        {
            var cacheKey = $"entry:{entryId}";

            if (_cache.TryGetValue(cacheKey, out string? cachedJson) && cachedJson != null)
            {
                // Cached as a string — parse into a fresh tree so the hydrator
                // can safely mutate it without corrupting the cache.
                return JObject.Parse(cachedJson);
            }

            var entry = await TryGetEntryAsync(entryId);
            if (entry == null) return null;

            var json = JObject.FromObject(entry);
            var jsonString = json.ToString(Formatting.None);

            // Guard against pathological entries: if a single resolved entry
            // exceeds the per-entry cap, don't cache it — return it but log.
            if (jsonString.Length > MaxSingleEntryBytes)
            {
                _logger.LogWarning(
                    "Contensis entry {EntryId} is very large ({Size} bytes). " +
                    "Not caching; consider splitting this entry in the CMS.",
                    entryId, jsonString.Length);
                return json;
            }

            _cache.Set(cacheKey, jsonString, CacheOptions(jsonString.Length));
            return json;
        }

        /// <summary>
        /// Cache options with a size proportional to the payload. This only
        /// has an effect if IMemoryCache is registered with a SizeLimit
        /// (see Program.cs — 64 MB total).
        /// </summary>
        private static MemoryCacheEntryOptions CacheOptions(long sizeBytes) =>
            new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(CacheTtl)
                .SetSize(Math.Max(1, sizeBytes));
    }
}