using Content.Modelling.Models.Canvas.Images;
using Zengenti.Contensis.Delivery;

namespace RazorPageBusinessWebsite.Helpers
{
    public static class ImageHelper
    {
        public static string? GetImageUrl(Image? image)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                //iis-preview-demowebsite-blackpool.cloud.contensis.com/
                //preview-blackpool.clou

                return string.Format("https://preview-{0}.cloud.contensis.com{1}", DotNetEnv.Env.GetString("ALIAS"), image?.Asset?.Uri);

                //return string.Format("https://preview-{0}-{1}.cloud.contensis.com{2}", DotNetEnv.Env.GetString("PROJECT_API_ID"), DotNetEnv.Env.GetString("ALIAS"), image?.Asset?.Uri);
            }
            return image?.Asset?.Uri;
        }

        public static string? GetImageUrl(ImageData? image)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                //iis-preview-demowebsite-blackpool.cloud.contensis.com/
                //preview-blackpool.clou

                return string.Format("https://preview-{0}.cloud.contensis.com{1}", DotNetEnv.Env.GetString("ALIAS"), image?.Value?.Asset?.System?.Uri);

                //return string.Format("https://preview-{0}-{1}.cloud.contensis.com{2}", DotNetEnv.Env.GetString("PROJECT_API_ID"), DotNetEnv.Env.GetString("ALIAS"), image?.Asset?.Uri);
            }
            return image?.Value?.Asset?.System?.Uri;
        }

        public static string? GetImageUrl(string? Url)
        {
            if (string.IsNullOrEmpty(Url))
            {
                return Url;
            }

            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                //iis-preview-demowebsite-blackpool.cloud.contensis.com/
                //preview-blackpool.clou

                return string.Format("https://preview-{0}.cloud.contensis.com{1}", DotNetEnv.Env.GetString("ALIAS"), Url);

                //return string.Format("https://preview-{0}-{1}.cloud.contensis.com{2}", DotNetEnv.Env.GetString("PROJECT_API_ID"), DotNetEnv.Env.GetString("ALIAS"), image?.Asset?.Uri);
            }
            return (Url  == null) ? string.Empty : Url;
        }
    }

}


