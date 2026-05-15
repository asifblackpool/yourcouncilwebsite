using Content.Modelling.Models.Canvas.Helpers;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;

namespace RazorPageBusinessWebsite.Helpers.Wrappers
{
    public class FormHelperWrapper : IFormHelper
    {
        public IHtmlContent TagBuilder(string formType, string contentTypeId)
        {
            return new HtmlString(FormHelper.TagBuilder(formType, contentTypeId));
        }
    }
}
