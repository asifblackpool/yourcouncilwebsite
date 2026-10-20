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

            // ── Diagnostic: warn if every content-specific property is null ──
            // This almost always means a field the model expects isn't in
            // ZengentiClientAdapter.EntryFields (or isn't being returned by the
            // API). It's the exact failure mode that caused blank pages after
            // the memory fix narrowed the field list. Logged at warning level
            // so it shows up without needing to attach a debugger.
            //
            // Remove once you've moved to per-content-type field selection.
            if (concreteModel != null)
            {
                try
                {
                    var allNull = concreteModel.GetType().GetProperties()
                        .Where(p => p.Name is not "Sys"
                                 and not "VersionInfo"
                                 and not "IsPublished")
                        .All(p => p.GetValue(concreteModel) == null);

                    if (allNull)
                    {
                        Console.WriteLine(
                            $"[WARN] Entry deserialized to {concreteModel.GetType().Name} " +
                            $"with all properties null. Content type: {contentTypeId}. " +
                            $"Check EntryFields in ZengentiClientAdapter.");
                    }
                }
                catch (Exception ex)
                {
                    // Never let the diagnostic itself take the page down.
                    Console.WriteLine(
                        $"[WARN] Null-property diagnostic failed for {contentTypeId}: {ex.Message}");
                }
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