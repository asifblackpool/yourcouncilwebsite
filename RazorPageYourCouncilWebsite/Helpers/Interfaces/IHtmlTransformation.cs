using HtmlAgilityPack;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    public interface IHtmlTransformation
    {
        Task ApplyAsync(HtmlDocument document);
    }
}
