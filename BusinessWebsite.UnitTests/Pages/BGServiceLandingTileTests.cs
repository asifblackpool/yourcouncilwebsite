using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Templates;
using Content.Modelling.Models.Templates.Base;
using Microsoft.Extensions.Logging;
using Moq;
using RazorPageBusinessWebsite.Core.Interfaces;
using RazorPageBusinessWebsite.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using System.Text.Json;
using Xunit;

namespace BusinessWebsite.UnitTests.Pages
{
    public class BGServiceLandingTileTests
    {
        private readonly Mock<ILogger<BGServiceLandingTile>> _mockLogger;
        private readonly Mock<IDataService<BGServiceLandingTile>> _mockDataService;
        private readonly Mock<IContentRepository> _mockRepo;

        public BGServiceLandingTileTests()
        {
            _mockLogger = new Mock<ILogger<BGServiceLandingTile>>();
            _mockDataService = new Mock<IDataService<BGServiceLandingTile>>();
            _mockRepo = new Mock<IContentRepository>();
        }

        [Fact]
        public void BGServiceLandingTile_Can_Create_With_Basic_Properties()
        {
            // Arrange & Act
            var tile = new BGServiceLandingTile
            {
                PageTitle = "Test Service Landing Page",
                MetaDescription = "This is a test meta description that needs to be between 50 and 100 characters for proper SEO optimization.",
                ChatBotId = "test-bot-123",
                TileLayout = TileLayout.ThreeTilesInARow
            };

            // Assert
            Assert.Equal("Test Service Landing Page", tile.PageTitle);
            Assert.Equal("This is a test meta description that needs to be between 50 and 100 characters for proper SEO optimization.", tile.MetaDescription);
            Assert.Equal("test-bot-123", tile.ChatBotId);
            Assert.Equal(TileLayout.ThreeTilesInARow, tile.TileLayout);
        }

        [Fact]
        public void BGServiceLandingTile_Can_Hold_NavigationTiles()
        {
            // Arrange
            var navigationTiles = new List<NavigationTile>
            {
                new NavigationTile
                {
                    Title = "Tile 1",
                    LinkUrl = "/tile-1",
                    Entry = new List<dynamic>
                    {
                        new { Id = "entry-1", Title = "Entry 1" }
                    }
                },
                new NavigationTile
                {
                    Title = "Tile 2",
                    LinkUrl = "/tile-2",
                    Entry = new List<dynamic>
                    {
                        new { Id = "entry-2", Title = "Entry 2" }
                    }
                },
                new NavigationTile
                {
                    Title = "Tile 3",
                    LinkUrl = "/tile-3",
                    Entry = new List<dynamic>
                    {
                        new { Id = "entry-3", Title = "Entry 3" }
                    }
                }
            };

            // Act
            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                NavigationTile = navigationTiles
            };

            // Assert
            Assert.NotNull(tile.NavigationTile);
            Assert.Equal(3, tile.NavigationTile.Count);
            Assert.Equal("Tile 1", tile.NavigationTile[0].Title);
            Assert.Equal("/tile-2", tile.NavigationTile[1].LinkUrl);
        }

        [Fact]
        public void BGServiceLandingTile_Validates_TileCount_Minimum()
        {
            // Arrange
            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                NavigationTile = new List<NavigationTile>
                {
                    new NavigationTile { Title = "Only One Tile" }
                }
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(tile);
            var isValid = Validator.TryValidateObject(tile, validationContext, validationResults, true);

            // Assert - Should fail validation due to min count
            Assert.False(isValid);
            Assert.Contains(validationResults, v => v.ErrorMessage != null &&
                v.ErrorMessage.Contains("minimum of 3 tiles"));
        }

        [Fact]
        public void BGServiceLandingTile_Validates_TileCount_Maximum()
        {
            // Arrange
            var tiles = new List<NavigationTile>();
            for (int i = 0; i < 20; i++)
            {
                tiles.Add(new NavigationTile { Title = $"Tile {i}" });
            }

            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                NavigationTile = tiles
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(tile);
            var isValid = Validator.TryValidateObject(tile, validationContext, validationResults, true);

            // Assert - Should fail validation due to max count
            Assert.False(isValid);
            Assert.Contains(validationResults, v => v.ErrorMessage != null &&
                v.ErrorMessage.Contains("maximum of 16"));
        }

        [Fact]
        public void BGServiceLandingTile_With_Null_NavigationTile_Fails_Validation()
        {
            // Arrange
            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                NavigationTile = null
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(tile);
            var isValid = Validator.TryValidateObject(tile, validationContext, validationResults, true);

            // Assert - Should fail validation due to required
            Assert.False(isValid);
            Assert.Contains(validationResults, v => v.ErrorMessage != null &&
                v.ErrorMessage.Contains("minimum of 3 tiles"));
        }

        [Fact]
        public void BGServiceLandingTile_Can_Process_JsonElement_Canvas()
        {
            // Arrange
            var jsonString = @"
            {
                ""type"": ""paragraph"",
                ""content"": [
                    {
                        ""type"": ""text"",
                        ""value"": ""This is a test paragraph for canvas content""
                    }
                ]
            }";

            var jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonString);

            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                Canvas = jsonElement
            };

            // Act
            var serialisedContent = tile.GetSerialisedCanvas();

            // Assert
            Assert.NotNull(serialisedContent);
        }

        [Fact]
        public void BGServiceLandingTile_Returns_Empty_SerialisedContent_When_Canvas_Null()
        {
            // Arrange
            var tile = new BGServiceLandingTile
            {
                PageTitle = "Service Landing",
                Canvas = null
            };

            // Act
            var serialisedContent = tile.GetSerialisedCanvas();

            // Assert
            Assert.NotNull(serialisedContent);
        }

        [Fact]
        public void BGServiceLandingTile_Can_Set_Different_TileLayouts()
        {
            // Arrange & Act
            var tile3Rows = new BGServiceLandingTile { TileLayout = TileLayout.ThreeTilesInARow };
            var tile4Rows = new BGServiceLandingTile { TileLayout = TileLayout.FourTilesInARow };

            // Assert
            Assert.Equal(TileLayout.ThreeTilesInARow, tile3Rows.TileLayout);
            Assert.Equal(3, (int)tile3Rows.TileLayout);

            Assert.Equal(TileLayout.FourTilesInARow, tile4Rows.TileLayout);
            Assert.Equal(4, (int)tile4Rows.TileLayout);
        }

        [Fact]
        public void BGServiceLandingTile_With_All_Properties_Populated_Passes_Validation()
        {
            // Arrange
            var tiles = new List<NavigationTile>();
            for (int i = 0; i < 6; i++) // Within 3-16 range
            {
                tiles.Add(new NavigationTile
                {
                    Title = $"Tile {i}",
                    LinkUrl = $"/tile-{i}",
                    Entry = new List<dynamic> { new { Id = $"entry-{i}" } }
                });
            }

            var tile = new BGServiceLandingTile
            {
                PageTitle = "Test Service Landing Page",
                MetaDescription = "This is a test meta description that needs to be between 50 and 100 characters for proper SEO optimization.",
                ChatBotId = "test-bot-123",
                TileLayout = TileLayout.ThreeTilesInARow,
                NavigationTile = tiles
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(tile);
            var isValid = Validator.TryValidateObject(tile, validationContext, validationResults, true);

            // Assert
            Assert.True(isValid);
            Assert.Empty(validationResults);
        }

        [Fact]
        public async Task BGServiceLandingTile_Can_Be_Retrieved_By_Path_From_DataService()
        {
            // Arrange
            var expectedTile = new BGServiceLandingTile
            {
                PageTitle = "DataService Test",
                NavigationTile = new List<NavigationTile>
                {
                    new NavigationTile { Title = "Tile 1" },
                    new NavigationTile { Title = "Tile 2" },
                    new NavigationTile { Title = "Tile 3" }
                }
            };

            var tilesList = new List<BGServiceLandingTile> { expectedTile };

            _mockDataService.Setup(x => x.GetAllAsync("/test-path"))
                            .ReturnsAsync(tilesList);

            // Act
            var result = (await _mockDataService.Object.GetAllAsync("/test-path")).FirstOrDefault();

            // Assert
            Assert.NotNull(result);
            Assert.Equal("DataService Test", result.PageTitle);
            Assert.Equal(3, result.NavigationTile.Count);
            _mockDataService.Verify(x => x.GetAllAsync("/test-path"), Times.Once);
        }

        [Fact]
        public void BGServiceLandingTile_Can_Get_ChildEntries_With_NavigationTiles()
        {
            // Arrange
            var childTiles = new List<BGServiceLandingTile>
            {
                new BGServiceLandingTile
                {
                    PageTitle = "Child 1",
                    NavigationTile = new List<NavigationTile>
                    {
                        new NavigationTile { Title = "Child 1 Tile 1" },
                        new NavigationTile { Title = "Child 1 Tile 2" }
                    }
                },
                new BGServiceLandingTile
                {
                    PageTitle = "Child 2",
                    NavigationTile = new List<NavigationTile>
                    {
                        new NavigationTile { Title = "Child 2 Tile 1" },
                        new NavigationTile { Title = "Child 2 Tile 2" },
                        new NavigationTile { Title = "Child 2 Tile 3" }
                    }
                }
            };

            _mockRepo.Setup(r => r.GetChildEntries<BGServiceLandingTile>("/parent"))
                     .Returns(childTiles);

            // Act
            var result = _mockRepo.Object.GetChildEntries<BGServiceLandingTile>("/parent").ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Child 1", result[0].PageTitle);
            Assert.Equal(2, result[0].NavigationTile.Count);
            Assert.Equal("Child 2", result[1].PageTitle);
            Assert.Equal(3, result[1].NavigationTile.Count);
            _mockRepo.Verify(r => r.GetChildEntries<BGServiceLandingTile>("/parent"), Times.Once);
        }
    }
}



  

