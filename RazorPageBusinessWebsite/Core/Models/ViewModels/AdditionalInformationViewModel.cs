using Content.Modelling.Models.AssetGallery;
using Content.Modelling.Models.Components.Data;
using Content.Modelling.Models.Templates.Base;

namespace RazorPageBusinessWebsite.Core.Models.ViewModels
{
    // ViewModel for the component
    public class AdditionalInformationViewModel
    {
      
        public List<Asset> Assets { get; set; } = new List<Asset>();
        public List<dynamic> Entries { get; set; } = new List<dynamic>();
        public List<BaseBG> LinkedEntries { get; set; } = new List<BaseBG>();
        public List<DataNavigationLink> DataNavigationLinks { get; set; } = new List<DataNavigationLink>();
    }
}
