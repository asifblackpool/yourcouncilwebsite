using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using System.Web;

namespace RazorPageYourCouncilWebsite.Helpers.Wrappers
{
    public class CanvasPanelHelperWrapper : ICanvasPanelHelper
    {
        public IHtmlContent BuildPanel(CanvasPanel panel)
        {
            string htmlString = CanvasPanelHelper.BuildPanel(panel);
            return new HtmlString(htmlString);
        }
    }
}
