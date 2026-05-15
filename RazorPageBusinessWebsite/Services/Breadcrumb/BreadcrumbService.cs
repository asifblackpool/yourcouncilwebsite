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

            // Always start with Home
            finalItems.Add(new BreadcrumbItem { Title = "Home", Url = WebsiteConstants.SITE_VIEW_PATH });

            if (_autoGenerate)
            {
                // Auto-generate from route
                var path = context.Request.Path.Value;
                List<string> segments = (path != null) ? path.Split('/')
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList() : new List<string>();

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
                // Use manually added items (but still ensure Home is first)
                if (!_items.Any() || _items[0].Title != "Home")
                {
                    finalItems.AddRange(_items);
                }
                else
                {
                    finalItems = _items.ToList();
                }
            }

            // Mark the last item as active (no link)
            if (finalItems.Count > 0)
            {
                finalItems.Last().Url = null;
            }

          
            string[] ignoreList = GetIgnoreListFromPath(WebsiteConstants.SITE_VIEW_PATH);

            var filteredBreadcrumbs = FilterBreadcrumbs(finalItems, ignoreList);

            return filteredBreadcrumbs;
        }

    }

}
