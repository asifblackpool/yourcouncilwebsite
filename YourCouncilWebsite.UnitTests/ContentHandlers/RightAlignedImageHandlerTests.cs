using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Canvas.Images;
using Moq;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using Xunit;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{


    public class RightAlignedImageHandlerTests
    {
        private readonly Mock<IImageHelper> _mockImageHelper;
        private readonly RightAlignedImageHandler _handler;

        public RightAlignedImageHandlerTests()
        {
            _mockImageHelper = new Mock<IImageHelper>();
            _handler = new RightAlignedImageHandler(_mockImageHelper.Object);
        }

        [Fact]
        public void CanHandle_ReturnsTrueForRightAlignedImage()
        {
            // Act
            var result = _handler.CanHandle(typeof(RightAlignedImage).Name);

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
        public async Task HandleAsync_WithValidContent_ReturnsRightAlignedHtml()
        {
            // Arrange
            var content = @"{
            ""image"": {
                ""asset"": {
                    ""sys"": {
                        ""uri"": ""images/right-photo.jpg""
                    }
                },
                ""altText"": ""Right Aligned Test""
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
            Assert.Contains("right", html); // Verify right-aligned class
        }

        [Fact]
        public async Task HandleAsync_WithInvalidJson_ReturnsErrorComment()
        {
            // Arrange

            var item = new SerialisedItem("key", typeof(RightAlignedImage), "{ invalid json }", typeof(RightAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.StartsWith("<!-- Error processing RightAlignedImage:", html);
        }

        [Fact]
        public async Task HandleAsync_WithNullImage_ReturnsEmptyDiv()
        {
            // Arrange
            var content = @"{
            ""image"": null
        }";


            var item = new SerialisedItem("key", typeof(RightAlignedImage), content, typeof(RightAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.DoesNotContain("<img", html);
        }

        [Fact]
        public async Task HandleAsync_WithExternalUrl_DoesNotModifyUrl()
        {
            // Arrange
            var externalUrl = "https://external.com/image.jpg";
            var content = $@"{{
            ""image"": {{
                ""asset"": {{
                    ""sys"": {{
                        ""uri"": ""{externalUrl}""
                    }}
                }}
            }}
        }}";

            _mockImageHelper.Setup(x => x.GetImageUrl(externalUrl))
                          .Returns(externalUrl); // Returns same URL for external


            var item = new SerialisedItem("key", typeof(RightAlignedImage), content, typeof(RightAlignedImage).Name);

            // Act
            var result = await _handler.HandleAsync(item);

            // Assert
            Assert.NotNull(result);
            var html = result.ToString();
            Assert.Contains(externalUrl, html);
            _mockImageHelper.Verify(x => x.GetImageUrl(externalUrl), Times.Once);
        }
    }
}
