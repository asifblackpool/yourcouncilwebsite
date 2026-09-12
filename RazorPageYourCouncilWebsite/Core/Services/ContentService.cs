using Content.Modelling.Models.Interfaces;
using Content.Modelling.Models.Templates;
using RazorPageYourCouncilWebsite.Core.Interfaces;
using Content.Modelling.Models.Templates.Base;

namespace RazorPageYourCouncilWebsite.Core.Services
{
    

    // Core/Services/ContentService.cs
    public class ContentService : IContentService
    {
        private readonly IContentRepository _repository;

        public ContentService(IContentRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<IPageTemplates>> GetChildPagesAsync(string parentUri)
        {
            var entries = await _repository.GetChildEntriesAsync<BaseBG>(parentUri);
            return entries.Cast<IPageTemplates>().ToList();
        }
    }
}
