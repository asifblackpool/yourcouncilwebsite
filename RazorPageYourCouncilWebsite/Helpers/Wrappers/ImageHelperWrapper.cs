using Content.Modelling.Helpers;
using Content.Modelling.Models.Canvas.Images;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;


namespace RazorPageYourCouncilWebsite.Helpers.Wrappers
{
    public class ImageHelperWrapper : IImageHelper
    {
        public IHtmlContent GenerateImageTag(ImageData imageData, string? cssClass = null)
        {
            throw new NotImplementedException();
        }

        public Task<IHtmlContent> GenerateImageTagAsync(ImageData imageData, string? cssClass = null)
        {
            throw new NotImplementedException();
        }

        public IHtmlContent GenerateImageWithSrcSet(ImageData imageData, Dictionary<string, string> srcSet, string? sizes = null, string? cssClass = null)
        {
            throw new NotImplementedException();
        }

        public IHtmlContent GenerateLazyImageTag(ImageData imageData, string? cssClass = null)
        {
            throw new NotImplementedException();
        }

        public IHtmlContent GenerateResponsiveImageTag(ImageData imageData, ResponsiveImageOptions options, string? cssClass = null)
        {
            throw new NotImplementedException();
        }

        public string? GetImageUrl(string uri)
        {
            return ImageHelper.GetImageUrl(uri)?.ToString()?.SafeString();
        }

        public string? GetImageUrl(ImageData imageData)
        {
            return ImageHelper.GetImageUrl(imageData);
        }

        public Task<string?> GetImageUrlAsync(string uri)
        {
            return Task.Run(() => ImageHelper.GetImageUrl(uri)?.ToString()?.SafeString());
        }


        public Task<string?> GetImageUrlAsync(ImageData imageData)
        {
            return Task.Run(() => ImageHelper.GetImageUrl(imageData));
        }

        public string GetTransformedImageUrl(string uri, ImageTransformOptions options)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetTransformedImageUrlAsync(string uri, ImageTransformOptions options)
        {
            throw new NotImplementedException();
        }
    }
}
