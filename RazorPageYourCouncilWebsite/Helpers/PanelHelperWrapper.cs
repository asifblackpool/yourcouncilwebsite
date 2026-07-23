using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using System.Web;

namespace RazorPageYourCouncilWebsite.Helpers
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
