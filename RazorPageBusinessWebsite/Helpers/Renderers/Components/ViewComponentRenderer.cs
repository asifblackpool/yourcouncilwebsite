using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;

namespace RazorPageBusinessWebsite.Helpers.Renderers.Components
{
    public class ViewComponentRenderer
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;

        public ViewComponentRenderer(
            IHttpContextAccessor httpContextAccessor,
            IRazorViewEngine razorViewEngine,
            ITempDataProvider tempDataProvider)
        {
            _httpContextAccessor = httpContextAccessor;
            _razorViewEngine = razorViewEngine;
            _tempDataProvider = tempDataProvider;
        }

        public async Task<string> RenderAsync<T>(string viewComponentName, T model)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var actionContext = new ActionContext(httpContext, httpContext.GetRouteData(), new ActionDescriptor());

            // Look for the ViewComponent view
            var viewPath = $"~/Pages/Components/{viewComponentName}/Default.cshtml";
            var viewResult = _razorViewEngine.GetView(executingFilePath: null, viewPath: viewPath, isMainPage: false);

            if (!viewResult.Success)
            {
                throw new InvalidOperationException($"View for component '{viewComponentName}' not found at {viewPath}");
            }

            using (var writer = new StringWriter())
            {
                var viewData = new ViewDataDictionary<T>(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = model
                };

                var viewContext = new ViewContext(
                    actionContext,
                    viewResult.View,
                    viewData,
                    new TempDataDictionary(httpContext, _tempDataProvider),
                    writer,
                    new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);
                return writer.ToString();
            }
        }
    }
}
