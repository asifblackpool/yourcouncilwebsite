using Content.Modelling.Models.Canvas.Lists;
using Newtonsoft.Json;

namespace RazorPageBusinessWebsite.Helpers.Extensions
{
    /// Helper extension methods for rendering lists
    /// </summary>
    public static class CanvasListExtensions
    {
        /// <summary>
        /// Determines if the list should be rendered as ordered (numbered)
        /// </summary>
        public static bool IsOrdered(this CanvasListBlock list)
        {
            return list?.Properties?.ListType?.ToLower() == "ordered";
        }

        /// <summary>
        /// Gets the HTML tag name for the list
        /// </summary>
        public static string GetHtmlTag(this CanvasListBlock list)
        {
            return list.IsOrdered() ? "ol" : "ul";
        }

        /// <summary>
        /// Renders the list as HTML with proper tags and CSS classes
        /// </summary>
        public static string RenderHtml(this CanvasListBlock list, string cssClass = "shade-black")
        {
            if (list?.Value == null || list.Value.Count == 0)
                return string.Empty;

            var html = new System.Text.StringBuilder();
            string tag = list.GetHtmlTag();

            html.Append($"<{tag} class=\"{cssClass}\">");

            foreach (var item in list.Value)
            {
                string content = ExtractTextContent(item.Content);
                html.Append($"<li>{content}</li>");
            }

            html.Append($"</{tag}>");
            return html.ToString();
        }


        public static string RenderHtmlRecursive(this CanvasListBlock list, string cssClass = "shade-black")
        {
            if (list?.Value == null || list.Value.Count == 0)
                return string.Empty;

            var html = new System.Text.StringBuilder();
            string tag = list.GetHtmlTag();
            html.Append($"<{tag} class=\"{cssClass}\">");

            foreach (var item in list.Value)
            {
                // Check if this item contains a nested list
                string content = ExtractContentWithNestedList(item);
                html.Append($"<li>{content}</li>");
            }

            html.Append($"</{tag}>");
            return html.ToString();
        }

        private static string ExtractContentWithNestedList(CanvasListItem item)
        {
            // This would need to inspect the item.Content for any nested _list blocks
            // Implementation depends on how your Canvas structures nested lists
            // Usually, a nested list would be another _list block inside the item's value
            return ExtractTextContent(item.Content);
        }

        /// <summary>
        /// Extracts text from IValue (handles SimpleValue and ComplexValue)
        /// </summary>
        private static string ExtractTextContent(IValue? value)
        {
            if (value == null)
                return string.Empty;

            if (value is SimpleValue simple)
            {
                return simple.Text ?? string.Empty;
            }
            else if (value is ComplexValue complex)
            {
                // Combine all text fragments
                var fragments = new List<string>();
                foreach (var fragment in complex.Fragments)
                {
                    if (fragment is TextFragment text)
                        fragments.Add(text.Text ?? string.Empty);
                    else if (fragment is HtmlFragment html)
                        fragments.Add(html.HtmlContent ?? string.Empty);
                    else if (fragment is LinkFragment link)
                        fragments.Add($"<a href=\"{link.Url}\">{link.Text}</a>");
                    else if (fragment is ImageFragment image)
                        fragments.Add($"<img src=\"{image.Source}\" alt=\"{image.AltText}\" />");
                    else
                        fragments.Add(fragment.Text ?? string.Empty);
                }
                return string.Join("", fragments);
            }

            return string.Empty;
        }

        /// <summary>
        /// Deserializes a full _list block from JSON
        /// </summary>
        public static CanvasListBlock? DeserializeListBlock(string json)
        {
            var settings = new JsonSerializerSettings
            {
                Converters = new List<JsonConverter> { new ValueConverter() },
                NullValueHandling = NullValueHandling.Ignore
            };

            return JsonConvert.DeserializeObject<CanvasListBlock>(json, settings);
        }
    }
}
