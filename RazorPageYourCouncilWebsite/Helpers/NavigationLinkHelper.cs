
using Content.Modelling.Helpers;
using Content.Modelling.Models.Canvas.Common;
using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Paragraphs;
using RazorPageYourCouncilWebsite.Constants;
using System.Net;
using System.Text;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Helpers
{
    public static class NavigationLinkHelper
    {

        public static string GetHomeLink()
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development")
            {
                return string.Format("/{0}", WebsiteConstants.SITE_VIEW_PATH);
            }
            return "/";
        }

        public static string? GetLinkUrl(string? url)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                string? temp = (url != null) ? url.Replace(WebsiteConstants.SITE_VIEW_PATH, string.Empty).Trim() : url;
                return url;
            }
            return url;
        }

        public static FragmentParagraph GetLinkUrl(FragmentParagraph fp)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                if (fp.Value != null && fp.Value.Count > 0)
                {
                    var val = fp.Value.First();
                    string? content = val.Type != null ? val.Type.ToString() : string.Empty;
                    if (val.Value != null && ParagraphHelper.CheckListType(content) == StandardListEnum.link)
                    {
                        string? temp = (val.Properties != null && val.Properties.Link != null )
                           ? val.Properties.Link?.System?.Uri : string.Empty;

                        if (val.Properties != null && val.Properties.Link != null && val.Properties.Link.System != null && temp != null)
                        {
                            //temp = temp.Replace(WebsiteConstants.SITE_VIEW_PATH, string.Empty);
                            ContentLink? linktoChange = val.Properties?.Link;
                            if (linktoChange != null && linktoChange.System != null)
                            {
                                linktoChange.System.Uri = temp;
                            }
                        }

                    }

                }

            }
            return fp;
        }

        public static string ToHtml(FragmentParagraph fp)
        {
            if (fp?.Value == null || fp.Value.Count == 0)
                return string.Empty;

            // Ensure links have correct URLs (especially in development)
            fp = GetLinkUrl(fp);

            var html = new StringBuilder();

            if (fp.Value != null)
            {
                foreach (var fragment in fp.Value)
                {
                    // Use dynamic to access properties
                    dynamic val = fragment;
                    string rawText = val.Value as string ?? "";
                    string encodedText = WebUtility.HtmlEncode(rawText);

                    string innerHtml = encodedText;

                    // Check for link in properties
                    if (val.Properties != null && val.Properties.Link != null)
                    {
                        var link = val.Properties.Link;
                        string url = link.System?.Uri ?? "#";
                        innerHtml = $"<a href=\"{url}\">{encodedText}</a>";
                    }

                    // Apply decorators
                    if (val.Properties != null && val.Properties.Decorators != null)
                    {
                        foreach (var decorator in val.Properties.Decorators)
                        {
                            if (decorator == "strong")
                            {
                                innerHtml = $"<strong>{innerHtml}</strong>";
                            }
                            // add others if needed
                        }
                    }

                    html.Append(innerHtml);
                }
            }

            return html.ToString();
        }
    }


}


