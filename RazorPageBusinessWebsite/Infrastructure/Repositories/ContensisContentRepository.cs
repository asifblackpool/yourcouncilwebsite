using Content.Modelling.Models.Interfaces;
using RazorPageBusinessWebsite.Core.Interfaces;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Infrastructure.Repositories
{
    // Infrastructure/Repositories/ContensisRepository.cs
    using Zengenti.Contensis.Delivery;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Content.Modelling.Models.Interfaces;
    using Content.Modelling.Models.Templates;
    using RazorPageBusinessWebsite.Services;
    using RazorPageBusinessWebsite.Models;

    public class ContensisContentRepository : IContentRepository
    {
        private readonly IContensisClientResolver _client;

        public ContensisContentRepository(IContensisClientResolver client)
        {
            _client = client ?? throw new ArgumentNullException(nameof(client));
        }

        public List<T> GetChildEntries<T>(string parentUri) where T : class, IPageTemplates
        {
            var results = new List<T>();

            // 1. Get the parent node by its URI
            var parentNode = _client.GetClient().Nodes.GetByPath(parentUri);

            if (parentNode == null)
                return results;

            // 2. Loop through its children and get their entries typed as T
            var children = parentNode.Children();
            if (children == null || !children.Any())
                return results;

            foreach (var childNode in children)
            {
                var entry = childNode.Entry<T>();
                if (entry != null)
                    results.Add(entry);
            }

            return results;
        }

        public List<CmsNodeInfo>GetTopLevelSections(string parentPath)
        {
            var parentNode = _client.GetClient().Nodes.GetByPath(parentPath);
            if (parentNode == null) return new List<CmsNodeInfo>();

            var children = parentNode.Children();
            var result = new List<CmsNodeInfo>();

            foreach (var child in children)
            {
                var entry = child.Entry();
                string contentTypeId = entry?.ContentTypeId ?? "unknown";
                result.Add(new CmsNodeInfo { ContentTypeId = contentTypeId, Slug = child.Slug });
            }

            return result;
        }

        public async Task<CmsNode?> GetNodeByPathAsync(string path)
        {
            var client = _client.GetClient();
            // Use async method if available, otherwise wrap sync
            var node = await client.Nodes.GetByPathAsync(path);
            if (node == null) return null;

            var entry = await node.EntryAsync();
            return new CmsNode
            {
                Path = node.Path,
                Slug = node.Slug,
                Title = entry?.Get<string>("title") ?? node.DisplayName,
                ContentType = entry?.ContentTypeId ?? "unknown",
                HtmlContent = entry?.Get<string>("mainContent") ?? "",
                Children = new List<CmsNode>() // optionally load children if needed
            };
        }


    }

}
