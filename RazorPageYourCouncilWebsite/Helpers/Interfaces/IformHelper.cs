using Microsoft.AspNetCore.Html;

namespace RazorPageYourCouncilWebsite.Helpers.Interfaces
{
    public interface IFormHelper
    {
        IHtmlContent TagBuilder(string formType, string contentTypeId);
    }
}
