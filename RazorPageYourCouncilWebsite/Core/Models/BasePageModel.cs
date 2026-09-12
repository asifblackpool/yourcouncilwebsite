using Content.Modelling.Models.Interfaces;
using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RazorPageYourCouncilWebsite.Core.Interfaces;
using RazorPageYourCouncilWebsite.Helpers;
using RazorPageYourCouncilWebsite.Services.Breadcrumb;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using Content.Modelling.Constants;
using Content.Modelling.Models.Templates.Base;
using Content.Modelling.Models.GenericTypes;
using RazorPageYourCouncilWebsite.ViewModels;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;

namespace RazorPageYourCouncilWebsite.Core.Models
{
    public class BasePageModel<T> : PageModel where T : class, new()
    {
        public DetailsViewModel ViewModel { get; set; } = new();

        protected readonly ILogger<BasePageModel<T>> _logger;
        protected readonly IDataService<T> _dataService;
        protected readonly IContentRepository _contentRepository;
        protected readonly BreadcrumbService _breadcrumb;

        public string UrlSiteViewPath
        {
            get
            {
                string? path = HttpContext.Request.Path;
                path = path == null ? string.Empty : path.RemoveFileExtension(FILE_Extension.ASPX);
                return path ?? string.Empty;
            }
        }

        public List<BreadcrumbItem> Breadcrumbs
        {
            get { return _breadcrumb.GetBreadcrumbs(HttpContext); }
        }

        // Shared properties
        public string PageType => typeof(T).Name;
        public List<T> Items { get; protected set; } = new();

        // Constructor with DI
        public BasePageModel(
            ILogger<BasePageModel<T>> logger,
            IDataService<T> dataService,
            IContentRepository contentRepository,
            BreadcrumbService breadcrumb)
        {
            _logger = logger;
            _dataService = dataService;
            _breadcrumb = breadcrumb;
            _contentRepository = contentRepository;
        }

        // Shared initialization
        public virtual async Task OnGetAsync()
        {
            _logger.LogInformation("Loading {PageType} data", PageType);

            Items = await _dataService.GetAllAsync();
            Reset();

            ViewData["Title"] = $"{PageType}s - {DateTime.Now.Year}";

            StoreTitle(Items);
            StoreImageStrip(Items);
        }

        public virtual async Task OnGetByPathAsync(string path)
        {
            _logger.LogInformation("Loading {PageType} data", PageType);

            Items = await _dataService.GetAllAsync(path);
            Reset();

            ViewData["Title"] = $"{PageType}s - {DateTime.Now.Year}";

            StoreTitle(Items);
            StoreImageStrip(Items);
        }

        protected Task<List<TChild>> GetChildEntriesAsync<TChild>(string parentUri)
        where TChild : class, IPageTemplates
        {
            return _contentRepository.GetChildEntriesAsync<TChild>(parentUri);
        }

        // Shared method
        protected void LogAction(string action)
        {
            _logger.LogInformation("{PageType} action: {Action}", PageType, action);
        }

        /// <summary>
        /// Populates the strongly-typed ConcreteModel from the raw item,
        /// keeping ViewData in sync for backward compatibility.
        /// </summary>
        protected void PopulateConcreteModel(List<T> items)
        {
            if (items == null || items.Count == 0)
            {
                ViewData["Model"] = null;
                return;
            }

            var item = items.First();
            if (item == null)
            {
                ViewData["Model"] = null;
                return;
            }

            // Serialize ONCE to JSON. Do not use item.ToString() — that returns
            // the type name for strongly-typed T, not the JSON payload.
            string content = JsonConvert.SerializeObject(item);

            string? contentTypeId = TryGetContentTypeId(item);
            if (string.IsNullOrEmpty(contentTypeId))
            {
                ViewData["Model"] = null;
                return;
            }

            // Single deserialize into the concrete type.
            var concreteModel = BGTypeResolver.DeserializeToConcreteType(contentTypeId, content, _logger);

            ViewModel.ConcreteModel = concreteModel as BaseBG;
            ViewModel.ContentTypeId = contentTypeId;
            ViewModel.ModelType = concreteModel?.GetType().Name;

            // NOTE: OriginalItems is intentionally NOT set.
            // Holding the raw dynamic graph on the view model keeps the whole
            // entry (canvas + components + assets) alive for the request lifetime.
            // If a view needs OriginalItems, resolve just the specific fields
            // it uses instead of retaining the raw graph.

            if (ViewModel.ConcreteModel != null)
            {
                ViewModel.ModelTitle = ViewModel.ConcreteModel.PageTitle;
            }

            ViewModel.DataMessage = _dataService.StatusMessage();

            // Keep ViewData in sync for backward compatibility
            ViewData["Model"] = ViewModel.ConcreteModel;
            ViewData["ModelType"] = ViewModel.ModelType;
            ViewData["ContentTypeId"] = ViewModel.ContentTypeId;
        }

        /// <summary>
        /// Reads sys.contentTypeId without a full deserialize round-trip.
        /// Handles JObject, IDictionary (ExpandoObject), and strongly-typed models.
        /// </summary>
        private static string? TryGetContentTypeId(object item)
        {
            try
            {
                // JObject shape
                if (item is Newtonsoft.Json.Linq.JObject jObj)
                {
                    return jObj["sys"]?["contentTypeId"]?.ToString();
                }

                // ExpandoObject / IDictionary shape
                if (item is IDictionary<string, object> dict
                    && dict.TryGetValue("sys", out var sysObj)
                    && sysObj is IDictionary<string, object> sysDict
                    && sysDict.TryGetValue("contentTypeId", out var ctid))
                {
                    return ctid?.ToString();
                }

                // Strongly-typed model with a Sys property
                var sysProp = item.GetType().GetProperty("Sys");
                var sys = sysProp?.GetValue(item);
                var ctProp = sys?.GetType().GetProperty("ContentTypeId");
                return ctProp?.GetValue(sys)?.ToString();
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Override this in derived pages if they need to do additional processing
        /// </summary>
        protected virtual void OnModelPopulated()
        {
            // Hook for derived classes
        }

        private void StoreTitle(List<T> items)
        {
            ViewData["Title"] = $"{PageType}s - {DateTime.Now.Year}";

            if (items == null || items.Count == 0)
                return;

            var first = items.First();
            if (first == null)
                return;

            // Reflection instead of dynamic + try/catch.
            // Avoids per-access runtime binding cost and hides no exceptions.
            var type = first.GetType();
            var titleValue =
                type.GetProperty("Title")?.GetValue(first)?.ToString()
                ?? type.GetProperty("PageTitle")?.GetValue(first)?.ToString();

            if (!string.IsNullOrEmpty(titleValue))
            {
                ViewData["Title"] = titleValue;
            }
        }

        private void StoreImageStrip(List<T> items)
        {
            // Intentionally empty for now.
        }

        private void Reset()
        {
            ViewData["Title"] = null;
            ViewData["Model"] = null;
            ViewData["ImageStrip"] = null;
        }
    }

    #region BG Type Resolver

    public static class BGTypeResolver
    {
        private static readonly Dictionary<string, Type> _typeMap = new()
        {
            { ContensisClientKeys.BG_STANDARD, typeof(BGStandard) },
            { ContensisClientKeys.BG_STANDARD_WITH_IMAGES, typeof(BGStandardWithImages) },
            { ContensisClientKeys.BG_STANDARD_WITH_FORMS, typeof(BGStandardWithForms) },
            { ContensisClientKeys.BG_STANDARD_WITH_DOCUMENTS, typeof(BGStandardWithDocuments) },
            { ContensisClientKeys.BG_STANDARD_SERVICE_LANDING_TILE, typeof(BGServiceLandingTile) },
            { ContensisClientKeys.BG_STANDARD_SERVICE_LANDING_PAGE, typeof(BGServiceLanding) },
            { ContensisClientKeys.BG_STANDARD_SERVICE_ACCORDION_PAGE, typeof(BGServiceLandingAccordion) },
        };

        private static readonly JsonSerializerSettings _jsonSettings = new()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };

        public static Type GetConcreteType(string contentTypeId)
        {
            return _typeMap.TryGetValue(contentTypeId, out var type) ? type : typeof(BaseBG);
        }

        public static object? DeserializeToConcreteType(
            string contentTypeId,
            string json,
            ILogger? logger = null)
        {
            if (string.IsNullOrEmpty(json)) return null;

            var concreteType = GetConcreteType(contentTypeId);

            try
            {
                return JsonConvert.DeserializeObject(json, concreteType, _jsonSettings);
            }
            catch (Exception ex)
            {
                // Logger instead of Console.WriteLine so failures surface in Contensis logs.
                logger?.LogError(ex,
                    "Failed to deserialize JSON to {ConcreteType}", concreteType.Name);
                return null;
            }
        }
    }

    #endregion
}