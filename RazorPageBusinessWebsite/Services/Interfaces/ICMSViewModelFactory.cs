using RazorPageBusinessWebsite.Models;

namespace RazorPageBusinessWebsite.Services.Interfaces
{
    public interface ICmsViewModelFactory
    {
        Task<(string ViewName, object ViewModel)> CreateAsync(CmsNode node);
    }
}
