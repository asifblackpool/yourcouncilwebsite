
using RazorPageBusinessWebsite.ViewModels;
using Content.Modelling.Models.Templates.Base;
using Newtonsoft.Json;
using RazorPageBusinessWebsite.Core.Models;
using Content.Modelling.Models.GenericTypes;
using SerializationHelper = RazorPageBusinessWebsite.Helpers.Serialisation.SerializationHelper;


namespace RazorPageBusinessWebsite.Models.Helpers
{
        public static class ViewModelPopulator
        {
            /// <summary>
            /// Populates a DetailsViewModel from a list of content items.
            /// This mirrors the logic from BasePageModel<T>.PopulateConcreteModel.
            /// </summary>
            public static DetailsViewModel PopulateFromItems(List<dynamic> items, string message)
            {
                var viewModel = new DetailsViewModel();

                if (items != null && items.Count > 0)
                {
                    var item = items.First();
                    string content = JsonConvert.SerializeObject(item);
                    var temp = new SerialisedItem("baseBGkey", typeof(BaseBG), content, "");
                    SerializationHelper sh = new SerializationHelper();
                    var baseItem = sh.Deserialize<BaseBG>(temp);

                    if (baseItem != null)
                    {
                        string contentTypeId = baseItem.Sys.ContentTypeId;
                        var concreteModel = BGTypeResolver.DeserializeToConcreteType(contentTypeId, content);

                        viewModel.ConcreteModel = concreteModel as BaseBG;
                        viewModel.ContentTypeId = contentTypeId;
                        viewModel.ModelType = concreteModel?.GetType().Name;
                        viewModel.OriginalItems = items as List<dynamic>;
                        if (viewModel.ConcreteModel != null)
                        {
                            viewModel.ModelTitle = viewModel.ConcreteModel.PageTitle;
                        }

                    viewModel.DataMessage = message;
                    }
                }
                return viewModel;
            }
        }
 }

