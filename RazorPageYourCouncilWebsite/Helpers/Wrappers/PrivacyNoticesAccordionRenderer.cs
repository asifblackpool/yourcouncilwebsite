using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using Content.Modelling.HtmlWrapper.PrivacyNotices;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Helpers.Wrappers
{
    public class PrivacyNoticesAccordionRenderer : IPrivacyNoticesAccordionRenderer
    {
        private const string TocPlaceholderRenderedKey = "PrivacyNotices.TocPlaceholderRendered";

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

            var sections = _wrapper.BuildPrivacyNotesNew(title, label, 5);

            var helper = viewContext.HttpContext.RequestServices
                .GetRequiredService<IViewComponentHelper>();

            (helper as IViewContextAware)?.Contextualize(viewContext);

            var renderableSections = sections
                .Where(s => s?.Items != null && s.Items.Any())
                .ToList();

            using var writer = new StringWriter();

            // Security guard: only emit the TOC placeholder once per HTTP request,
            // before the first accordion that appears on the page. Subsequent
            // components on the same page see the flag and skip it.
            // The list itself is populated client-side (see privacy-notices-toc.js).
            var items = viewContext.HttpContext.Items;
            bool placeholderAlreadyRendered = items.TryGetValue(TocPlaceholderRenderedKey, out var flag)
                                              && flag is true;

            if (!placeholderAlreadyRendered && renderableSections.Any())
            {
                WriteTocPlaceholder(writer);
                items[TocPlaceholderRenderedKey] = true;
            }

            // Each section (heading + accordion) for THIS component
            foreach (var section in renderableSections)
            {
                var rendered = await helper.InvokeAsync("PrivacyNotices", section);
                rendered.WriteTo(writer, HtmlEncoder.Default);
            }

            return new HtmlString(writer.ToString());
        }

        private static void WriteTocPlaceholder(StringWriter writer)
        {
            writer.Write("<nav id='privacy-list-container' aria-label='Privacy notice sections' hidden>");
            writer.Write("<ul class='shade-black'></ul>");
            writer.Write("</nav>");
        }
    }
}