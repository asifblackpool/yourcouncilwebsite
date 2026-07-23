using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text.Encodings.Web;


namespace YourCouncilWebsite.UnitTests.Helpers
{
    public static class TagBuilderExtensions
    {
        public static string Render(this TagBuilder tagBuilder)
        {
            using var writer = new StringWriter();
            tagBuilder.WriteTo(writer, HtmlEncoder.Default);
            return writer.ToString();
        }

        public static void ShouldRenderAs(this TagBuilder tagBuilder, string expectedHtml)
        {
            var actual = tagBuilder.Render();
            actual.Should().Be(expectedHtml);
        }
    }
}
