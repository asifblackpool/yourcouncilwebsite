using Microsoft.AspNetCore.Html;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface IFormHelper
    {
        IHtmlContent TagBuilder(string formType, string contentTypeId);
    }
}
