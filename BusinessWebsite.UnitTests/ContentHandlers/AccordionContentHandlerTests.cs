using Moq;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Xunit;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Rendering;
using Content.Modelling.Models.Components;
using BusinessWebsite.UnitTests.ContentHandlers.Base;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers;

namespace BusinessWebsite.UnitTests.ContentHandlers
{
    public class AccordionContentHandlerTests : HandlerTestBase
    {
        private readonly Mock<IHtmlHelper> _htmlHelperMock;
        private readonly Mock<ITableHelper> _tableHelperMock;
        private readonly AccordionContentHandler _handler;

        public AccordionContentHandlerTests()
        {
            _htmlHelperMock = new Mock<IHtmlHelper>();
            _tableHelperMock = new Mock<ITableHelper>();
            //handler = new AccordionContentHandler(_htmlHelperMock.Object, _tableHelperMock.Object);

            // Setup required ViewContext for TagBuilder
            _htmlHelperMock.Setup(h => h.ViewContext)
                         .Returns(new ViewContext());
        }

        [Fact]
        public void CanHandle_ReturnsTrueForAccordionContent()
        {
            // Arrange & Act
            var result = _handler.CanHandle(typeof(AccordionContent).Name);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HandleAsync_ReturnsEmptyForInvalidJson()
        {
            // Arrange
            var item = CreateTestItem("{ invalid json }", typeof(AccordionContent));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Empty(html);
        }

        [Fact]
        public async Task HandleAsync_RendersAccordionForValidContent()
        {
            // Arrange
            var accordionData = new AccordionContent
            {
                Title = "Test Title",
                Body = "<p>Test Content</p>"
            };
            var item = CreateTestItem(
                JsonConvert.SerializeObject(accordionData),
                typeof(AccordionContent));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            AssertContainsTag(html, "div", "accordion-container");
            AssertContainsTag(html, "div", "accordion");
            Assert.Contains("Test Title", html);
            Assert.Contains("<p>Test Content</p>", html);
        }

   
    }


}