
using Content.Modelling.Models.Interfaces;

namespace RazorPageYourCouncilWebsite.Core.Interfaces
{
    public interface IContentService
    {
        Task<List<IPageTemplates>> GetChildPagesAsync(string parentUri);
    }
}
