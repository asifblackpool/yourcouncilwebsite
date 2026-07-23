using RazorPageYourCouncilWebsite.Models;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Services
{
    public class ZengentiClientAdapter : IZengentiClient
    {
        private readonly ContensisClient _contensisClient;
        public ZengentiClientAdapter(ContensisClient contensisClient)
        {
            _contensisClient = contensisClient;
        }

        public async Task<List<CmsNode>> GetChildNodesAsync(string parentPath)
        {
            var parentNode = await _contensisClient.Nodes.GetByPathAsync(parentPath);
            var children = await parentNode.ChildrenAsync();
            var list = new List<CmsNode>();
            foreach (var child in children)
            {
                var entry = await child.EntryAsync();
                list.Add(new CmsNode
                {
                    Path = child.Path,
                    Slug = child.Slug,
                    Title = entry?.Get<string>("title") ?? child.DisplayName,
                    ContentType = entry?.ContentTypeId ?? "unknown",
                    HtmlContent = entry?.Get<string>("mainContent") ?? ""
                });
            }
            return list;
        }

        public async Task<CmsNode?> GetNodeByPathAsync(string path)
        {
            var node = await _contensisClient.Nodes.GetByPathAsync(path);
            if (node == null) return null;
            var entry = await node.EntryAsync();
            return new CmsNode
            {
                Path = node.Path,
                Slug = node.Slug,
                Title = entry?.Get<string>("title") ?? node.DisplayName,
                ContentType = entry?.ContentTypeId ?? "unknown",
                HtmlContent = entry?.Get<string>("mainContent") ?? ""
            };
        }

        public async Task<List<string>> GetTopLevelSectionNamesAsync()
        {
            var rootNode = await _contensisClient.Nodes.GetRootAsync();
            var children = await rootNode.ChildrenAsync();
            var slugs = new List<string>();
            foreach (var child in children)
            {
                var entry = await child.EntryAsync();
                slugs.Add(entry?.Slug ?? child.Slug);
            }
            return slugs;
        }
    }
}
