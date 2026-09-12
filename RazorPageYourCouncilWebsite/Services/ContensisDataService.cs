using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Services
{
    public class ContensisDataService<T> : IDataService<T> where T : class, new()
    {
        private readonly IContensisClientResolver _clientResolver;
        private readonly IZengentiClient _cmsClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ContensisDataService<T>> _logger;

        public ContensisDataService(
            IContensisClientResolver clientResolver,
            IZengentiClient cmsClient,
            IMemoryCache cache,
            ILogger<ContensisDataService<T>> logger)
        {
            _clientResolver = clientResolver ?? throw new ArgumentNullException(nameof(clientResolver));
            _cmsClient = cmsClient ?? throw new ArgumentNullException(nameof(cmsClient));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public string StatusMessage()
        {
            bool isPreview = _clientResolver.isPreview;
            string versionStatus = _clientResolver.GetClient().DefaultVersionStatus.ToString();
            string host = _clientResolver.showHost;
            string vs = _clientResolver.showVersionStatus;

            string temp = $@"Useful Information: The data returned for the website, using {vs} client data<br/>
                            1. client version being returned is {versionStatus}<br/>
                            2. host is {host} <br/>
                            3. Version Status is {vs}";

            return string.Format("<p class='text-muted' style='display:{0};'>{1}</p>",
                isPreview ? "block" : "none", temp);
        }

        public async Task<List<T>> GetAllAsync(string? path = null, Guid? entryId = null)
        {
            string effectivePath = string.IsNullOrEmpty(path)
                ? WebsiteConstants.SITE_VIEW_PATH
                : path;

            var client = _clientResolver.GetClient();
            string versionStatus = client.DefaultVersionStatus.ToString();

            string cacheKey = entryId != null
                ? $"{typeof(T).Name}_byid_{entryId}_{versionStatus}"
                : $"{typeof(T).Name}_{effectivePath}_{versionStatus}";

            if (_cache.TryGetValue(cacheKey, out List<T>? cachedData) && cachedData != null)
            {
                return cachedData;
            }

            var data = await LoadDataAsync(effectivePath, entryId);

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
                .SetSize(1);

            _cache.Set(cacheKey, data, cacheOptions);
            return data;
        }

        private async Task<List<T>> LoadDataAsync(string path, Guid? entryId)
        {
            var data = new List<T>();
            try
            {
                Newtonsoft.Json.Linq.JObject? hydratedJson = null;

                if (entryId != null)
                {
                    hydratedJson = await _cmsClient.GetHydratedEntryByIdAsync(entryId.Value);
                }
                else
                {
                    var cmsNode = await _cmsClient.GetNodeByPathAsync(path);
                    if (cmsNode == null || string.IsNullOrEmpty(cmsNode.EntryJson))
                    {
                        _logger.LogWarning("No hydrated entry JSON for path {Path}", path);
                        return data;
                    }
                    hydratedJson = JObject.Parse(cmsNode.EntryJson);
                }

                if (hydratedJson == null) return data;

                // If T is dynamic, hand the JObject straight through — do NOT convert
                // to ExpandoObject. Downstream (ViewModelPopulator / TryGetContentTypeId)
                // expects JObject shape.
                if (typeof(T) == typeof(object))
                {
                    data.Add((T)(object)hydratedJson);
                    return data;
                }

                var serializer = JsonSerializer.Create(new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver(),
                    NullValueHandling = NullValueHandling.Ignore
                });

                var deserialized = hydratedJson.ToObject<T>(serializer);
                if (deserialized != null) data.Add(deserialized);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading data for {Path}", path);
            }
            return data;
        }

        public async Task<T?> GetByIdAsync(int id, string? path)
        {
            var allData = await GetAllAsync(path);

            var item = allData.FirstOrDefault(x =>
            {
                var idValue = x.GetType().GetProperty("Id")?.GetValue(x) as int?;
                return idValue == id;
            });

            return item;
        }
    }
}