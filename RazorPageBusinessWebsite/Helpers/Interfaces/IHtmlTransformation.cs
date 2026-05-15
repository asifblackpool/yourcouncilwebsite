using HtmlAgilityPack;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface IHtmlTransformation
    {
        Task ApplyAsync(HtmlDocument document);
    }
}
