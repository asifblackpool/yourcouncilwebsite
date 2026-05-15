using RazorPageBusinessWebsite.Models;
using RazorPageBusinessWebsite.Services.Interfaces;

namespace RazorPageBusinessWebsite.Services
{
    public class CmsViewModelFactory : ICmsViewModelFactory
    {
        public Task<(string ViewName, object ViewModel)> CreateAsync(CmsNode node)
        {
            (string ViewName, object ViewModel) result;

            switch (node.ContentType)
            {
                case "BusinessRatesPage":
                    result = ("BusinessRates", new BusinessRatesViewModel { Title = node.Title, HtmlContent = node.HtmlContent });
                    break;
                case "CommercialWastePage":
                    result = ("CommercialWaste", new CommercialWasteViewModel { Title = node.Title, HtmlContent = node.HtmlContent });
                    break;
                case "SectionRoot":
                    result = ("SectionRoot", new SectionRootViewModel { Title = node.Title, Children = node.Children });
                    break;
                default:
                    result = ("GenericPage", new GenericPageViewModel { Title = node.Title, HtmlContent = node.HtmlContent });
                    break;
            }

            return Task.FromResult(result);
        }
    }
}
