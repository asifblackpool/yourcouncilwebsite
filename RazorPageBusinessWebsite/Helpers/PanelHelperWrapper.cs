using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using System.Web;

namespace RazorPageBusinessWebsite.Helpers
{
    public class PanelHelperWrapper : IPanelHelper
    {
        public IHtmlContent BuildPanel(CanvasPanelComplex panel)
        {
            string htmlString = PanelHelper.BuildPanel(panel); 
            return new HtmlString(htmlString);
        }
    }
}
