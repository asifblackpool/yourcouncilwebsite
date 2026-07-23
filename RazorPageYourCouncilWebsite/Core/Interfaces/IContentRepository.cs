
using Content.Modelling.Models.Interfaces;
using RazorPageYourCouncilWebsite.Models;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Core.Interfaces
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
