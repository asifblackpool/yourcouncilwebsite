using Content.Modelling.Models.Interfaces;
using RazorPageYourCouncilWebsite.Models;

namespace RazorPageYourCouncilWebsite.Core.Interfaces
{
    public interface IContentRepository
    {
        Task<List<T>> GetChildEntriesAsync<T>(string parentUri)
            where T : class, IPageTemplates;

        Task<List<CmsNodeInfo>> GetTopLevelSectionsAsync(string parentPath);

        Task<CmsNode?> GetNodeByPathAsync(string path);
    }

    public class CmsNodeInfo
    {
        public string Slug { get; set; } = "";
        public string ContentTypeId { get; set; } = "";
    }
}