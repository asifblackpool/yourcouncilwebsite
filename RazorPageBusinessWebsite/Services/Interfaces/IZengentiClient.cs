using RazorPageBusinessWebsite.Models;
using System.Xml;

namespace RazorPageBusinessWebsite.Services.Interfaces
{
    public interface IZengentiClient
    {
        Task<List<string>> GetTopLevelSectionNamesAsync();
        Task<CmsNode?> GetNodeByPathAsync(string path);
        Task<List<CmsNode>> GetChildNodesAsync(string parentPath);
    }
}
