using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.Rendering;

using Content.Modelling.Models.Templates;
using Content.Modelling.Models.Templates.Base;
using RazorPageBusinessWebsite.ViewModels;
using Content.Modelling.Models.Accordions;
using System.IO;

//Taghhelper
namespace RazorPageBusinessWebsite.TagHelpers
{
    [HtmlTargetElement("bg-model")]
    public class BGModelTagHelper : TagHelper
    {
        [HtmlAttributeName("model")]
        public DetailsViewModel? Model { get; set; }

        [ViewContext]
        [HtmlAttributeNotBound]
        public ViewContext? ViewContext { get; set; }

        private IViewComponentHelper? _viewComponentHelper;

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (Model?.ConcreteModel == null)
            {
                output.SuppressOutput();
                return;
            }

            try
            {
                // Ensure ViewComponentHelper is available
                if (!EnsureViewComponentHelper())
                {
                    output.TagName = "div";
                    output.Attributes.SetAttribute("class", "alert alert-danger");
                    output.PostElement.AppendHtml("<p>Error: ViewComponentHelper is not available.</p>");
                    return;
                }

                // Render canvas (if model supports it)
                string canvasHtml = await RenderCanvasAsync();

                // Clear any existing content
                output.Content.Clear();

                // Render type-specific content
                if (Model.ConcreteModel is BGStandard ||
                    Model.ConcreteModel is BGStandardWithImages ||
                    Model.ConcreteModel is BGStandardWithDocuments)
                {
                    output.PostElement.AppendHtml(canvasHtml);
                }
                else if (Model.ConcreteModel is BGStandardWithForms forms)
                {
                    output.PostElement.AppendHtml(canvasHtml);
                    if (!string.IsNullOrEmpty(forms.FormID))
                    {
                        string temp = GetLegacyFormEmbed(forms.FormID);
                        output.PostElement.AppendHtml(temp);
                    }
                }
                else if (Model.ConcreteModel is BGServiceLandingAccordion accordionModel)
                {
                    // Output canvas first
                    output.PostElement.AppendHtml(canvasHtml);

                    // Render tile navigation component
                    string accordionHtml = await RenderViewComponentAsync("Accordions",accordionModel);
                    output.PostElement.AppendHtml(accordionHtml);
                }
                else if (Model.ConcreteModel is BGServiceLandingTile tileModel)
                {
                    // Output canvas first
                    output.PostElement.AppendHtml(canvasHtml);

                    // Render tile navigation component
                    string tileNavHtml = await RenderViewComponentAsync(
                        "TileNavigation",
                        new { list = tileModel.NavigationTile, layout = tileModel.TileLayout });

                    output.PostElement.AppendHtml(tileNavHtml);
                }
                else
                {
                    // Fallback for unknown types
                    output.TagName = "div";
                    output.Attributes.SetAttribute("class", "alert alert-warning");
                    output.PostElement.AppendHtml(RenderFallback(Model.ConcreteModel));
                }
            }
            catch (Exception ex)
            {
                output.TagName = "div";
                output.Attributes.SetAttribute("class", "alert alert-danger");
                output.PostElement.AppendHtml($"<p>Error rendering content: {ex.Message}</p>");
            }
        }

        private bool EnsureViewComponentHelper()
        {
            if (_viewComponentHelper == null)
            {
                _viewComponentHelper = ViewContext?.HttpContext.RequestServices.GetRequiredService<IViewComponentHelper>();
                if (_viewComponentHelper == null)
                    return false;
            }
            // Contextualize the helper (required for proper execution)
            (_viewComponentHelper as IViewContextAware)?.Contextualize(ViewContext);
            return true;
        }

        private async Task<string> RenderCanvasAsync()
        {
            if (Model?.ConcreteModel is IHasSerialisedCanvas hasCanvas)
            {
                var canvasData = hasCanvas.GetSerialisedCanvas();
                if (canvasData != null)
                {
                    return await RenderViewComponentAsync("Canvas", canvasData);
                }
            }
            return string.Empty;
        }

        private async Task<string> RenderViewComponentAsync(string componentName, object arguments)
        {
            if (_viewComponentHelper == null)
                return string.Empty;

            var content = await _viewComponentHelper.InvokeAsync(componentName, arguments);
            using (var writer = new System.IO.StringWriter())
            {
                content.WriteTo(writer, System.Text.Encodings.Web.HtmlEncoder.Default);
                return writer.ToString();
            }
        }

        private string RenderFallback(object model)
        {
            return $@"<div class='alert alert-warning'>
                <p>Unknown model type: {model.GetType().Name}</p>
                <p>ContentTypeId: {(model as BaseBG)?.Sys.ContentTypeId ?? "Unknown"}</p>
            </div>";
        }

        // Helper method for legacy form embed
        private string GetLegacyFormEmbed(string formId, int height = 900)
        {
            return $@"
            <div class='contensis-form-wrapper contensis-form-{formId}'>
                <iframe 
                    src='https://www.blackpool.gov.uk/Testing/forms/FormInPageRenderer.aspx?id={formId}'
                    width='100%'
                    height='{height}px'
                    style='border:0;'>
                </iframe>
            </div>";
        }
    }
}