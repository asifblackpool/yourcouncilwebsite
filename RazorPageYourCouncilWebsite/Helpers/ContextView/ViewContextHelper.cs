
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;


namespace RazorPageYourCouncilWebsite.Helpers.ContextView
{
    public static class ViewContextHelper
    {
        private static readonly NullView _nullView = new NullView();
        private static readonly NullTempDataProvider _nullTempDataProvider = new NullTempDataProvider();

        /// <summary>
        /// Creates a ViewContext from the current HttpContext
        /// </summary>
        public static ViewContext CreateViewContext(HttpContext httpContext)
        {
            if (httpContext == null)
                throw new ArgumentNullException(nameof(httpContext));

            var modelMetadataProvider = new EmptyModelMetadataProvider();
            
            return new ViewContext(
                new ActionContext(
                    httpContext,
                    new RouteData(),
                    new ActionDescriptor()
                ),
                _nullView,
                new ViewDataDictionary(
                    modelMetadataProvider,
                    new ModelStateDictionary()
                ),
                new TempDataDictionary(httpContext, _nullTempDataProvider),
                TextWriter.Null,
                new HtmlHelperOptions()
            );
        }

        /// <summary>
        /// Contextualizes a view component with a ViewContext
        /// </summary>
        public static void ContextualizeViewComponent(IViewContextAware viewContextAware, HttpContext httpContext)
        {
            if (viewContextAware == null)
                throw new ArgumentNullException(nameof(viewContextAware));
            
            if (httpContext == null)
                throw new ArgumentNullException(nameof(httpContext));

            var viewContext = CreateViewContext(httpContext);
            viewContextAware.Contextualize(viewContext);
        }

        /// <summary>
        /// Ensures a view component helper has a valid ViewContext
        /// </summary>
        public static void EnsureViewContext(IViewComponentHelper viewComponentHelper, IHttpContextAccessor httpContextAccessor)
        {
            if (viewComponentHelper is IViewContextAware viewContextAware)
            {
                var httpContext = httpContextAccessor?.HttpContext;
                if (httpContext != null)
                {
                    ContextualizeViewComponent(viewContextAware, httpContext);
                }
            }
        }
    }
    internal class NullView : IView
    {
        public static readonly NullView Instance = new NullView();
        public string Path => string.Empty;

        public Task RenderAsync(ViewContext context)
        {
            return Task.CompletedTask;
        }
    }
    internal class NullTempDataProvider : ITempDataProvider
    {
        public IDictionary<string, object> LoadTempData(HttpContext context)
        {
            return new Dictionary<string, object>();
        }

        public void SaveTempData(HttpContext context, IDictionary<string, object> values)
        {
            // Do nothing
        }
    }
}