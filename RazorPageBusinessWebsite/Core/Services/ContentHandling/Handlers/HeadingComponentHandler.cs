using Microsoft.AspNetCore.Html;
using Content.Modelling.Models.Canvas.Headers;
using Content.Modelling.Models.GenericTypes;

using Newtonsoft.Json;
using Content.Modelling.Models.Canvas.Helpers;
using RazorPageBusinessWebsite.Core.Services.ContentHandling.Interfaces;

namespace RazorPageBusinessWebsite.Core.Services.ContentHandling.Handlers
{
    // Services/ContentHandling/Handlers/HeadingComponentHandler.cs
    public class HeadingComponentHandler : IContentHandler
    {
        private readonly JsonSerializerSettings _settings;

        public HeadingComponentHandler()
        {
            _settings = new JsonSerializerSettings
            {
                Converters = { new HeadingComponentConverter() }
            };
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className)
            => className == typeof(HeadingComponent).Name;



        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            await Task.Yield(); // Ensure async context
            try
            {
                if (!string.IsNullOrEmpty(item.Content))
                {
                    var objItem = JsonConvert.DeserializeObject<HeadingComponent>(item.Content, _settings);
                    return new HtmlString(objItem?.ToHtml() ?? string.Empty);
                }

                return new HtmlString(string.Empty);

            }
            catch
            {
                return new HtmlString(string.Empty);
            }

        }
    }
}
