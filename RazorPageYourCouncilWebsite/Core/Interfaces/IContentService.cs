
using Content.Modelling.Models.Interfaces;

namespace RazorPageYourCouncilWebsite.Core.Interfaces
{
    public interface IContentService
    {
        List<IPageTemplates> GetChildPages(string parentUri);
    }
}
