using Microsoft.Extensions.Caching.Memory;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using System.Configuration;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Services
{
    public class ContensisDataService<T> : IDataService<T> where T : class, new()
    {
        private readonly IContensisClientResolver _clientResolver;
        private readonly IMemoryCache _cache;
        private string? _dataMessage;

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

            return string.Format("<p class='text-muted' style='display:{0};'>{1}</p>", isPreview ? "block" : "none", temp);
        }

        public ContensisDataService(IContensisClientResolver clientResolver, IMemoryCache cache)
        {
            _clientResolver = clientResolver ?? throw new ArgumentNullException(nameof(clientResolver));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        public Task<List<T>> GetAllAsync(string? path)
        {
            string effectivePath = string.IsNullOrEmpty(path) ? WebsiteConstants.SITE_VIEW_PATH : path;
            var client = _clientResolver.GetClient();
            bool isPreview = _clientResolver.isPreview;

            string versionStatus = client.DefaultVersionStatus.ToString();
            string website = versionStatus == "latest" ? "latest" : "published";
          
            string cacheKey = $"{typeof(T).Name}_{effectivePath}_{versionStatus}";

            // Try to get from cache - handle possible null value
            if (_cache.TryGetValue(cacheKey, out List<T>? cachedData) && cachedData != null)
            {
               return Task.FromResult(cachedData);
            }

            // Not in cache – load data
            var data            = LoadData(effectivePath, client);
            var cacheOptions    = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

            _cache.Set(cacheKey, data, cacheOptions);
            return Task.FromResult(data);
        }

        private List<T> LoadData(string path, ContensisClient client)
        {
            var data = new List<T>();

            try
            {
                var node = client.Nodes.GetByPath(path, null, 1);
                var entryId = (node != null && node.EntryId != null) ? node.EntryId : node?.Id;
                if (entryId != null)
                {
                    var entry = client.Entries.Get<T>((Guid)entryId, null, 1);
                    if (entry != null)
                        data.Add(entry);
                }
            }
            catch (Exception ex)
            {
                // Log error (you can inject ILogger here if needed)
                Console.WriteLine($"Error loading data for {path}: {ex.Message}");
            }

            return data;
        }

        public Task<T?> GetByIdAsync(int id, string? path)
        {
            var allData = GetAllAsync(path).Result;
            var item = allData.FirstOrDefault(x =>
            {
                var idValue = x.GetType().GetProperty("Id")?.GetValue(x) as int?;
                return idValue == id;
            });

            return Task.FromResult(item);
        }
    }
}