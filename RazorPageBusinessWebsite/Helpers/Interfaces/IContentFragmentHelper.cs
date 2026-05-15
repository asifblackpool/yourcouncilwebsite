
using Content.Modelling.Models.Canvas.Lists;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Helpers.Html;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface IContentFragmentHelper
    {
        Task<IHtmlContent> BuildHtmlFragmentAsync(List<ContentFragment> fragments, string wrapperFormat);
        IHtmlContent BuildHtmlFragment(List<ContentFragment> fragments, string wrapperFormat);
    }
}
