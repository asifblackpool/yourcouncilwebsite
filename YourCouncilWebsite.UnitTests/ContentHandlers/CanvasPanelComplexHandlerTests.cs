using Moq;
using Xunit;
using Microsoft.AspNetCore.Html;
using Content.Modelling.Models.Canvas.Panels;
using YourCouncilWebsite.UnitTests.ContentHandlers.Base;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{
    public class CanvasPanelComplexHandlerTests : HandlerTestBase
        {
            private readonly Mock<ISerializationHelper> _serializerMock;
            private readonly Mock<IPanelHelper> _panelHelperMock;
            private readonly CanvasPanelComplexHandler _handler;

            public CanvasPanelComplexHandlerTests()
            {
                _serializerMock = new Mock<ISerializationHelper>();
                _panelHelperMock = new Mock<IPanelHelper>();
                _handler = new CanvasPanelComplexHandler(_serializerMock.Object, _panelHelperMock.Object);
            }

            [Fact]
            public void CanHandle_ReturnsTrueForCanvasPanelComplex()
            {
                // Act & Assert
                Assert.True(_handler.CanHandle(typeof(CanvasPanelComplex).Name));
            }

            [Fact]
            public void CanHandle_ReturnsFalseForOtherTypes()
            {
                // Act & Assert
                Assert.False(_handler.CanHandle("OtherType"));
            }

            [Fact]
            public async Task HandleAsync_ReturnsEmptyForNonCanvasPanelContent()
            {
                // Arrange
                var item = CreateTestItem("{}", typeof(OtherContentType));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Empty(html);
            }

            [Fact]
            public async Task HandleAsync_ReturnsPanelHtmlWhenSuccessful()
            {
                // Arrange
                var panel = new CanvasPanelComplex();
                var item = CreateTestItem("{}", typeof(CanvasPanelComplex));
                var expectedHtml = "<div class='panel'>Test Panel</div>";

                _serializerMock.Setup(x => x.DeserializeAsync<CanvasPanelComplex>(item))
                             .ReturnsAsync(panel);
                _panelHelperMock.Setup(x => x.BuildPanel(panel))
                              .Returns(new HtmlString(expectedHtml));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Equal(expectedHtml, html);
                _serializerMock.Verify(x => x.DeserializeAsync<CanvasPanelComplex>(item), Times.Once);
                _panelHelperMock.Verify(x => x.BuildPanel(panel), Times.Once);
            }

            [Fact]
            public async Task HandleAsync_ReturnsEmptyWhenPanelIsNull()
            {
                // Arrange
                var item = CreateTestItem("{}", typeof(CanvasPanelComplex));

                _serializerMock.Setup(x => x.DeserializeAsync<CanvasPanelComplex>(item))
                             .ReturnsAsync((CanvasPanelComplex)null);

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Empty(html);
                _serializerMock.Verify(x => x.DeserializeAsync<CanvasPanelComplex>(item), Times.Once);
                _panelHelperMock.Verify(x => x.BuildPanel(It.IsAny<CanvasPanelComplex>()), Times.Never);
            }

            [Fact]
            public async Task HandleAsync_ReturnsErrorCommentOnException()
            {
                // Arrange
                var item = CreateTestItem("{}", typeof(CanvasPanelComplex));
                var errorMessage = "Test error message";

                _serializerMock.Setup(x => x.DeserializeAsync<CanvasPanelComplex>(item))
                             .ThrowsAsync(new Exception(errorMessage));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Contains($"<!-- Error processing CanvasPanelComplex handler: {errorMessage} -->", html);
                _panelHelperMock.Verify(x => x.BuildPanel(It.IsAny<CanvasPanelComplex>()), Times.Never);
            }

            [Fact]
            public async Task HandleAsync_ReturnsErrorCommentOnPanelHelperException()
            {
                // Arrange
                var panel = new CanvasPanelComplex();
                var item = CreateTestItem("{}", typeof(CanvasPanelComplex));
                var errorMessage = "Panel helper error";

                _serializerMock.Setup(x => x.DeserializeAsync<CanvasPanelComplex>(item))
                             .ReturnsAsync(panel);
                _panelHelperMock.Setup(x => x.BuildPanel(panel))
                              .Throws(new Exception(errorMessage));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Contains($"<!-- Error processing CanvasPanelComplex handler: {errorMessage} -->", html);
            }

            // Test-only class
            public class OtherContentType { }
        }
    
}
