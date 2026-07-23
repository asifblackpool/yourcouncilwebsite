using YourCouncilWebsite.UnitTests.ContentHandlers.Base;
using Content.Modelling.Models.Accordions;
using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using Moq;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

using Xunit;

namespace YourCouncilWebsite.UnitTests.ContentHandlers
{
    public class AccordionHandlerTests : HandlerTestBase
    {
        private readonly Mock<ISerializationHelper> _serializerMock;
        private readonly Mock<IGovUkAccordionRenderer> _rendererMock;
        private readonly AccordionHandler _handler;

        public AccordionHandlerTests()
        {
            _serializerMock = CreateSerializerMock();
            _rendererMock = new Mock<IGovUkAccordionRenderer>();
            _handler = new AccordionHandler(_serializerMock.Object, _rendererMock.Object);
        }

        [Fact]
        public async Task HandleAsync_WithValidAccordion_RendersCorrectly()
        {
            // Arrange
            var item = CreateTestItem(
                content: "{\"AccordionName\":\"faq\",\"Items\":[]}",
                type: typeof(Accordion));

            var accordion = new Accordion
            {
                AccordionName = "faq",
                AccordionContent = new List<AccordionContent>()
            };

            _serializerMock.Setup(x => x.DeserializeAsync<Accordion>(item))
                         .ReturnsAsync(accordion);

            _rendererMock.Setup(x => x.RenderGovUkAccordion("faq", It.IsAny<List<AccordionContent>>(),null))
                       .Returns(new HtmlString("<div class='accordion'></div>"));

            // Act
            var result = await _handler.HandleAsync(item);
            var html  = GetHtmlString(result);

            // Assert
            Assert.Equal("<div class='accordion'></div>", html);
        }

        [Fact]
        public async Task HandleAsync_WithNullAccordion_ReturnsEmpty()
        {
            // Arrange
            var item = CreateTestItem("{}", typeof(Accordion));
            _serializerMock.Setup(x => x.DeserializeAsync<Accordion>(item))
                         .ReturnsAsync((Accordion)null);

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("", html);
        }
    }
}
