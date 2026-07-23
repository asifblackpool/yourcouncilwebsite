using Content.Modelling.Models.Templates;
using Xunit;

using Content.Modelling.Models.Components;
using Content.Modelling.Models.Weddings;
using Content.Modelling.Models.Data;

namespace YourCouncilWebsite.UnitTests.Pages
{
    public class NavigationTileSimpleTests
    {
        [Fact]
        public void NavigationTile_Can_Store_Mixed_Content_Types()
        {
            // Arrange
            var tile = new NavigationTile
            {
                Title = "Test Tile",
                LinkUrl = "/test",
                Entry = new List<dynamic>
                {
                    new BGStandard { PageTitle = "Page 1" },
                    new BGStandard { PageTitle = "Page 2" },
                    new ExternalLink { LinkTitle = "Google", LinkAddress = "https://google.com" }
                }
            };

            // Act & Assert
            Assert.Equal(3, tile.Entry.Count);

            var standardPages = tile.GetEntriesByType<BGStandard>();
            Assert.Equal(2, standardPages.Count());
            Assert.Equal("Page 1", standardPages.First().PageTitle);

            var externalLinks = tile.GetEntriesByType<ExternalLink>();
            Assert.Single(externalLinks);
            Assert.Equal("Google", externalLinks.First().LinkTitle);
        }

        [Fact]
        public void NavigationTile_GetTypedEntries_Returns_Correct_Types()
        {
            // Arrange
            var tile = new NavigationTile
            {
                Entry = new List<dynamic>
                {
                    new BGStandard(),
                    new ExternalLink(),
                    new GettingMarried()
                }
            };

            // Act
            var typedEntries = tile.GetTypedEntries();

            // Assert
            Assert.Equal(3, typedEntries.Count);
            Assert.Equal("BGStandard", typedEntries[0].ContentType);
            Assert.Equal("ExternalLink", typedEntries[1].ContentType);
            Assert.Equal("GettingMarried", typedEntries[2].ContentType);
        }
    }
}