using Content.Modelling.Models.Canvas.Paragraphs;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    // INavigationLinkHelper.cs
    public interface INavigationLinkHelper
    {
        Task<string> GetLinkUrlAsync(string url);

        Task<FragmentParagraph> GetLinkUrlAsync(FragmentParagraph fragment);
    }
}
