using Content.Modelling.Models.Templates.Base;

namespace RazorPageBusinessWebsite.ViewModels
{
    public class DetailsViewModel
    {
        public BaseBG? ConcreteModel { get; set; }
        public string? ContentTypeId { get; set; }
        public string? ModelType { get; set; }
        public string?  ModelTitle { get; set; }
        public List<dynamic>? OriginalItems { get; set; }
        public string? DataMessage { get; set; }
    }
}
