namespace RazorPageYourCouncilWebsite.Models
{
    public class CmsNode
    {
        public string Path { get; set; } = "";
        public string Title { get; set; } = "";
        public string ContentType { get; set; } = "";
        public string HtmlContent { get; set; } = "";
        public string Slug { get; set; } = "";
        public Dictionary<string, object> Fields { get; set; } = new();
        public List<CmsNode> Children { get; set; } = new();
    }
}
