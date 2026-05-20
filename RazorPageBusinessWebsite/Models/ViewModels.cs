using RazorPageBusinessWebsite.ViewModels;

namespace RazorPageBusinessWebsite.Models
{
    public abstract class BaseViewModel
    {
        public string Title { get; set; } = "";
        public string HtmlContent { get; set; } = "";
        public string ModelType { get; set; } = string.Empty;
        public List<CmsNode> Children { get; set; } = new();
    }


    #region View Models


    public class BusinessHomeViewModel : BaseViewModel
    {

    }

    public class BusinessRatesViewModel : BaseViewModel
    {
   
    }

    public class CommercialWasteViewModel : BaseViewModel
    {
    
    }

    public class SectionRootViewModel : BaseViewModel
    {
      
    }

    public class GenericPageViewModel : BaseViewModel
    {
      
    }

    #endregion


    #region Model Wrapper class 

    public class ViewModelWrapper
    {
        public DetailsViewModel ViewModel { get; set; } = null!;
    }

    #endregion



}
