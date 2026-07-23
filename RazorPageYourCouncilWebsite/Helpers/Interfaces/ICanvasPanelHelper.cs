using Content.Modelling.Models.Canvas.Panels;
using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    public interface ICanvasPanelHelper
    {
        IHtmlContent BuildPanel(CanvasPanel panel);
    }
}
