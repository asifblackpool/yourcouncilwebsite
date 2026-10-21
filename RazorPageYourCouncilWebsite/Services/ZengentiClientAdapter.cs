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
        ///
        /// IMPORTANT: with linkDepth: 0, the API only returns fields requested
        /// here. Any content type reachable as an _inlineEntry MUST have its
        /// top-level field ids listed below, or its resolved entries come back
        /// as { sys: {...} } only — which looks identical to an unresolved stub.
        /// </summary>
        private static readonly string[] EntryFields =
        {
            // ── Common page metadata ──
            "pageTitle",
            "title",
            "slug",
            "metaTitle",
            "shortText1",
            "metaDescription",
            "pageAlias",
            "chatBotID",
            "removeThisPageFromSearchEngines",
            "whichSectionOfTheWebsiteIsThisPageLocated",

            // ── Page content ──
            "canvas",
            "mainContent",
            "dataNavigationLink",
            "entry",

            // ── Forms ──
            "formID",

            // ── Service announcements ──
            "serviceAnnouncement",

            // ── Tile landing pages ──
            "navigationTile",
            "howManyTilesInARowDoYouWant",

            // ── Assets and links ──
            "asset",
            "url",

            // ── Inline data entries: dataBGContactPanel ──
            "serviceName",
            "address",
            "phoneNumber11",
            "phoneNumber1",
            "phoneNumber2",
            "emailAddress",
            "notes",

            // ── Inline data entries: accordions ──
            "accordionName",
            "accordionContent"
        };

        /// <summary>
        /// Per-request byte budget for the hydrated page tree. Once exceeded,
        /// remaining inline entries are left unresolved rather than expanding
        /// the tree further. Prevents a single pathological page from
        /// exhausting the container heap.
        /// </summary>
        private const long MaxHydratedBytes = 3_000_000;   // 3 MB

        /// <summary>
        /// Hard cap on how much a single resolved entry may contribute to the
        /// budget. Entries larger than this are logged and skipped.
        /// </summary>
        private const long MaxSingleEntryBytes = 500_000;  // 500 KB

        /// <summary>
        /// Maximum depth the canvas hydrator will recurse into nested inline
        /// entries. 4 is sufficient for all known content types; raise only if
        /// a new content type nests inline entries more deeply, and confirm
        /// with the "genuinely unresolved" warning before doing so.
        /// </summary>
        private const int MaxHydrationDepth = 4;

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

            var node = await _contensisClient.Nodes.GetByPathAsync(
                path, entryFields: null, entryLinkDepth: 0);

            if (node == null) return null;

            var entryId = node.EntryId ?? node.Id;

            var entry = await TryGetEntryAsync(entryId);
            if (entry == null) return null;

            var entryJson = JObject.FromObject(entry);

            if (entryJson["canvas"] != null)
            {
                async Task<JObject?> Resolver(Guid id) => await ResolveEntryAsync(id);

                await CanvasHydrator.HydrateAsync(
                    entryJson,
                    Resolver,
                    maxDepth: MaxHydrationDepth,
                    maxResolvedBytes: MaxHydratedBytes);

                // Diagnostic: only report stubs that are GENUINELY unresolved —
                // i.e. a _inlineEntry whose value has nothing but a "sys" block.
                // A successfully resolved entry for a non-page content type
                // (e.g. accordion) has no "canvas" field, so we can't rely on
                // that; instead we treat "value contains only sys" as the stub
                // signature. This is the early-warning for a content type that
                // has been added to the canvas without its fields being added
                // to EntryFields.
                var trulyUnresolved = entryJson.Descendants()
                    .OfType<JObject>()
                    .Where(o => o["type"]?.ToString() == "_inlineEntry")
                    .Where(o => o["value"] is JObject v
                             && v["sys"]?["id"] != null
                             && v.Count == 1)   // only "sys" → still a stub
                    .Select(o => o["value"]!["sys"]!["id"]!.ToString())
                    .Distinct()
                    .ToList();

                if (trulyUnresolved.Count > 0)
                {
                    _logger.LogWarning(
                        "Entry {EntryId} left {Count} inline stubs genuinely unresolved after hydration: {Ids}",
                        entryId, trulyUnresolved.Count, string.Join(",", trulyUnresolved));
                }
            }

            var entryJsonString = entryJson.ToString(Formatting.None);

            var result = new CmsNode
            {
                EntryId = entryId,
                Path = node.Path,
                Slug = node.Slug,
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
                var effectiveFields = fields ?? EntryFields;
                var entry = await _contensisClient.Entries.GetAsync(
                    entryId,
                    fields: effectiveFields,
                    linkDepth: 0);

                // Guard: if the entry came back with only a "sys" block, its
                // content type has no fields listed in EntryFields. That entry
                // will render as an empty/stub entry — surface it here rather
                // than letting it fail silently four layers downstream.
                if (entry != null)
                {
                    var probe = JObject.FromObject(entry);
                    if (probe.Count == 1 && probe["sys"] != null)
                    {
                        _logger.LogWarning(
                            "Entry {EntryId} ({ContentType}) returned only 'sys' — " +
                            "its content type has no fields listed in EntryFields. " +
                            "Add them or it will render as an empty/stub entry.",
                            entryId, entry.ContentTypeId);
                    }
                }

                return entry;
            }
            catch (OutOfMemoryException)
            {
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
                return JObject.Parse(cachedJson);

            var entry = await TryGetEntryAsync(entryId);
            if (entry == null)
            {
                _logger.LogWarning(
                    "ResolveEntryAsync: entry {EntryId} returned null " +
                    "(see TryGetEntryAsync log for cause)",
                    entryId);
                return null;
            }

            var json = JObject.FromObject(entry);
            var jsonString = json.ToString(Formatting.None);

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