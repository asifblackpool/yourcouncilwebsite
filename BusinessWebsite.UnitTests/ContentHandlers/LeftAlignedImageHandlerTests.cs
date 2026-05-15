using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Canvas.Images;
using Moq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using Xunit;

namespace BusinessWebsite.UnitTests.ContentHandlers
{


    public class LeftAlignedImageHandlerTests
    {
        private readonly Mock<IImageHelper> _mockImageHelper;
        private readonly LeftAlignedImageHandler _handler;

        public LeftAlignedImageHandlerTests()
        {
            _mockImageHelper = new Mock<IImageHelper>();
            _handler = new LeftAlignedImageHandler(_mockImageHelper.Object);
        }

        [Fact]
        public void CanHandle_ReturnsTrueForLeftAlignedImage()
        {
            // Act
            var result = _handler.CanHandle(typeof(LeftAlignedImage).Name);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void CanHandle_ReturnsFalseForOtherTypes()
        {
            // Act
            var result = _handler.CanHandle("OtherType");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task HandleAsync_WithValidContent_ReturnsHtml()
        {
            // Arrange
            var content = @"{
            ""image"": {
                ""asset"": {
                    ""sys"": {
                        ""uri"": ""images/photo.jpg""
                    }
                },
                ""altText"": ""Test Image""
            }
        }";

            _mockImageHelper.Setup(x => x.GetImageUrl(It.IsAny<string>()))
                           .Returns("https://cdn.example.com/images/photo.jpg");

            var item = new SerialisedItem("key", typeof(LeftAlignedImage), content, typeof(LeftAlignedImage).Name);


            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.Contains("https://cdn.example.com/images/photo.jpg", html);
            Assert.Contains("Test Image", html);
        }

        [Fact]
        public async Task HandleAsync_WithValidContent_ReturnLeftAlignedHtml()
        {
            // Arrange
            var content = @"{
            ""image"": {
                ""asset"": {
                    ""sys"": {
                        ""uri"": ""images/left-photo.jpg""
                    }
                },
                ""altText"": ""Leftr Aligned Test""
            }
        }";

            _mockImageHelper.Setup(x => x.GetImageUrl(It.IsAny<string>()))
                          .Returns("https://cdn.example.com/images/right-photo.jpg");

            var item = new SerialisedItem("key", typeof(RightAlignedImage), content, typeof(RightAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.Contains("https://cdn.example.com/images/right-photo.jpg", html);
            Assert.Contains("image-text-component", html);
            Assert.Contains("left", html); // Verify right-aligned class
        }

        [Fact]
        public async Task HandleAsync_WithInvalidContent_ReturnsEmpty()
        {
            // Arrange
            var item = new SerialisedItem("key", typeof(LeftAlignedImage), "invalid json", typeof(LeftAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            Assert.Contains("Error", result.ToString());
        }

        [Fact]
        public async Task HandleAsync_WithNullUri_ReturnsHtmlWithoutImage()
        {
            // Arrange
            var content = @"{
            ""image"": {
                ""asset"": {
                    ""sys"": {
                        ""uri"": null
                    }
                }
            }
        }";

            var item = new SerialisedItem("key", typeof(LeftAlignedImage), content, typeof(LeftAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.DoesNotContain("src=", html);
        }

        [Fact]
        public async Task HandleAsync_WhenImageHelperReturnsNull_KeepsOriginalUri()
        {
            // Arrange
            var content = @"{
            ""image"": {
                ""asset"": {
                    ""sys"": {
                        ""uri"": ""original/uri.jpg""
                    }
                }
            }
        }";

            _mockImageHelper.Setup(x => x.GetImageUrl(It.IsAny<string>()))
                           .Returns((string)null);

            var item = new SerialisedItem("key", typeof(LeftAlignedImage), content, typeof(LeftAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.Contains("original/uri.jpg", html);
        }
    }
}
