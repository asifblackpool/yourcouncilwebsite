using Moq;

using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Content.Modelling.Models.GenericTypes;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using Xunit;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;

namespace BusinessWebsite.UnitTests.ContentHandlers.Base
{


    public abstract class HandlerTestBase
    {
        // Common test item creation
        protected SerialisedItem CreateTestItem(string content, Type type, string key = "testKey", string container = "testContainer")
        {
            return new SerialisedItem(key, type, content, container);
        }

        // HTML content to string conversion
        protected string GetHtmlString(IHtmlContent htmlContent)
        {
            using (var writer = new StringWriter())
            {
                htmlContent.WriteTo(writer, HtmlEncoder.Default);
                return writer.ToString();
            }
        }

        // Common mock setups
        protected Mock<ISerializationHelper> CreateSerializerMock() => new Mock<ISerializationHelper>();
        protected Mock<ITextProcessor> CreateTextProcessorMock() => new Mock<ITextProcessor>();
        protected Mock<IContentFragmentHelper> CreateFragmentHelperMock() => new Mock<IContentFragmentHelper>();

        // Common assertion helpers
        protected void AssertContainsTag(string html, string tag, string className = "")
        {
            var classAttr = string.IsNullOrEmpty(className) ? "" : $" class=\"{className}\"";
            string substring = $"<{tag}{classAttr}>".NormalizeHtml();
            string bigstring = html.NormalizeHtml();
            int position = bigstring.IndexOf(substring);

            Assert.True(position > -1, "substring has been found");
            Assert.Contains($"</{tag}>", html);
        }
    }

    public static class HtmlExtensions
    {
        public static string NormalizeHtml(this string html)
        {
            if (string.IsNullOrEmpty(html))
                return html;

            return html.Replace("\\\"", "\"")  // Remove escape slashes for double quotes
                      .Replace("\\'", "'")    // Remove escape slashes for single quotes
                      .Replace("\\>", ">")    // Handle escaped closing tags
                      .Replace("\\<", "<")
                      .Replace("\"", "'")   // Handle escaped opening tags
                      .Trim();                // Remove whitespace
        }
    }
}
