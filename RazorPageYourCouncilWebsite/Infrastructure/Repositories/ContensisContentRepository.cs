using Content.Modelling.Helpers.Canvas;
using Content.Modelling.Models.Interfaces;
using Newtonsoft.Json.Linq;
using RazorPageYourCouncilWebsite.Core.Interfaces;
using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services;

namespace RazorPageBusinessWebsite.Infrastructure.Repositories
{
    public class ContensisContentRepository : IContentRepository
    {
        private readonly IContensisClientResolver _client;
        private readonly ILogger<ContensisContentRepository> _logger;

        public ContensisContentRepository(
            IContensisClientResolver client,
            ILogger<ContensisContentRepository> logger)
        {
            _client = client ?? throw new ArgumentNullException(nameof(client));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Returns typed entries for all children of the given parent node.
        /// linkDepth 0 — no recursive resolution.
        /// </summary>
        public async Task<List<T>> GetChildEntriesAsync<T>(string parentUri)
            where T : class, IPageTemplates
        {
            var results = new List<T>();

            var client = _client.GetClient();

            var parentNode = await client.Nodes.GetByPathAsync(
                parentUri, entryFields: null, entryLinkDepth: 0);

            if (parentNode == null)
                return results;

            var children = await parentNode.ChildrenAsync();
            if (children == null || !children.Any())
                return results;

            foreach (var childNode in children)
            {
                var entry = await childNode.EntryAsync<T>();
                if (entry != null)
                    results.Add(entry);
            }

            return results;
        }

        /// <summary>
        /// Returns top-level section slugs + content types under the given path.
        /// linkDepth 0 — no recursive resolution.
        /// </summary>
        public async Task<List<CmsNodeInfo>> GetTopLevelSectionsAsync(string parentPath)
        {
            var client = _client.GetClient();

            var parentNode = await client.Nodes.GetByPathAsync(
                parentPath, entryFields: null, entryLinkDepth: 0);

            if (parentNode == null)
                return new List<CmsNodeInfo>();

            var children = await parentNode.ChildrenAsync();
            var result = new List<CmsNodeInfo>();

            foreach (var child in children)
            {
                var entry = await child.EntryAsync();
                string contentTypeId = entry?.ContentTypeId ?? "unknown";
                result.Add(new CmsNodeInfo
                {
                    ContentTypeId = contentTypeId,
                    Slug = child.Slug
                });
            }

            return result;
        }

        /// <summary>
        /// Fetches a node by path, hydrating any inline entries in its canvas.
        /// linkDepth 0 at the SDK level; hydration is done in-process via
        /// CanvasHydrator so nested inline refs are resolved lazily and cached.
        /// </summary>
        public async Task<CmsNode?> GetNodeByPathAsync(string path)
        {
            var client = _client.GetClient();

            var node = await client.Nodes.GetByPathAsync(
                path, entryFields: null, entryLinkDepth: 0);

            if (node == null) return null;

            var entry = await node.EntryAsync();
            if (entry == null) return null;

            // Serialize the entry to JSON, then hydrate inline refs in place.
            var entryJson = JObject.FromObject(entry);

            async Task<JObject?> Resolver(Guid id)
            {
                try
                {
                    // linkDepth 0 — nested inline refs handled by the
                    // recursive Walk inside CanvasHydrator, not by Contensis.
                    var resolved = await client.Entries.GetAsync(id, linkDepth: 0);
                    return resolved != null ? JObject.FromObject(resolved) : null;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Failed to resolve inline entry {EntryId}", id);
                    return null;
                }
            }

            await CanvasHydrator.HydrateAsync(entryJson, Resolver);

            return new CmsNode
            {
                EntryId = (node.EntryId != null) ? (Guid)node.EntryId : node.Id,
                Path = node.Path,
                Slug = node.Slug,
                Title = entry.Get<string>("title") ?? node.DisplayName,
                ContentType = entry.ContentTypeId ?? "unknown",
                HtmlContent = entry.Get<string>("mainContent") ?? "",
                EntryJson = entryJson.ToString(Newtonsoft.Json.Formatting.None)
            };
        }
    }
}