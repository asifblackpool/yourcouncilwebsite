using Content.Modelling.Models.Canvas.Quote;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers;
using RazorPageYourCouncilWebsite.Helpers.Html;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class VideoHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;

        public VideoHandler(ISerializationHelper serializer)
        {
            _serializer = serializer;
        }

        string IContentHandler.ContentType => throw new NotImplementedException();

        public bool CanHandle(string className) => className == typeof(Video).Name;

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                // Deserialize the quote content
                var video = await _serializer.DeserializeAsync<Video>(item);

                if (video != null && !string.IsNullOrEmpty(video.Url))
                {
                    // Usage - Super clean!:

                    htmlContent.AppendHtml(string.Format("<h2>{0}</h2>", video.Title));

                    if (video.Text != null) 
                    { 
                        htmlContent.AppendHtml("<div class='row equal zero-margin-all'>");
                        htmlContent.AppendHtml(string.Format("<div class='col-md-12 col-sm-12 col-xs-12 zero-pad-all clearfix'>{0}</div>", video.Text));
                        htmlContent.AppendHtml("</div>");
                    }

                    if (video.Url != null) 
                    {
                        //htmlContent.AppendVideoEmbed(video.Url);

                        htmlContent.AppendHtml($"<div class=\"video-container\">{UrlTypeHelper.GetEmbedCode(video.Url)}</div>");
                    }
                }
                else
                {
                    htmlContent.AppendHtml("<!-- Error: Video content is null -->");
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing Video Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}
