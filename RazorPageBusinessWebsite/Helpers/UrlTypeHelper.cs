namespace RazorPageBusinessWebsite.Helpers
{
    // UrlTypeHelper.cs
    public static class UrlTypeHelper
    {
        public enum UrlType
        {
            Unknown,
            GoogleMaps,
            YouTube,
            Vimeo,
            PDF,
            Image,
            Video,
            Audio,
            SocialMedia,
            ExternalLink
        }

        public static UrlType GetUrlType(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return UrlType.Unknown;

            url = url.ToLowerInvariant();

            if (url.Contains("google.com/maps") || url.Contains("maps.google.com"))
                return UrlType.GoogleMaps;

            if (url.Contains("youtube.com") || url.Contains("youtu.be"))

                return UrlType.YouTube;

            if (url.Contains("vimeo.com"))
                return UrlType.Vimeo;

            if (url.EndsWith(".pdf"))
                return UrlType.PDF;

            if (url.EndsWith(".jpg") || url.EndsWith(".jpeg") ||
                url.EndsWith(".png") || url.EndsWith(".gif") ||
                url.EndsWith(".webp") || url.EndsWith(".svg"))
                return UrlType.Image;

            if (url.EndsWith(".mp4") || url.EndsWith(".webm") ||
                url.EndsWith(".mov") || url.Contains("video/"))
                return UrlType.Video;

            if (url.EndsWith(".mp3") || url.EndsWith(".wav") ||
                url.EndsWith(".ogg") || url.Contains("audio/"))
                return UrlType.Audio;

            if (url.Contains("facebook.com") || url.Contains("twitter.com") ||
                url.Contains("instagram.com") || url.Contains("linkedin.com"))
                return UrlType.SocialMedia;

            return UrlType.ExternalLink;
        }

        public static bool IsGoogleMapsUrl(string url)
        {
            return GetUrlType(url) == UrlType.GoogleMaps;
        }

        public static string GetGoogleMapsEmbedCode(string url)
        {
            var urlType = GetUrlType(url);

            if (urlType != UrlType.GoogleMaps)
                return url; // Return original if not Google Maps

            // Handle different Google Maps URL formats
            if (url.Contains("/edit")) // Map edit URL
            {
                // Convert edit URL to embed URL
                // Example: https://www.google.com/maps/d/edit?mid=1pyY0A9pVpifcpqKaqYHV8O54zyYW4DQ&usp=sharing
                // Extract the map ID
                var uri = new Uri(url);
                var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
                var mapId = query["mid"];

                if (!string.IsNullOrEmpty(mapId))
                {
                    return $"<iframe src=\"https://www.google.com/maps/d/embed?mid={mapId}\" width=\"100%\" height=\"480\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>";
                }
            }
            else if (url.Contains("/embed")) // Already embed format
            {
                return url;
            }
            else if (url.Contains("/viewer")) // Map viewer URL
            {
                // Extract map ID from viewer URL
                var match = System.Text.RegularExpressions.Regex.Match(url, @"mid=([^&]+)");
                if (match.Success)
                {
                    return $"<iframe src=\"https://www.google.com/maps/d/embed?mid={match.Groups[1].Value}\" width=\"100%\" height=\"480\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>";
                }
            }
            else if (url.Contains("place/") || url.Contains("/@")) // Place or coordinates
            {
                // For place URLs, use the standard embed
                return $"<iframe src=\"{url.Replace("/maps/place/", "/maps/embed/v1/place/")}\" width=\"100%\" height=\"480\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>";
            }

            // Default: return the URL wrapped in an iframe
            return $"<iframe src=\"{url}\" width=\"100%\" height=\"480\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>";
        }

        public static string GetEmbedCode(string url)
        {
            var urlType = GetUrlType(url);

            return urlType switch
            {
                UrlType.GoogleMaps => GetGoogleMapsEmbedCode(url),
                UrlType.YouTube => GetYouTubeEmbedCode(url),
                UrlType.Vimeo => GetVimeoEmbedCode(url),
                _ => url // Return original for non-embedable URLs
            };
        }


        private static string GetYouTubeEmbedCode(string url)
        {
            string videoId = null;

            // Regex pattern to extract YouTube video ID from various URL formats
            var regexPatterns = new[]
            {
                @"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w\-_]+)",
                @"youtube\.com\/watch\?.*v=([\w\-_]+)",
                @"youtu\.be\/([\w\-_]+)"
            };

            foreach (var pattern in regexPatterns)
            {
                var match = System.Text.RegularExpressions.Regex.Match(url, pattern);
                if (match.Success)
                {
                    videoId = match.Groups[1].Value;
                    break;
                }
            }

            if (string.IsNullOrEmpty(videoId))
                return $"<a href=\"{url}\" target=\"_blank\">{url}</a>";

            // Extract start time if present
            string startTime = null;
            var timeMatch = System.Text.RegularExpressions.Regex.Match(url, @"[?&](?:t|start|time_continue)=(\d+)");
            if (timeMatch.Success)
                startTime = timeMatch.Groups[1].Value;

            string startParam = string.IsNullOrEmpty(startTime) ? "" : $"&start={startTime}";

            return $@"
                <div class=""video-embed"">
                    <iframe 
                        src=""https://www.youtube.com/embed/{videoId}?rel=0&modestbranding=1{startParam}""
                        width=""100%$"" 
                        height=""100%"" 
                        frameborder=""0"" 
                        allow=""accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture""
                        allowfullscreen
                        title=""YouTube video"">
                    </iframe>
                </div>";
        }

        private static string GetVimeoEmbedCode(string url)
        {
            // Extract video ID and return Vimeo embed iframe
            return $"<iframe src=\"{url}\" width=\"640\" height=\"360\" frameborder=\"0\" allowfullscreen></iframe>";
        }

    }
}
