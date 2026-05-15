using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface IPanelHelper
    {
        IHtmlContent BuildPanel(CanvasPanelComplex panel);
    }
}
