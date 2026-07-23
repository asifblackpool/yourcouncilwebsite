using RazorPageYourCouncilWebsite.Constants;

namespace RazorPageYourCouncilWebsite.Components.Extensions
{
    public static class ViewComponentExtensions
    {
        public static string GetViewPath(string componentName) =>
            $"{WebsiteConstants.SHARED_COMPONENTS_PATH}/{componentName}/Default.cshtml";
    }
}
