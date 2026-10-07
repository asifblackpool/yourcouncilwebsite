using System.IO;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Helpers.Renderers
{
    public class WebCastRenderer : IWebCastRenderer
    {
        public async Task<IHtmlContent> RenderAsync(string? introOverride, ViewContext viewContext)
        {
            ArgumentNullException.ThrowIfNull(viewContext);

            // The webcast renders even with no override — the view falls
            // back to its default copy. Only null-check the ViewContext.

            var helper = viewContext.HttpContext.RequestServices
                .GetRequiredService<IViewComponentHelper>();

            (helper as IViewContextAware)?.Contextualize(viewContext);

            // Invoke the WebcastViewComponent by name, passing the
            // intro override (may be null — the view handles that).
            var rendered = await helper.InvokeAsync("WebCast", new { introOverride });

            using var writer = new StringWriter();
            rendered.WriteTo(writer, HtmlEncoder.Default);

            return new HtmlString(writer.ToString());
        }
    }
}