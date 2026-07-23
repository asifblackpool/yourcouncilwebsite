using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Html
{
    public static class HtmlVideoContentExtensions
    {
        public static void AppendVideoEmbed(this IHtmlContentBuilder htmlContent, string videoUrl,
            string containerClass = "", string? wrapperStyle = null)
        {
            if (string.IsNullOrEmpty(videoUrl))
                return;

            var defaultWrapperStyle = "text-align:center; margin:auto; min-height:375px; height:375px; width:92%;";

            var videoHtml = $@"
            <div class=""row equal zero-margin-all"">
                <div class=""col-md-12 col-sm-12 col-xs-12 zero-pad-all clearfix"" style=""margin-bottom:20px; margin-top:30px; margin-left:0px; margin-right:0px;"">
                    <div id=""video"" class=""editor {containerClass}"">
                        <div class=""iframe-wrapper"" style=""{wrapperStyle ?? defaultWrapperStyle}"">
                            <iframe 
                                src=""{videoUrl}"" 
                                frameborder=""0"" 
                                width=""100%"" 
                                height=""100%"" 
                                allow=""accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"" 
                                allowfullscreen
                                sandbox=""allow-same-origin allow-scripts allow-popups allow-presentation""
                                title=""YouTube video player"">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>";

            htmlContent.AppendHtml(videoHtml);
        }

        public static void AppendVideoEmbed(this IHtmlContentBuilder htmlContent, Video video)
        {
            if (video == null || string.IsNullOrEmpty(video.Url))
                return;

            htmlContent.AppendVideoEmbed(video.Url);
        }
    }
}
