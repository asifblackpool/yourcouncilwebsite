using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using Content.Modelling.HtmlWrapper.PrivacyNotices;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.DependencyInjection;
using RazorPageYourCouncilWebsite.Components.Extensions;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Helpers.Wrappers
{
    public class PrivacyNoticesAccordionRenderer : IPrivacyNoticesAccordionRenderer
    {
        private readonly PrivacyNoticeHtmlWrapper _wrapper;

        public PrivacyNoticesAccordionRenderer(PrivacyNoticeHtmlWrapper wrapper)
        {
            _wrapper = wrapper ?? throw new ArgumentNullException(nameof(wrapper));
        }

        public async Task<IHtmlContent> RenderAsync(string title, string label, ViewContext viewContext)
        {
            ArgumentNullException.ThrowIfNull(viewContext);

            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(label))
            {
                return HtmlString.Empty;
            }

            var sections = _wrapper.Build(5);

            var helper = viewContext.HttpContext.RequestServices
                .GetRequiredService<IViewComponentHelper>();

            (helper as IViewContextAware)?.Contextualize(viewContext);

            var renderableSections = sections
                .Where(s => s?.Items != null && s.Items.Any())
                .ToList();

            using var writer = new StringWriter();

            // Table of contents (jump links) — mirrors the original privacy-notices.cshtml
            writer.Write("<ul class=\"privacy-toc\">");
            foreach (var section in renderableSections)
            {
                writer.Write("<li><a href=\"#privacy-title-");
                writer.Write(HtmlEncoder.Default.Encode(section.AnchorId));
                writer.Write("\">");
                writer.Write(HtmlEncoder.Default.Encode(section.Title));
                writer.Write("</a></li>");
            }
            writer.Write("</ul>");

            // Each section (heading + accordion)
            foreach (var section in renderableSections)
            {
                var rendered = await helper.InvokeAsync("PrivacyNotices", section);
                rendered.WriteTo(writer, HtmlEncoder.Default);
            }

            return new HtmlString(writer.ToString());
        }
    }
}