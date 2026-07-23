using Content.Modelling.Models.Canvas.Paragraphs;
using Microsoft.AspNetCore.Mvc.Rendering;
using Moq;
using RazorPageYourCouncilWebsite.Models.Services.ContentHandling.Handlers;
using YourCouncilWebsite.UnitTests.Helpers;
using YourCouncilWebsite.UnitTests.Utilities;
using Xunit;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{
    public class FragmentParagraphHandlerTests
    {
        [Fact]
        public async Task HandleAsync_ReturnsParagraphWithProcessedFragment()
        {
            // Arrange
            var (mockSerializer, mockNavHelper, mockParaHelper) = TestDataGenerator.CreateFragmentParagraphMocks();

            var testItem = TestDataGenerator.CreateContentItem<FragmentParagraph>(
                new FragmentParagraph { /* custom data if needed */ }
            );

            var handler = new FragmentParagraphHandler(mockSerializer.Object,mockParaHelper.Object,mockNavHelper.Object);

            // Act
            TagBuilder result = (TagBuilder)await handler.HandleAsync(testItem);


            // Assert
            result.ShouldRenderAs("<p>link</p>");
        }
    }
}
