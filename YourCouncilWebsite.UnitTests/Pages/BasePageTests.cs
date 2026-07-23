using Content.Modelling.Models.Templates;
using Microsoft.Extensions.Logging;
using Moq;
using RazorPageYourCouncilWebsite.Core.Interfaces;
using RazorPageYourCouncilWebsite.Core.Models;
using RazorPageYourCouncilWebsite.Services.Breadcrumb;
using RazorPageYourCouncilWebsite.Services.Interfaces;

using Xunit;

namespace YourCouncilWebsite.UnitTests.Pages
{
    public class BasePageTests
    {
        [Fact]
        public async Task BasePageModel_Can_Get_ChildEntriesAsync()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<BasePageModel<BGStandard>>>();
            var mockDataService = new Mock<IDataService<BGStandard>>();
            var mockBreadcrumb = new Mock<BreadcrumbService>();
            var mockRepo = new Mock<IContentRepository>();

            var fakeChildren = new List<BGStandard>
        {
            new BGStandard { PageTitle = "Child 1" },
            new BGStandard { PageTitle = "Child 2" }
        };

            mockRepo.Setup(r => r.GetChildEntries<BGStandard>("/campaigns"))
                    .Returns(fakeChildren);

            mockDataService.Setup(x => x.GetAllAsync("")).ReturnsAsync(fakeChildren);

            var pageModel = new BasePageModel<BGStandard>(
                mockLogger.Object,
                mockDataService.Object,
                mockRepo.Object,
                mockBreadcrumb.Object
               );


            await pageModel.OnGetByPathAsync("/campaigns");
            var result = pageModel.Items.ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Child 1", result[0].PageTitle);
        }
    }

}
