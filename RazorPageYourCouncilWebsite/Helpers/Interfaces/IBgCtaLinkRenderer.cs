using Content.Modelling.Models.Components.Data;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Sprache;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    public interface IBgCtaLinkRenderer
    {
        Task<IHtmlContent> RenderBgCtaButtonAsync(BGCTALink cta, string buttonClass);
    }



}
