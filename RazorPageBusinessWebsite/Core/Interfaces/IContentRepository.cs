
using Content.Modelling.Models.Interfaces;
using RazorPageBusinessWebsite.Models;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Core.Interfaces
{
    public interface IContentRepository
    {
        //List<T> GetChildEntries<T>(string parentUri);
        List<T> GetChildEntries<T>(string parentUri) where T : class, IPageTemplates;

        // New async method
        List<CmsNodeInfo> GetTopLevelSections(string parentPath);

        Task<CmsNode?> GetNodeByPathAsync(string path);
    }

    public class CmsNodeInfo
    {
        public string Slug { get; set; } = "";
        public string ContentTypeId { get; set; } = "";
    }
}
