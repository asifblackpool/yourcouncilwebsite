using Content.Modelling.Models.Canvas.Paragraphs;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Moq;
using Newtonsoft.Json;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using Zengenti;




namespace BusinessWebsite.UnitTests.Utilities
{

    public static class TestDataGenerator
    {
        public static SerialisedItem CreateContentItem<T>(object contentData, string? className = null)
            where T : class
        {
            string classname = className?? typeof(T).Name;
            return new SerialisedItem(
                content: JsonConvert.SerializeObject(contentData),
                t: typeof(T),
                container: classname,
                key: $"moq {typeof(T).Name} content"
            );
        }

        // Specific helpers for common cases
        public static SerialisedItem CreateCanvasParagraphItem(string content = "Test content")
        {
            return CreateContentItem<CanvasParagraph>(new CanvasParagraph { Value = content });
        }

        public static (Mock<ISerializationHelper>, Mock<INavigationLinkHelper>, Mock<IParagraphHelper>)
    CreateFragmentParagraphMocks(
        string linkUrl = "/test-url",
        string htmlContent = "<span>Tests</span>",
        FragmentParagraph? customFragment = null)
        {
            // Create default fragment if none provided
            var fragment = customFragment ?? new FragmentParagraph { /* default properties */ };

            // Setup mocks
            var mockSerializer = new Mock<ISerializationHelper>();
            mockSerializer.Setup(x => x.Deserialize<FragmentParagraph>(It.IsAny<SerialisedItem>()))
                .Returns(fragment);

            //var mockNavHelper = new Mock<INavigationLinkHelper>();
            //mockNavHelper.Setup(x => x.GetLinkUrlAsync(It.IsAny<FragmentParagraph>()))
            //    .ReturnsAsync(linkUrl);

            // Properly typed mock setup for INavigationLinkHelper
            var mockNavHelper = new Mock<INavigationLinkHelper>();

            // Setup for FragmentParagraph version
            mockNavHelper.Setup(x => x.GetLinkUrlAsync(It.IsAny<FragmentParagraph>()))
                .ReturnsAsync((FragmentParagraph fp) =>
                {
                    // Return a new FragmentParagraph with processed URL
                    return new FragmentParagraph
                    {
                        Id    = fp.Id,
                        Value = fp.Value // Preserve original content
                    };
                });

            // Setup for string version
            mockNavHelper.Setup(x => x.GetLinkUrlAsync(It.IsAny<string>()))
                .ReturnsAsync((string url) => "processed/" + url); // Example transformation

            var mockParaHelper = new Mock<IParagraphHelper>();
            //mockParaHelper.Setup(x => x.FragmentParagraphAsync(It.IsAny<string>()))
            //    .ReturnsAsync(new HtmlString(htmlContent));

            mockParaHelper.Setup(x => x.FragmentParagraphAsync(It.IsAny<FragmentParagraph>()))
                .ReturnsAsync((FragmentParagraph fp) =>
                {
                    // Return a new FragmentParagraph with processed URL
                    return new HtmlString("link");
                     
                });

            return (mockSerializer, mockNavHelper, mockParaHelper);
        }

    }
}

