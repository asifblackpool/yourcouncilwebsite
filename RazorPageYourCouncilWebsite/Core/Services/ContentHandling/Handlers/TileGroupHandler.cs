using Content.Modelling.Constants;
using Content.Modelling.Models.Components;
using Content.Modelling.Models.GenericTypes;
using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.ContextView;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using System.IO;

namespace RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers
{
    public class TileGroupHandler : IContentHandler
    {
        private readonly ISerializationHelper _serializer;
        private readonly IViewComponentHelper _viewComponentHelper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TileGroupHandler(ISerializationHelper serializer,IViewComponentHelper viewComponentHelper,IHttpContextAccessor httpContextAccessor)
        {
            _serializer = serializer;
            _viewComponentHelper = viewComponentHelper;
            _httpContextAccessor = httpContextAccessor;
        }

        public string ContentType => ComponentKeys.GROUP_TILES_LIST;

        public bool CanHandle(string className)
        {
            return className == ComponentKeys.GROUP_TILES_LIST ||
                   className == typeof(GroupTilesList).Name;
        }

        public async Task<IHtmlContent> HandleAsync(SerialisedItem item)
        {
            var htmlContent = new HtmlContentBuilder();

            try
            {
                var tileGroupList = await _serializer.DeserializeAsync<GroupTilesList>(item);

                if (tileGroupList?.Tiles != null && tileGroupList.Tiles.Any())
                {
                   // Ensure ViewContext is set using the static helper
                    ViewContextHelper.EnsureViewContext(_viewComponentHelper, _httpContextAccessor);

                    var result = await _viewComponentHelper.InvokeAsync("TileNavigation", new
                    {
                        list = tileGroupList.Tiles,
                        layout = TileLayout.FourTilesInARow
                    });

                    htmlContent.AppendHtml(result);
                }
            }
            catch (Exception ex)
            {
                htmlContent.AppendHtml($"<!-- Error processing the  TileGroup Handler: {ex.Message} -->");
            }

            return htmlContent;
        }
    }
}