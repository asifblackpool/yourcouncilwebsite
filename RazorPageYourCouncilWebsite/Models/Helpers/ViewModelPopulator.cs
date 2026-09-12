using RazorPageYourCouncilWebsite.ViewModels;
using Content.Modelling.Models.Templates.Base;
using Newtonsoft.Json;
using RazorPageYourCouncilWebsite.Core.Models;
using Content.Modelling.Models.GenericTypes;
using SerializationHelper = RazorPageYourCouncilWebsite.Helpers.Serialisation.SerializationHelper;

namespace RazorPageYourCouncilWebsite.Models.Helpers
{
    public static class ViewModelPopulator
    {
        /// <summary>
        /// Populates a DetailsViewModel from a list of content items.
        /// This mirrors the logic from BasePageModel&lt;T&gt;.PopulateConcreteModel.
        /// </summary>
        public static DetailsViewModel PopulateFromItems(List<dynamic> items, string message)
        {
            var viewModel = new DetailsViewModel();

            if (items == null || items.Count == 0)
                return viewModel;

            var item = items.First();

            // Serialize ONCE — the resulting string is then handed to a
            // single deserialize call to the concrete type. We no longer
            // deserialize the whole thing into BaseBG first just to read
            // its ContentTypeId; we read that off the dynamic directly.
            string content = JsonConvert.SerializeObject(item);

            string? contentTypeId = TryGetContentTypeId(item);
            if (string.IsNullOrEmpty(contentTypeId))
            {
                viewModel.DataMessage = message;
                return viewModel;
            }

            // Single deserialize into the concrete type.
            var concreteModel = BGTypeResolver.DeserializeToConcreteType(contentTypeId, content);

            viewModel.ConcreteModel = concreteModel as BaseBG;
            viewModel.ContentTypeId = contentTypeId;
            viewModel.ModelType = concreteModel?.GetType().Name;
            // NOTE: viewModel.OriginalItems is intentionally NOT set.
            // The old code did `viewModel.OriginalItems = items as List<dynamic>;`
            // which kept the entire dynamic entry graph (canvas + all components
            // + assets) alive on the view model for the life of the request.
            // If a view actually needs OriginalItems, resolve that dependency
            // explicitly instead of holding the whole raw graph.

            if (viewModel.ConcreteModel != null)
            {
                viewModel.ModelTitle = viewModel.ConcreteModel.PageTitle;
            }

            viewModel.DataMessage = message;
            return viewModel;
        }

        /// <summary>
        /// Reads sys.contentTypeId off a dynamic item without a full deserialize.
        /// Handles both ExpandoObject/IDictionary and JObject shapes, since the
        /// item may come from either Contensis serialization path.
        /// </summary>
        private static string? TryGetContentTypeId(dynamic item)
        {
            try
            {
                // JObject shape
                if (item is Newtonsoft.Json.Linq.JObject jObj)
                {
                    return jObj["sys"]?["contentTypeId"]?.ToString();
                }

                // IDictionary<string, object> shape (ExpandoObject)
                if (item is IDictionary<string, object> dict
                    && dict.TryGetValue("sys", out var sysObj)
                    && sysObj is IDictionary<string, object> sysDict
                    && sysDict.TryGetValue("contentTypeId", out var ctid))
                {
                    return ctid?.ToString();
                }

                // Fallback: try dynamic property access.
                return (string?)item.Sys?.ContentTypeId;
            }
            catch
            {
                return null;
            }
        }
    }
}