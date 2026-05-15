using Content.Modelling.Models.Forms;
using Microsoft.AspNetCore.Html;
using Moq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using BusinessWebsite.UnitTests.ContentHandlers.Base;
using Xunit;
using RazorPageBusinessWebsite.Helpers.Renderers.Components;

namespace BusinessWebsite.UnitTests.ContentHandlers
{
    public class WebFormsHandlerTests : HandlerTestBase
    {
        private readonly Mock<ISerializationHelper> _serializerMock;
        private readonly Mock<IFormHelper> _formHelperMock;
        private readonly Mock<ViewComponentRenderer> _rendererMock;
        private readonly WebFormsHandler _handler;

        public WebFormsHandlerTests()
        {
            _serializerMock = CreateSerializerMock();
            _formHelperMock = new Mock<IFormHelper>();
            _rendererMock = new Mock<ViewComponentRenderer>();

            _handler = new WebFormsHandler(
                _rendererMock.Object,
                _serializerMock.Object,
                _formHelperMock.Object
            );
        }

        [Fact]
        public async Task HandleAsync_WithValidForm_ReturnsFormHtml()
        {
            // Arrange
            var item = CreateTestItem(
                content: "{\"Value\":{\"ContentType\":{\"Id\":\"form123\"}}}",
                type: typeof(WebForms));

            var expectedForm = new WebForms
            {
                Value = new ValueObject
                {
                    ContentType = new ContentTypeObject { Id = "form123" }
                }
            };

            _serializerMock.Setup(x => x.DeserializeAsync<WebForms>(item))
                           .ReturnsAsync(expectedForm);

            _formHelperMock.Setup(x => x.TagBuilder("lgwebsite", "form123"))
                           .Returns(new HtmlString("<form id='form123'></form>"));

            // Mock the renderer to just return the same HTML
            _rendererMock.Setup(x => x.RenderAsync(It.IsAny<string>(), expectedForm))
                         .ReturnsAsync("<form id='form123'></form>");

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("<form id='form123'></form>", html);
        }

        [Fact]
        public async Task HandleAsync_WithNullContentType_ReturnsEmpty()
        {
            // Arrange
            var item = CreateTestItem("{}", typeof(WebForms));
            _serializerMock.Setup(x => x.DeserializeAsync<WebForms>(item))
                           .ReturnsAsync(new WebForms { Value = null });

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("", html);
        }
    }
}
