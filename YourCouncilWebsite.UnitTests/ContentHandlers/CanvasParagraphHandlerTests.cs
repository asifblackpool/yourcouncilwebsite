// ContentHandlers/CanvasParagraphHandlerTests.cs
using Moq;
using Xunit;
using Content.Modelling.Models.Canvas.Paragraphs;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Core.Services.ContentProcessing.Interfaces;
using YourCouncilWebsite.UnitTests.ContentHandlers.Base;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{
    public class CanvasParagraphHandlerTests : HandlerTestBase
    {
        private readonly CanvasParagraphHandler _handler;
        private readonly Mock<ISerializationHelper> _serializerMock;
        private readonly Mock<ITextProcessor> _textProcessorMock;

        public CanvasParagraphHandlerTests()
        {
            _serializerMock = CreateSerializerMock();
            _textProcessorMock = CreateTextProcessorMock();

            _handler = new CanvasParagraphHandler(
                _serializerMock.Object,
                _textProcessorMock.Object);
        }

        [Fact]
        public async Task HandleAsync_SimpleParagraph_ReturnsWrappedText()
        {
      
            var json = @"{""Value"":""Test content""}";
            var item = CreateTestItem(json, typeof(CanvasParagraph));

            // Mock the serializer to return a CanvasParagraph
            _serializerMock.Setup(x => x.DeserializeAsync<CanvasParagraph>(item))
                         .ReturnsAsync(new CanvasParagraph { Value = "Test content" });

            // Mock the text processor - ensure this matches exactly what will be passed
            _textProcessorMock.Setup(x => x.ProcessAsync("Test content"))
                            .ReturnsAsync("<strong>This is bold text.</strong>");

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("<p class=\"shade-black\"><strong>This is bold text.</strong></p>", html);

            // Verify mocks were called
            _serializerMock.Verify(x => x.DeserializeAsync<CanvasParagraph>(item), Times.Once);
            _textProcessorMock.Verify(x => x.ProcessAsync("Test content"), Times.Once);
        }

        [Fact]
        public async Task HandleAsync_HtmlContent_ProperlyEscapesHtml()
        {
            // Arrange
            var item = CreateTestItem("<script>alert()</script>", typeof(CanvasParagraph));

            // Mock the serializer to return a CanvasParagraph
            _serializerMock.Setup(x => x.DeserializeAsync<CanvasParagraph>(item))
                         .ReturnsAsync(new CanvasParagraph { Value = "Test content" });

            _textProcessorMock.Setup(x => x.ProcessAsync("Test content"))
                            .ReturnsAsync("<script>alert()</script>");

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("<p class=\"shade-black\"><script>alert()</script></p>", html);
        }


    }
}

