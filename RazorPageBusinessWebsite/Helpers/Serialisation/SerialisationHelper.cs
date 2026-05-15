using Content.Modelling.Models.GenericTypes;
using Newtonsoft.Json;
using RazorPageBusinessWebsite.Helpers.Wrappers;

namespace RazorPageBusinessWebsite.Helpers.Serialisation
{


    // Utilities/ContentHelpers/SerializationHelper.cs
    public class SerializationHelper : ISerializationHelper
    {
        public T? Deserialize<T>(SerialisedItem item)
        {
            return JsonConvert.DeserializeObject<T>(item.Content);
        }

        public async Task<T?> DeserializeAsync<T>(SerialisedItem item)
        {
            // Using Task.Run to ensure proper async behavior
            string temp = item.Content;
            try
            {
                var t = JsonConvert.DeserializeObject<T>(item.Content);
            }
            catch(Exception ex)
            {
                temp = item.Content;
            }
    
            return await Task.Run(() => JsonConvert.DeserializeObject<T>(item.Content));
        }
    }
}
