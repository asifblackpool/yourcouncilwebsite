namespace RazorPageYourCouncilWebsite.Models
{
  

    public class CmsNode
    {
        public Guid? EntryId { get; set; }
        public string Path { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string HtmlContent { get; set; } = string.Empty;

        // Fully-hydrated entry JSON (all inline refs resolved).
        // Null when the entry could not be fetched.
        public string? EntryJson { get; set; }
    }
}
