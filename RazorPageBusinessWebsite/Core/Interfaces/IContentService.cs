
using Content.Modelling.Models.Interfaces;

namespace RazorPageBusinessWebsite.Core.Interfaces
{
    public interface IContentService
    {
        List<IPageTemplates> GetChildPages(string parentUri);
    }
}
