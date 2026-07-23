
using Moq;
using Xunit;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using Content.Modelling.Models.Canvas.Lists;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Core.Services.ContentProcessing.Interfaces;
using YourCouncilWebsite.UnitTests.ContentHandlers.Base;


namespace YourCouncilWebsite.UnitTests.ContentHandlers
{

    public class CanvasListItemHandlerTests : HandlerTestBase
    {
        private readonly CanvasListItemHandler _handler;
        private readonly Mock<ISerializationHelper> _serializerMock;
        private readonly Mock<ITextProcessor> _textProcessorMock;
        private readonly Mock<IContentFragmentHelper> _fragmentHelperMock;

        public CanvasListItemHandlerTests()
        {
            _serializerMock = CreateSerializerMock();
            _textProcessorMock = CreateTextProcessorMock();
            _fragmentHelperMock = CreateFragmentHelperMock();

            _handler = new CanvasListItemHandler(
                _serializerMock.Object,
                _textProcessorMock.Object,
                _fragmentHelperMock.Object);
        }

        [Fact]
        public async Task HandleAsync_SimpleTextItem_ReturnsCorrectHtml()
        {
            // Arrange
            var item = CreateTestItem("[{\"value\":\"Simple text\"}]", typeof(CanvasListItem));
            _textProcessorMock.Setup(x => x.ProcessAsync("Simple text"))
                            .ReturnsAsync("Processed simple text");

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            AssertContainsTag(html, "ul", "shade-black");
            Assert.Contains("<li>Processed simple text</li>", html);
        }

        [Fact]
        public async Task HandleAsync_NestedList_ReturnsProperlyStructuredHtml()
        {
            // Arrange
            var item = CreateTestItem("[{\"value\":[{\"value\":\"Nested item\"}]}]", typeof(CanvasListItem));
            _textProcessorMock.Setup(x => x.ProcessAsync("Nested item"))
                            .ReturnsAsync("Processed nested item");

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            AssertContainsTag(html, "ul", "shade-black");
            Assert.Contains("<ul><li>Processed nested item</li></ul>", html);
        }
    }

}
