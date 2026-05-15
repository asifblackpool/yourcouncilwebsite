using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using System.Web;

namespace RazorPageBusinessWebsite.Helpers.Wrappers
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
