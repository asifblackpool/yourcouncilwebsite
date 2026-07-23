using Content.Modelling.Models.Canvas.Lists;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Helpers.Html
{

    public class ContentFragmentHelper : IContentFragmentHelper
    {
        private readonly ITextProcessor _textProcessor;

        public ContentFragmentHelper(ITextProcessor textProcessor)
        {
            _textProcessor = textProcessor;
        }

        public async Task<IHtmlContent> BuildHtmlFragmentAsync(List<ContentFragment> fragments, string wrapperFormat)
        {
            var htmlContent = new HtmlContentBuilder();

            if (fragments == null || !fragments.Any())
            {
                return htmlContent;
            }

            foreach (var fragment in fragments)
            {
                var processedContent = await ProcessFragmentAsync(fragment);
                htmlContent.AppendHtml(string.Format(wrapperFormat, processedContent));
            }

            return htmlContent;
        }

        public IHtmlContent BuildHtmlFragment(List<ContentFragment> fragments, string wrapperFormat)
        {
            // Sync version for compatibility
            return BuildHtmlFragmentAsync(fragments, wrapperFormat).GetAwaiter().GetResult();
        }

        private async Task<string> ProcessFragmentAsync(ContentFragment fragment)
        {
            if (fragment == null)
            {
                return string.Empty;
            }

            switch (fragment)
            {
                case TextFragment textFragment:
                    return await _textProcessor.ProcessAsync(textFragment.Text);

                case HtmlFragment htmlFragment:
                    return (htmlFragment.HtmlContent != null) ? htmlFragment.HtmlContent : string.Empty;

                case LinkFragment linkFragment:
                    return $"<a href=\"{linkFragment.Url}\">{await _textProcessor.ProcessAsync(linkFragment.Text)}</a>";

                case ImageFragment imgFragment:
                    return $"<img src=\"{imgFragment.Source}\" alt=\"{await _textProcessor.ProcessAsync(imgFragment.AltText)}\">";

                default:
                    return string.Empty;
            }
        }
    }

 
}
