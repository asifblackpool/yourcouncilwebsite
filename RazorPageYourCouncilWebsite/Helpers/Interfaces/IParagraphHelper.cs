using Content.Modelling.Models.Canvas.Paragraphs;
using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    // IParagraphHelper.cs
    public interface IParagraphHelper
    {
   
        Task<IHtmlContent> FragmentParagraphAsync(FragmentParagraph fp);
    }
}
