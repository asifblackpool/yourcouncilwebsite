using Content.Modelling.Models.Canvas.Paragraphs;
using Microsoft.AspNetCore.Mvc.Rendering;
using Moq;
using RazorPageBusinessWebsite.Models.Services.ContentHandling.Handlers;
using BusinessWebsite.UnitTests.Helpers;
using BusinessWebsite.UnitTests.Utilities;
using Xunit;

namespace BusinessWebsite.UnitTests.ContentHandlers
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
