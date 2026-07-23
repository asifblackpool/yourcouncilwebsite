using RazorPageYourCouncilWebsite.Models;

namespace RazorPageYourCouncilWebsite.Services.Interfaces
{
    public interface ICmsViewModelFactory
    {
        Task<(string ViewName, object ViewModel)> CreateAsync(CmsNode node);
    }
}
