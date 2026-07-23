using DotNetEnv;
using Microsoft.AspNetCore.HttpOverrides;
using RazorPageYourCouncilWebsite.Constants;
using RazorPageYourCouncilWebsite.Core.Interfaces;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling;
using RazorPageYourCouncilWebsite.Core.Services.ContentProcessing.Interfaces;
using RazorPageYourCouncilWebsite.Core.Services.Processors;
using RazorPageYourCouncilWebsite.Helpers;
using RazorPageYourCouncilWebsite.Helpers.Html;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;
using RazorPageYourCouncilWebsite.Helpers.Renderers;
using RazorPageYourCouncilWebsite.Helpers.Renderers.Components;
using RazorPageYourCouncilWebsite.Helpers.Serialisation;
using RazorPageYourCouncilWebsite.Helpers.Wrappers;
using RazorPageYourCouncilWebsite.Infrastructure.Repositories;
using RazorPageYourCouncilWebsite.Middleware;
using RazorPageYourCouncilWebsite.Services;
using RazorPageYourCouncilWebsite.Services.Breadcrumb;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using Zengenti.Contensis.Delivery;
using Microsoft.AspNetCore.Rewrite;
using Content.Modelling.Extensions;

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

// Register IZengentiClient adapter and ContentViewModelService
builder.Services.AddScoped<IZengentiClient, ZengentiClientAdapter>();
builder.Services.AddScoped<ContentViewModelService>();

// ===== MVC Controllers =====
builder.Services.AddControllersWithViews();

// ===== Razor Pages =====
string relativeUrlPath = WebsiteConstants.SITE_VIEW_PATH.TrimEnd('/');
builder.Services
    .AddRazorPages()
    .AddRazorPagesOptions(options =>
    {
        options.RootDirectory = "/Pages";
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

builder.Services.AddMemoryCache();

var app = builder.Build();

app.UseContentModelling();
app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
else
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
        await next();
    });
}

app.UseStaticFiles();

// Redirect root to your-council
app.UseRewriter(new RewriteOptions().AddRedirect("^$", WebsiteConstants.SITE_PATH,  app.Environment.IsDevelopment() ? 302 : 301));

// Restrictive middleware has been REMOVED – now routing and controllers handle 404s.

app.UseRouting();

string siteViewRoot = WebsiteConstants.SITE_VIEW_PATH.TrimStart('/').TrimEnd('/'); // "your-council"

// 1. EXACT match for /Your-counil (or /your-council) – must come first
app.MapControllerRoute(
    name: string.Format("{0}_root_exact", WebsiteConstants.SITE_CONTROLLER),
    pattern: WebsiteConstants.SITE_PATH,  // literal "Your-council" (case‑insensitive matches /your-council too)
    defaults: new { controller = WebsiteConstants.SITE_CONTROLLER, action = "Dynamic", slug = "" }
);

// 2. Your-counl Section route for /your-council/{section}/... (requires at least one segment after your-council/)
app.MapControllerRoute(
    name: string.Format("{0}_section", WebsiteConstants.SITE_CONTROLLER),
    pattern: WebsiteConstants.SITE_PATH + "/{section}/{**slug}",
    defaults: new { controller = string.Format("{0}Section", WebsiteConstants.SITE_CONTROLLER), action = "Index" }
);



app.UseMiddleware<BreadcrumbMiddleware>();
app.UseStatusCodePagesWithReExecute("/Error");
app.MapRazorPages(); // Razor Pages still available for non your council routes

// ===== WARM UP CONTENSIS CLIENT to avoid first‑request timeout =====
using (var warmupScope = app.Services.CreateScope())
{
    var warmupClient = warmupScope.ServiceProvider.GetRequiredService<IZengentiClient>();
    var logger = warmupScope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        // Synchronous call to initialise the client (avoids async complications)
        warmupClient.GetNodeByPathAsync("/").GetAwaiter().GetResult();
        logger.LogInformation("Contensis client warmed up successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Contensis client warm‑up failed – first request may be slow.");
    }
}

app.Run();

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