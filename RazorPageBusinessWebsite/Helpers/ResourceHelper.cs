// File: Helpers/ResourceHelper.cs
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace RazorPageBusinessWebsite.Helpers
{
    public static class ResourceHelper
    {
        public static void AddScript(HttpContext context, string src)
        {
            var scripts = context.Items["PageScripts"] as List<string> ?? new List<string>();
            if (!scripts.Contains(src))
                scripts.Add(src);
            context.Items["PageScripts"] = scripts;
        }

        public static void AddStyle(HttpContext context, string href)
        {
            var styles = context.Items["PageStyles"] as List<string> ?? new List<string>();
            if (!styles.Contains(href))
                styles.Add(href);
            context.Items["PageStyles"] = styles;
        }

        public static void AddInlineScript(HttpContext context, string scriptContent)
        {
            var inlineScripts = context.Items["PageInlineScripts"] as List<string> ?? new List<string>();
            if (!string.IsNullOrEmpty(scriptContent))
                inlineScripts.Add(scriptContent);
            context.Items["PageInlineScripts"] = inlineScripts;
        }

        public static async Task<IHtmlContent> IncludeHtmlSnippetAsync(HttpContext context, string virtualPath)
        {
            var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
            // Remove leading ~/ or / and normalize slashes
            string relativePath = virtualPath.TrimStart('~', '/').Replace('/', Path.DirectorySeparatorChar);
            string physicalPath = Path.Combine(env.WebRootPath, relativePath);

            if (!File.Exists(physicalPath))
            {
                return new HtmlString($"<!-- HTML snippet not found: {virtualPath} (tried {physicalPath}) -->");
            }

            string content = await File.ReadAllTextAsync(physicalPath);
            return new HtmlString(content);
        }
}
}