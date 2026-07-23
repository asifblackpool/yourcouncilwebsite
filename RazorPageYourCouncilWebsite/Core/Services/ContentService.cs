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

        public List<IPageTemplates> GetChildPages(string parentUri)
        {
            return _repository.GetChildEntries<BaseBG>(parentUri)
                       .Cast<IPageTemplates>()
                       .ToList();
        }
    }
}
