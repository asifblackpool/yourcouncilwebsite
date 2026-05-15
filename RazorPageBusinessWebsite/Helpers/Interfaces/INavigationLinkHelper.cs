using Content.Modelling.Models.Canvas.Paragraphs;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    // INavigationLinkHelper.cs
    public interface INavigationLinkHelper
    {
        Task<string> GetLinkUrlAsync(string url);

        Task<FragmentParagraph> GetLinkUrlAsync(FragmentParagraph fragment);
    }
}
