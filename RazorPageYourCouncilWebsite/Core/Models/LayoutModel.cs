namespace RazorPageYourCouncilWebsite.Core.Models
{
    // Models/LayoutModel.cs
    public class LayoutModel
    {
        public string Title { get; set; } = "Default Title";
        public bool IsHomePage { get; set; }
        public string HeaderClass => IsHomePage ? "home-header" : "regular-header";
    }
}
