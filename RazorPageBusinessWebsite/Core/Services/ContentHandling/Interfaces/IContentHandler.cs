using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces
{
    public interface IContentHandler
    {
        string ContentType { get; }

        bool CanHandle(string className);

        Task<IHtmlContent> HandleAsync(SerialisedItem item);
    }
}
