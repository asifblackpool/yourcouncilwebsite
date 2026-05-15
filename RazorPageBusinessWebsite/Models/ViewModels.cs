namespace RazorPageBusinessWebsite.Models
{

    public class BusinessHomeViewModel
    {
        public string Title { get; set; } = "";
        public string HtmlContent { get; set; } = "";
    }

    public class BusinessRatesViewModel
    {
        public string Title { get; set; } = "";
        public string HtmlContent { get; set; } = "";
        public List<CmsNode> Children { get; set; } = new();
    }

    public class CommercialWasteViewModel
    {
        public string Title { get; set; } = "";
        public string HtmlContent { get; set; } = "";
    }

    public class SectionRootViewModel
    {
        public string Title { get; set; } = "";
        public List<CmsNode> Children { get; set; } = new();
    }

    public class GenericPageViewModel
    {
        public string Title { get; set; } = "";
        public string HtmlContent { get; set; } = "";
    }
}
