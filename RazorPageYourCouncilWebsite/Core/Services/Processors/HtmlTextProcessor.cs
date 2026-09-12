using HtmlAgilityPack;
using RazorPageYourCouncilWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using System.Xml;

namespace RazorPageYourCouncilWebsite.Core.Services.Processors
{
    public class HtmlTextProcessor : ITextProcessor
    {
        // Guard rails so a single oversized / malformed input cannot blow the parser.
        private const int MaxHtmlLength = 500_000; // ~500 KB. Tune to your largest legitimate page.

        private readonly ILogger<HtmlTextProcessor> _logger;
        private readonly List<IHtmlTransformation> _transformations;

        public HtmlTextProcessor(
            IEnumerable<IHtmlTransformation> transformations,
            ILogger<HtmlTextProcessor> logger)
        {
            _transformations = transformations.ToList();
            _logger = logger;
        }

        public string Process(string input)
        {
            throw new NotImplementedException();
        }

        public async Task<string> ProcessAsync(string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return htmlContent;

            // Do not feed raw CSV/XML/PDF/etc. into an HTML parser.
            if (!LooksLikeHtml(htmlContent))
                return htmlContent;

            // Hard cap: oversized inputs are returned untouched rather than parsed.
            if (htmlContent.Length > MaxHtmlLength)
            {
                _logger.LogWarning(
                    "HTML content exceeds MaxHtmlLength ({Length} > {Max}); skipping processing.",
                    htmlContent.Length, MaxHtmlLength);
                return htmlContent;
            }

            try
            {
                var document = new HtmlDocument();
                document.LoadHtml(htmlContent);

                // IMPORTANT: HtmlDocument / HtmlNode are NOT thread-safe.
                // Transformations must run sequentially, not in parallel.
                foreach (var transformation in _transformations)
                {
                    try
                    {
                        await transformation.ApplyAsync(document).ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Error in transformation {Transformation}",
                            transformation.GetType().Name);
                    }
                }

                return document.DocumentNode.OuterHtml;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing HTML content");
                return htmlContent; // Return original on error
            }
        }

        /// <summary>
        /// Cheap heuristic: does the input look like HTML rather than CSV/XML/plain text?
        /// Conservative — false positives just mean the processor runs as before.
        /// </summary>
        private static bool LooksLikeHtml(string input)
        {
            // Reject XML declarations and other clearly-non-HTML content up front.
            var trimmed = input.TrimStart();
            if (trimmed.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase))
                return false;

            // Must contain at least one common HTML tag opener.
            return trimmed.IndexOf("<p", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<div", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<a ", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<ul", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<ol", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<h1", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<h2", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<h3", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<table", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<img", StringComparison.OrdinalIgnoreCase) >= 0
                || trimmed.IndexOf("<span", StringComparison.OrdinalIgnoreCase) >= 0;
        }
    }

    public class LinkTargetTransformer : IHtmlTransformation
    {
        public Task ApplyAsync(HtmlDocument document)
        {
            foreach (var link in document.DocumentNode.SelectNodes("//a[@href]")
                         ?? Enumerable.Empty<HtmlNode>())
            {
                var href = link.Attributes["href"]?.Value;
                if (string.IsNullOrEmpty(href))
                    continue;

                if (!href.StartsWith("#", StringComparison.Ordinal)
                    && !href.StartsWith("/", StringComparison.Ordinal))
                {
                    link.SetAttributeValue("target", "_blank");
                    link.SetAttributeValue("rel", "noopener noreferrer");
                }
            }
            return Task.CompletedTask;
        }
    }
}