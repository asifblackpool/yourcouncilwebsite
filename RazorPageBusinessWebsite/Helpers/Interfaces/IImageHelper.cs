using System.Threading.Tasks;
using Content.Modelling.Models.Canvas.Images;
using Microsoft.AspNetCore.Html;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface IImageHelper
    {
        // Basic image URL resolution
        string? GetImageUrl(string uri);
        string? GetImageUrl(ImageData imageData);
        Task<string?> GetImageUrlAsync(string uri);
        Task<string?> GetImageUrlAsync(ImageData imageData);

    // Image URL with transformations
    string GetTransformedImageUrl(string uri, ImageTransformOptions options);
        Task<string> GetTransformedImageUrlAsync(string uri, ImageTransformOptions options);

        // Generate complete HTML image tag
        IHtmlContent GenerateImageTag(ImageData imageData, string? cssClass = null);
        Task<IHtmlContent> GenerateImageTagAsync(ImageData imageData, string? cssClass = null);

        // Generate responsive image markup
        IHtmlContent GenerateResponsiveImageTag(
            ImageData imageData,
            ResponsiveImageOptions options,
            string? cssClass = null);

        // Generate image with srcset
        IHtmlContent GenerateImageWithSrcSet(
            ImageData imageData,
            Dictionary<string, string> srcSet,
            string? sizes = null,
            string? cssClass = null);

        // Lazy loading version
        IHtmlContent GenerateLazyImageTag(ImageData imageData, string? cssClass = null);
    }

    public class ImageTransformOptions
    {
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string? Format { get; set; } // "webp", "jpg", "png" etc.
        public int? Quality { get; set; }
        public string? Mode { get; set; } // "crop", "pad", "stretch" etc.
        public string? BackgroundColor { get; set; }
    }

    public class ResponsiveImageOptions
    {
        public required Dictionary<string, string> Breakpoints { get; set; } // Key: media query, Value: transform options
        public string DefaultSize { get; set; } = "100vw";
        public bool LazyLoad { get; set; } = true;
    }
}