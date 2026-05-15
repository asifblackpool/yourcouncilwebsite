namespace RazorPageBusinessWebsite.Core.Models
{
    public class BreadcrumbItem
    {
        public required string Title { get; set; }
        public string? Url { get; set; } = string.Empty;
        public bool IsActive => string.IsNullOrEmpty(Url);
    }
}
