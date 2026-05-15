
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.DependencyInjection;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;
using System.Reflection;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling
{
    public static class ContentHandlerExtensions
    {
        public static IServiceCollection AddContentHandlers(this IServiceCollection services)
        {
            // Register all handlers as SCOPED to match the factory's lifetime
            var handlers = Assembly.GetExecutingAssembly()
                .GetTypes()
                .Where(t => !t.IsAbstract &&
                           !t.IsInterface &&
                           typeof(IContentHandler).IsAssignableFrom(t));

            foreach (var handler in handlers)
            {
                services.AddScoped(typeof(IContentHandler), handler);
            }

            // Register factory as SCOPED (not singleton)
            services.AddScoped<ContentHandlerFactory>();

            return services;
        }

        // 2. HTML Helper Extensions
        public static IHtmlContent WrapInDiv(this IHtmlContent content, string cssClass)
        {
            var div = new TagBuilder("div");
            div.AddCssClass(cssClass);
            div.InnerHtml.AppendHtml(content);
            return div;
        }

        public static IHtmlContent CreateTag(
            string tagName,
            string innerHtml = "",
            string cssClass = "",
            Dictionary<string, string>? attributes = null)
        {
            var tag = new TagBuilder(tagName);

            if (!string.IsNullOrEmpty(cssClass))
                tag.AddCssClass(cssClass);

            if (attributes != null)
            {
                foreach (var attr in attributes)
                {
                    tag.Attributes.Add(attr.Key, attr.Value);
                }
            }

            tag.InnerHtml.AppendHtml(innerHtml);
            return tag;
        }
    }
}


