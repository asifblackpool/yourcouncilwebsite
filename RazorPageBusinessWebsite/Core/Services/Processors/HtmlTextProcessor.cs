
using HtmlAgilityPack;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using System.Xml;

namespace RazorPageBusinessWebsite.Core.Services.Processors
{


    public class HtmlTextProcessor : ITextProcessor
    {
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

            try
            {
                // Load HTML document on current thread (lightweight operation)
                var document = new HtmlDocument();
                document.LoadHtml(htmlContent);

                // Process transformations in parallel when safe to do so
                var transformationTasks = _transformations
                    .Select(async transformation =>
                    {
                        try
                        {
                            await transformation.ApplyAsync(document).ConfigureAwait(false);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error in transformation {Transformation}",
                                transformation.GetType().Name);
                        }
                    })
                    .ToList();

                // Wait for all transformations to complete
                await Task.WhenAll(transformationTasks).ConfigureAwait(false);

                // Return processed HTML (single-threaded DOM operation)
                return document.DocumentNode.OuterHtml;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing HTML content");
                return htmlContent; // Return original on error
            }
        }


    }

    public class LinkTargetTransformer : IHtmlTransformation
    {
        public Task ApplyAsync(HtmlDocument document)
        {
            foreach (var link in document.DocumentNode.SelectNodes("//a[@href]") ?? Enumerable.Empty<HtmlNode>())
            {
                if (!link.Attributes["href"].Value.StartsWith("#")
                    && !link.Attributes["href"].Value.StartsWith("/"))
                {
                    link.SetAttributeValue("target", "_blank");
                    link.SetAttributeValue("rel", "noopener noreferrer");
                }
            }
            return Task.CompletedTask;
        }
    }


}
