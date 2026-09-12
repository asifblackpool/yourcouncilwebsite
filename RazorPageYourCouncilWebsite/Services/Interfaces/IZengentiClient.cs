using RazorPageYourCouncilWebsite.Models;

namespace RazorPageYourCouncilWebsite.Services.Interfaces
{
    public interface IZengentiClient
    {
        Task<List<string>> GetTopLevelSectionNamesAsync();
        Task<CmsNode?> GetNodeByPathAsync(string path);
        Task<List<CmsNode>> GetChildNodesAsync(string parentPath);

        // NEW: fetch a single entry by id, hydrated with its inline refs resolved.
        Task<Newtonsoft.Json.Linq.JObject?> GetHydratedEntryByIdAsync(Guid entryId);
    }
}