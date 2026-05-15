using DotNetEnv;
using Content.Modelling.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using RazorPageBusinessWebsite.Constants;
using RazorPageBusinessWebsite.Core.Interfaces;
using RazorPageBusinessWebsite.Core.Services.ContentHandling;
using RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageBusinessWebsite.Core.Services.Processors;
using RazorPageBusinessWebsite.Helpers;
using RazorPageBusinessWebsite.Helpers.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;
using RazorPageBusinessWebsite.Helpers.Renderers;
using RazorPageBusinessWebsite.Helpers.Renderers.Components;
using RazorPageBusinessWebsite.Helpers.Serialisation;
using RazorPageBusinessWebsite.Helpers.Wrappers;
using RazorPageBusinessWebsite.Infrastructure.Repositories;
using RazorPageBusinessWebsite.Middleware;
using RazorPageBusinessWebsite.Services;
using RazorPageBusinessWebsite.Services.Breadcrumb;
using RazorPageBusinessWebsite.Services.Interfaces;
using Zengenti.Contensis.Delivery;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables FIRST
DotNetEnv.Env.TraversePath().Load();

// Configure Forwarded Headers to trust the proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                               ForwardedHeaders.XForwardedProto |
                               ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
    options.AllowedHosts.Clear();
});

builder.Services.AddScoped<IContensisClientResolver, ContensisClientResolver>();

// Register the concrete ContensisClient so that any class expecting it gets the correct per‑request client
builder.Services.AddScoped<ContensisClient>(sp =>
{
    var resolver = sp.GetRequiredService<IContensisClientResolver>();
    return resolver.GetClient();
});

// Register generic data service (this depends on IContensisClient)
builder.Services.AddTransient(typeof(IDataService<>), typeof(ContensisDataService<>));
builder.Services.AddTransient<IContentRepository, ContensisContentRepository>();

// Register helpers
builder.Services.AddScoped<ISerializationHelper, SerializationHelper>();
builder.Services.AddScoped<ICanvasPanelHelper, CanvasPanelHelperWrapper>();
builder.Services.AddScoped<IPanelHelper, PanelHelperWrapper>();
builder.Services.AddScoped<IParagraphHelper, ParagraphHelperWrapper>();
builder.Services.AddScoped<INavigationLinkHelper, NavigationLinkHelperWrapper>();
builder.Services.AddScoped<IFormHelper, FormHelperWrapper>();
builder.Services.AddScoped<IContentFragmentHelper, ContentFragmentHelper>();
builder.Services.AddScoped<IImageHelper, ImageHelperWrapper>();
builder.Services.AddScoped<ITableHelper, TableHelperWrapper>();
builder.Services.AddScoped<IAccordionRenderer, AccordionRenderer>();
builder.Services.AddScoped<IBgCtaLinkRenderer, BgCtaLinkRenderer>();
builder.Services.AddScoped<IGovUkAccordionWithCtaButtonRenderer, GovUkAccordionWithCtaButtonRenderer>();
builder.Services.AddScoped<IGovUkAccordionWithImagesRenderer, GovUkAccordionWithImagesRenderer>();
builder.Services.AddScoped<IGovUkAccordionRenderer, GovUkAccordionRenderer>();
builder.Services.AddScoped<ViewComponentRenderer>();

// Processors
builder.Services.AddScoped<ITextProcessor, HtmlTextProcessor>();

// Configure logging
builder.Services.AddLogging(configure =>
    configure.AddConsole().SetMinimumLevel(LogLevel.Information));

// ===== ADD THIS: MVC Controllers =====
builder.Services.AddControllersWithViews();

// ===== Razor Pages (keep existing if needed, but can coexist) =====
string relativeUrlPath = WebsiteConstants.SITE_VIEW_PATH.TrimEnd('/');
builder.Services
    .AddRazorPages()
    .AddRazorPagesOptions(options =>
    {
        options.Conventions.AddPageRoute("/Home/Index", WebsiteConstants.SITE_VIEW_PATH);
        // We'll keep the Details route as fallback, but controller routes will match first
        //options.Conventions.AddPageRoute("/Home/Details", WebsiteConstants.SITE_VIEW_PATH + "{*slug}");
        options.Conventions.Add(new GlobalHeaderPageApplicationModelConvention());
    });

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IRequestContext, RequestContext>();
builder.Services.AddScoped<BreadcrumbService>();

// Automatic register all content handlers 
builder.Services.AddContentHandlers();

// Add all content modelling services (one line!)
builder.Services.AddContentModelling(builder.Configuration, options =>
{
    options.DefaultCacheMinutes = 10;
    options.DebugTokenKey = "DebugToken";
    options.EnableDebugModeByDefault = false;
});

// Register the factory that maps Contensis content types to view models
builder.Services.AddScoped<ICmsViewModelFactory, CmsViewModelFactory>();

var app = builder.Build();

app.UseContentModelling();
app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();

// Block everything except static assets and /business
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    bool isStaticAsset = path.StartsWith("/css/", StringComparison.OrdinalIgnoreCase)
                         || path.StartsWith("/js/", StringComparison.OrdinalIgnoreCase)
                         || path.StartsWith("/images/", StringComparison.OrdinalIgnoreCase)
                         || path.StartsWith("/lib/", StringComparison.OrdinalIgnoreCase);

    string websiteName = string.Concat("/", WebsiteConstants.SITE_VIEW_PATH.AsSpan(0, WebsiteConstants.SITE_VIEW_PATH.Length - 1));
    if (!isStaticAsset && !path.StartsWith(websiteName, StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = 404;
        return;
    }
    await next();
});

app.UseRouting();

// ===== DYNAMIC CONTROLLER ROUTES (must come before MapRazorPages) =====
using (var scope = app.Services.CreateScope())
{
    var contentRepo = scope.ServiceProvider.GetRequiredService<IContentRepository>();
    string siteViewRoot = WebsiteConstants.SITE_VIEW_PATH.TrimStart('/').TrimEnd('/'); // "business"

    // Root business page (handles /business) – no trailing slashes
    app.MapControllerRoute(
        name: "business_root",
        pattern: siteViewRoot,   // e.g., "business"
        defaults: new { controller = "Business", action = "Dynamic", slug = "" });

    // Get top-level sections (sync call)
    var sections = contentRepo.GetTopLevelSections($"/{siteViewRoot}");

    // Child section routes
    foreach (var section in sections)
    {
        if (string.IsNullOrWhiteSpace(section.Slug))
            continue;

        string controllerName = GetControllerNameForSection(section.Slug);
        string pattern = $"{siteViewRoot}/{section.Slug.TrimStart('/')}/{{**slug}}";

        app.MapControllerRoute(
            name: $"cms_{section.Slug}",
            pattern: pattern,
            defaults: new { controller = controllerName, action = "Dynamic", slug = "" });
    }
}
// ====================================================================

app.UseMiddleware<BreadcrumbMiddleware>();
app.UseStatusCodePagesWithReExecute("/Error");
app.MapRazorPages(); // Razor Pages still available for non-business routes

app.Run();

// Helper method
static string GetControllerNameForSection(string sectionSlug)
{
    var cultureInfo = System.Globalization.CultureInfo.InvariantCulture;
    var textInfo = cultureInfo.TextInfo;
    string pascalCase = textInfo.ToTitleCase(sectionSlug.Replace("-", " ")).Replace(" ", "");
    return pascalCase;
}

#region ContensisClientFactory (unchanged)
public static class ContensisClientFactory
{
    private static readonly object _lock = new object();
    private static bool _envLoaded = false;

    private static void EnsureEnvironmentLoaded()
    {
        if (!_envLoaded)
        {
            lock (_lock)
            {
                if (!_envLoaded)
                {
                    Env.TraversePath().Load();
                    _envLoaded = true;
                }
            }
        }
    }
    public static ContensisClient CreatePreviewClient()
    {
        EnsureEnvironmentLoaded();
        return ContensisClient.Create(
            projectId: Env.GetString("PROJECT_API_ID"),
            rootUrl: string.Format("https://api-{0}.cloud.contensis.com", Env.GetString("ALIAS")),
            clientId: Env.GetString("CONTENSIS_CLIENT_ID"),
            sharedSecret: Env.GetString("CONTENSIS_CLIENT_SECRET"),
            versionStatus: VersionStatus.Latest
        );
    }

    public static ContensisClient CreateLiveClient()
    {
        EnsureEnvironmentLoaded();
        return ContensisClient.Create(
            projectId: Env.GetString("PROJECT_API_ID"),
            rootUrl: string.Format("https://api-{0}.cloud.contensis.com", Env.GetString("ALIAS")),
            clientId: Env.GetString("CONTENSIS_CLIENT_ID"),
            sharedSecret: Env.GetString("CONTENSIS_CLIENT_SECRET"),
            versionStatus: VersionStatus.Published
        );
    }

    public static ContensisClient CreateClient(bool isPreview, string QueryStringversionStatus)
    {
        if (QueryStringversionStatus == "latest")
            return CreatePreviewClient();
        else if (QueryStringversionStatus == "published")
            return CreateLiveClient();
        else
            return isPreview ? CreatePreviewClient() : CreateLiveClient();
    }
}
#endregion