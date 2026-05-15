using BusinessWebsite.UnitTests.ContentHandlers.Base;
using Content.Modelling.Models.Canvas.Tables;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using Moq;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Wrappers;

using Xunit;

namespace BusinessWebsite.UnitTests.ContentHandlers
{
    public class TableHandlerTests : HandlerTestBase
    {
        private readonly Mock<ISerializationHelper> _serializerMock;
        private readonly Mock<ITableHelper> _tableHelperMock;
        private readonly TableHandler _handler;
        private readonly TableComponentConverter _converter = new TableComponentConverter();

        public TableHandlerTests()
        {
            _serializerMock = CreateSerializerMock();
            _tableHelperMock = new Mock<ITableHelper>();
            _handler = new TableHandler(_serializerMock.Object, _tableHelperMock.Object);
        }

        [Fact]
        public async Task HandleAsync_WithValidTable_ReturnsTableHtml()
        {
            // Arrange
            var json = @"{
            ""id"": ""table1"",
            ""type"": ""_table"",
            ""value"": [
                {
                    ""id"": ""caption1"",
                    ""type"": ""_tableCaption"",
                    ""value"": ""Sample Table""
                },
                {
                    ""id"": ""body1"",
                    ""type"": ""_tableBody"",
                    ""value"": [
                        {
                            ""id"": ""row1"",
                            ""type"": ""_tableRow"",
                            ""value"": [
                                {
                                    ""id"": ""cell1"",
                                    ""type"": ""_tableCell"",
                                    ""value"": ""Test""
                                }
                            ]
                        }
                    ]
                }
            ]
        }";

            var item = CreateTestItem(json, typeof(Table));

            // Create expected table structure
            var expectedTable = new Table
            {
                Id = "table1",
                Type = "_table",
                Components = new List<TableComponentBase>
            {
                new TableCaption
                {
                    Id = "caption1",
                    Type = "_tableCaption",
                    Value = "Sample Table"
                },
                new TableBody
                {
                    Id = "body1",
                    Type = "_tableBody",
                    Rows = new List<TableRow>
                    {
                        new TableRow
                        {
                            Id = "row1",
                            Type = "_tableRow",
                            Cells = new List<TableCellBase>
                            {
                                new TableCell
                                {
                                    Id = "cell1",
                                    Type = "_tableCell",
                                    Value = "Test"
                                }
                            }
                        }
                    }
                }
            }
            };

            _serializerMock.Setup(x => x.DeserializeAsync<Table>(It.IsAny<SerialisedItem>()))
                         .ReturnsAsync(expectedTable);

       

            _tableHelperMock.Setup(x => x.BuildHtmlTable(It.IsAny<Table>()))
                .Returns(new HtmlString(
                    @"<table>
                    <caption>Sample Table</caption>
                    <tr><td>Test</td></tr>
                    </table>"));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Contains("<table>", html);
            Assert.Contains("<caption>Sample Table</caption>", html);
            Assert.Contains("<tr><td>Test</td></tr>", html);
            _tableHelperMock.Verify(x => x.BuildHtmlTable(It.IsAny<Table>()), Times.Once);
        }

        [Fact]
        public async Task HandleAsync_WithComplexTable_HandlesAllComponents()
        {
            // Arrange
            var json = @"{
            ""id"": ""complexTable"",
            ""type"": ""_table"",
            ""value"": [
                {
                    ""type"": ""_tableCaption"",
                    ""value"": ""Complex Table""
                },
                {
                    ""type"": ""_tableBody"",
                    ""value"": [
                        {
                            ""type"": ""_tableRow"",
                            ""value"": [
                                {
                                    ""type"": ""_tableHeaderCell"",
                                    ""value"": ""Header""
                                },
                                {
                                    ""type"": ""_tableCell"",
                                    ""value"": ""Data""
                                }
                            ]
                        }
                    ]
                }
            ]
        }";

            var item = CreateTestItem(json, typeof(Table));

            _serializerMock.Setup(x => x.DeserializeAsync<Table>(It.IsAny<SerialisedItem>()))
                         .ReturnsAsync(new Table
                         {
                             Components = new List<TableComponentBase>
                             {
                             new TableCaption { Value = "Complex Table" },
                             new TableBody
                             {
                                 Rows = new List<TableRow>
                                 {
                                     new TableRow
                                     {
                                         Cells = new List<TableCellBase>
                                         {
                                             new TableHeaderCell { Value = "Header" },
                                             new TableCell { Value = "Data" }
                                         }
                                     }
                                 }
                             }
                             }
                         });

            _tableHelperMock.Setup(x => x.BuildHtmlTable(It.IsAny<Table>()))
                          .Returns(new HtmlString(
                              @"<table>
                              <caption>Complex Table</caption>
                              <tr><th>Header</th><td>Data</td></tr>
                            </table>"));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Contains("<th>Header</th>", html);
            Assert.Contains("<td>Data</td>", html);
        }

        [Fact]
        public async Task HandleAsync_WithEmptyTable_ReturnsEmpty()
        {
            // Arrange
            var json = @"{
            ""id"": ""emptyTable"",
            ""type"": ""_table"",
            ""value"": []
        }";

            var item = CreateTestItem(json, typeof(Table));

            _serializerMock.Setup(x => x.DeserializeAsync<Table>(It.IsAny<SerialisedItem>()))
                         .ReturnsAsync(new Table { Components = new List<TableComponentBase>() });

            _tableHelperMock.Setup(x => x.BuildHtmlTable(It.IsAny<Table>()))
                          .Returns(new HtmlString("<table></table>"));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Equal("<table></table>", html);
        }

        [Fact]
        public async Task HandleAsync_WithInvalidJson_ReturnsErrorComment()
        {
            // Arrange
            var item = CreateTestItem("invalid json", typeof(Table));

            // Act
            var result = await _handler.HandleAsync(item);
            var html = GetHtmlString(result);

            // Assert
            Assert.Contains("<!-- Error processing Table handler:", html);
        }
    }
}
