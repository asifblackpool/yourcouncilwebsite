using RazorPageBusinessWebsite.Constants;
using RazorPageBusinessWebsite.Core.Models;
using System.Globalization;
using System.IO;

namespace RazorPageBusinessWebsite.Services.Breadcrumb
{

    public class BreadcrumbService
    {
        private readonly List<BreadcrumbItem> _items = new List<BreadcrumbItem>();
        private bool _autoGenerate = true;

        #region filter breadcrumb

        private string[] GetIgnoreListFromPath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return Array.Empty<string>();
            }

            // Split by '/' and remove empty entries (like leading/trailing slashes)
            return path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
        }

        private List<BreadcrumbItem> FilterBreadcrumbs(List<BreadcrumbItem> breadcrumbs, string[] ignoreList)
        {
            if (breadcrumbs == null || ignoreList == null)
                return breadcrumbs?.ToList() ?? new List<BreadcrumbItem>();

            // Replace hyphens with spaces in ignoreList and convert to lowercase
            var processedIgnoreList = ignoreList
                .Select(x => x.Replace("-", " ").ToLowerInvariant())
                .ToArray();

            return breadcrumbs
                .Where(b => b.Title != null &&
                           !processedIgnoreList.Contains(
                               b.Title.Replace("-", " ").ToLowerInvariant()))
                .ToList();
        }


        #endregion

        public void AddItem(string title, string? url = null)
        {
            _items.Add(new BreadcrumbItem { Title = title, Url = url });
            _autoGenerate = false; // Manual addition disables auto-generation
        }

        public void Reset()
        {
            _items.Clear();
            _autoGenerate = true;
        }

        public void EnableAutoGeneration()
        {
            _autoGenerate = true;
        }

        public void DisableAutoGeneration() => _autoGenerate = false;

        public List<BreadcrumbItem> GetBreadcrumbs(HttpContext context)
        {
            var finalItems = new List<BreadcrumbItem>();

            // 1. Root home page (domain root)
            finalItems.Add(new BreadcrumbItem { Title = "Home", Url = "/" });

            // 2. Business node (from SITE_VIEW_PATH)
            string? businessPath = WebsiteConstants.SITE_VIEW_PATH?.TrimStart('/').TrimEnd('/');
            if (!string.IsNullOrEmpty(businessPath))
            {
                string businessTitle = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(businessPath.Replace("-", " "));
                finalItems.Add(new BreadcrumbItem { Title = businessTitle, Url = "/" + businessPath });
            }

            if (_autoGenerate)
            {
                // Auto-generate from route
                var path = context.Request.Path.Value ?? "";
                // Remove leading slash and split
                var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries).ToList();

                // If the first segment matches the business path, skip it (already added)
                if (segments.Count > 0 && segments[0].Equals(businessPath, StringComparison.OrdinalIgnoreCase))
                {
                    segments.RemoveAt(0);
                }

                string accumulatedPath = "";

                foreach (var segment in segments)
                {
                    accumulatedPath += $"/{segment}";
                    var title = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(segment.Replace("-", " "));
                    finalItems.Add(new BreadcrumbItem { Title = title, Url = accumulatedPath });
                }
            }
            else
            {
                // Manual items – ensure root home is still first, then business, then manual items
                // (but manual items may already include business; be careful not to duplicate)
                if (_items.Count > 0)
                {
                    // If the first manual item is "Home" or matches business, we might skip adding our defaults.
                    // For simplicity, we'll just merge: start with root home + business, then append manual items
                    // that aren't duplicates of the first two.
                    var existingTitles = finalItems.Select(i => i.Title.ToLowerInvariant()).ToList();
                    foreach (var item in _items)
                    {
                        if (!existingTitles.Contains(item.Title?.ToLowerInvariant() ?? ""))
                        {
                            finalItems.Add(item);
                        }
                    }
                }
            }

            // Mark the last item as active (no link)
            if (finalItems.Count > 0)
            {
                finalItems.Last().Url = null;
            }

            // Apply ignore list filtering (optional)
            //string[] ignoreList = GetIgnoreListFromPath(WebsiteConstants.SITE_VIEW_PATH);
            var filteredBreadcrumbs = finalItems; // FilterBreadcrumbs(finalItems, ignoreList);

            return filteredBreadcrumbs;
        }

    }

}
