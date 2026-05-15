using Content.Modelling.Models.GenericTypes;

namespace RazorPageBusinessWebsite.Helpers.Wrappers
{
    public interface ISerializationHelper
    {
        T? Deserialize<T>(SerialisedItem item);
        Task<T?> DeserializeAsync<T>(SerialisedItem item);
    }
}
