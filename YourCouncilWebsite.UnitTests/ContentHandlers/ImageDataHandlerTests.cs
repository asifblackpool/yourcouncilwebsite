using Moq;
using Xunit;
using Newtonsoft.Json;
using Content.Modelling.Models.Canvas.Images;
using YourCouncilWebsite.UnitTests.ContentHandlers.Base;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{
    public class ImageDataHandlerTests : HandlerTestBase
        {
            private readonly Mock<IImageHelper> _imageHelperMock;
            private readonly ImageDataHandler _handler;

            public ImageDataHandlerTests()
            {
                _imageHelperMock = new Mock<IImageHelper>();
                _handler = new ImageDataHandler(_imageHelperMock.Object);
            }

            [Fact]
            public void CanHandle_ReturnsTrueForImageData()
            {
                // Act & Assert
                Assert.True(_handler.CanHandle(typeof(ImageData).Name));
            }

            [Fact]
            public void CanHandle_ReturnsFalseForOtherTypes()
            {
                // Act & Assert
                Assert.False(_handler.CanHandle("OtherType"));
            }

            [Fact]
            public async Task HandleAsync_ReturnsEmptyForNonImageData()
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
            public async Task HandleAsync_ReturnsEmptyForInvalidJson()
            {
                // Arrange
                var item = CreateTestItem("{ invalid json }", typeof(ImageData));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Contains("Invalid", html);
            }

            [Fact]
            public async Task HandleAsync_ReturnsEmptyForNullImageValue()
            {
                // Arrange
                var imageData = new ImageData { Value = null };
                var item = CreateTestItem(JsonConvert.SerializeObject(imageData), typeof(ImageData));

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Empty(html);
            }

            [Fact]
            public async Task HandleAsync_ReturnsEmptyWhenImageHelperReturnsNull()
            {
                // Arrange
                var imageData = new ImageData { Value = new ImageValue() };
                var item = CreateTestItem(JsonConvert.SerializeObject(imageData), typeof(ImageData));

                _imageHelperMock.Setup(x => x.GetImageUrlAsync(It.IsAny<ImageData>()))
                              .ReturnsAsync((string)null);

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Empty(html);
            }

            [Fact]
            public async Task HandleAsync_RendersImageWithCorrectAttributes()
            {
                // Arrange
                var imageData = new ImageData
                {
                    Value = new ImageValue
                    {
                        AltText = "Test Alt Text",
                        // Other image properties as needed
                    }
                };
                var item = CreateTestItem(JsonConvert.SerializeObject(imageData), typeof(ImageData));

                _imageHelperMock.Setup(x => x.GetImageUrlAsync(It.IsAny<ImageData>()))
                              .ReturnsAsync("https://example.com/image.jpg");

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                AssertContainsTag(html, "div", "img-container");
             
                Assert.Contains("src=\"https://example.com/image.jpg\"", html);
                Assert.Contains("alt=\"Test Alt Text\"", html);
                Assert.Contains("class=\"img-responsive\"", html);
                _imageHelperMock.Verify(x => x.GetImageUrlAsync(It.IsAny<ImageData>()), Times.Once);
            }

            [Fact]
            public async Task HandleAsync_UsesEmptyAltTextWhenNotProvided()
            {
                // Arrange
                var imageData = new ImageData { Value = new ImageValue() };
                var item = CreateTestItem(JsonConvert.SerializeObject(imageData), typeof(ImageData));

                _imageHelperMock.Setup(x => x.GetImageUrlAsync(It.IsAny<ImageData>()))
                              .ReturnsAsync("https://example.com/image.jpg");

                // Act
                var result = await _handler.HandleAsync(item);
                var html = GetHtmlString(result);

                // Assert
                Assert.Contains("alt=\"\"", html);
            }

            // Test-only class
            public class OtherContentType { }
        }
}
