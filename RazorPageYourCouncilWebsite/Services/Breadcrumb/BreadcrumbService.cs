using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Core.Models;
using System.Globalization;

namespace RazorPageYourCouncilWebsite.Services.Breadcrumb
{
    /// <summary>
    /// Builds breadcrumb navigation items from the request path.
    ///
    /// NOTE: This service is registered as Scoped in Program.cs.
    /// The _items / _autoGenerate fields are per-request state.
    /// Do NOT change this to Singleton without moving that state into
    /// HttpContext.Items or similar, otherwise breadcrumbs will leak
    /// between requests.
    /// </summary>
    public class BreadcrumbService
    {
        private readonly List<BreadcrumbItem> _items = new();
        private bool _autoGenerate = true;

        #region manual items (currently unused — kept for callers)

        public void AddItem(string title, string? url = null)
        {
            _items.Add(new BreadcrumbItem { Title = title, Url = url });
            _autoGenerate = false;
        }

        public void Reset()
        {
            _items.Clear();
            _autoGenerate = true;
        }

        public void EnableAutoGeneration() => _autoGenerate = true;
        public void DisableAutoGeneration() => _autoGenerate = false;

        #endregion

        public List<BreadcrumbItem> GetBreadcrumbs(HttpContext context)
        {
            var finalItems = new List<BreadcrumbItem>
            {
                // 1. Home
                new BreadcrumbItem { Title = "Home", Url = "/" }
            };

            // 2. Section root (e.g. "your-council")
            string? nodePath = WebsiteConstants.SITE_VIEW_PATH?
                .TrimStart('/')
                .TrimEnd('/');

            if (!string.IsNullOrEmpty(nodePath))
            {
                string councilTitle = CultureInfo.CurrentCulture.TextInfo
                    .ToTitleCase(nodePath.Replace("-", " ").ToLowerInvariant());

                finalItems.Add(new BreadcrumbItem
                {
                    Title = councilTitle,
                    Url = "/" + nodePath.ToLowerInvariant()
                });
            }

            if (_autoGenerate)
            {
                var path = context.Request.Path.Value ?? "";
                var segments = path
                    .Split('/', StringSplitOptions.RemoveEmptyEntries)
                    .ToList();

                // Skip the section root segment if present — already added above.
                if (segments.Count > 0 &&
                    segments[0].Equals(nodePath, StringComparison.OrdinalIgnoreCase))
                {
                    segments.RemoveAt(0);
                }

                string accumulatedPath = "";

                foreach (var segment in segments)
                {
                    accumulatedPath += $"/{segment}";

                    // Preserve natural casing for display.
                    // "BLACKPOOL-CO-PRODUCTION" → "Blackpool Co Production".
                    var title = CultureInfo.CurrentCulture.TextInfo
                        .ToTitleCase(segment.Replace("-", " ").ToLowerInvariant());

                    finalItems.Add(new BreadcrumbItem
                    {
                        Title = title,
                        // Normalize URL to lowercase so it matches Contensis
                        // path lookups (which are case-insensitive but serve
                        // lowercase canonical URLs).
                        Url = $"/{nodePath}{accumulatedPath}".ToLowerInvariant()
                    });
                }
            }
            else if (_items.Count > 0)
            {
                // Merge manual items, skipping duplicates of what's already present.
                var existingTitles = finalItems
                    .Select(i => i.Title?.ToLowerInvariant() ?? "")
                    .ToHashSet();

                foreach (var item in _items)
                {
                    var key = item.Title?.ToLowerInvariant() ?? "";
                    if (!string.IsNullOrEmpty(key) && !existingTitles.Contains(key))
                    {
                        finalItems.Add(item);
                        existingTitles.Add(key);
                    }
                }
            }

            // Mark the last item as the current page — remove its link.
            if (finalItems.Count > 0)
            {
                finalItems[^1].Url = null;
            }

            return finalItems;
        }
    }
}