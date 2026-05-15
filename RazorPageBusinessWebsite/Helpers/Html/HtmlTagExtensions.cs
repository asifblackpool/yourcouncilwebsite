using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace RazorPageBusinessWebsite.Helpers.Html
{
    public static class HtmlTagExtensions
    {
        public static IHtmlContent CreateTag(
            this IHtmlHelper html,
            string tagName,
            object? attributes = null,
            IHtmlContent? content = null)
        {
            var tag = new TagBuilder(tagName);

            if (attributes != null)
            {
                foreach (var prop in attributes.GetType().GetProperties())
                {
                    tag.Attributes.Add(prop.Name, prop.GetValue(attributes)?.ToString());
                }
            }

            if (content != null)
            {
                tag.InnerHtml.AppendHtml(content);
            }

            return tag;
        }

        public static IHtmlContent BuildSpans(this int counter, string title)
        {
            var builder = new HtmlContentBuilder();
            builder.AppendHtml("<span>");
            //builder.Append(counter.ToString());
            builder.Append(" ");
            builder.Append(System.Net.WebUtility.HtmlEncode(title));
            builder.AppendHtml("</span>");
            builder.AppendHtml("<span class='arrow'>+ Show</span>");
            return builder;
        }
    }
}
