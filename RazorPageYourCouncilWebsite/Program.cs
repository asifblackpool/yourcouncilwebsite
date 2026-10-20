using DotNetEnv;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Zengenti.Contensis.Delivery;
using Microsoft.AspNetCore.Rewrite;
using Content.Modelling.Extensions;
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
using RazorPageYourCouncilWebsite.Middleware;
using RazorPageYourCouncilWebsite.Services;
using RazorPageYourCouncilWebsite.Services.Breadcrumb;
using RazorPageYourCouncilWebsite.Services.Interfaces;
using RazorPageYourCouncilWebsite.Infrastructure.Repositories;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Handlers;
using RazorPageYourCouncilWebsite.Core.Services.ContentHandling.Interfaces;

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
builder.Services.AddScoped(typeof(IDataService<>), typeof(ContensisDataService<>));
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

// ── Privacy Notices accordion ──
builder.Services.AddPrivacyNoticesAccordion();
builder.Services.AddScoped<IPrivacyNoticesAccordionRenderer, PrivacyNoticesAccordionRenderer>();
builder.Services.AddScoped<IContentHandler, PrivacyNoticesAccordionHandler>();

builder.Services.AddScoped<IWebCastRenderer, WebCastRenderer>();

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

// Required by PdfController to fetch files from Contensis storage
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("ClassicAssetProxy", client =>
{
    client.Timeout = TimeSpan.FromSeconds(60);
});

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

// ===== In-memory cache with BYTE-based size limit =====
//
// The ZengentiClientAdapter and CanvasHydrator use byte-based sizes
// (SetSize(serialisedPayloadLength)). That means the SizeLimit here is
// in BYTES, not entries. 64 MB is comfortable for a container with
// 512 MB – 1 GB of RAM and holds a few hundred hydrated pages.
//
// If you see frequent cache misses / re-fetches under load, raise this.
// If RSS climbs towards the container limit, lower it.
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 64 * 1024 * 1024;   // 64 MB total
});

var app = builder.Build();

app.UseContentModelling();
app.UseForwardedHeaders();

// ─────────────────────────────────────────────────────────────────────
// EXCEPTION HANDLING
//
// /Error must NOT depend on Contensis. If it does, an OOM in the content
// fetch will re-execute /Error, which re-enters the content fetch, and
// the process dies. AllowStatusCode404Response prevents the secondary
// InvalidOperationException when /Error itself returns a 404.
// ─────────────────────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(new ExceptionHandlerOptions
    {
        ExceptionHandlingPath = "/Error",
        AllowStatusCode404Response = true
    });
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

// Proxy asset requests to the Classic backend so PDFs, CSVs, Office
// documents etc. are served correctly instead of being routed to the
// Block renderer.
app.UseMiddleware<ClassicAssetProxyMiddleware>();

// Redirect root to your-council
app.UseRewriter(new RewriteOptions().AddRedirect("^$", WebsiteConstants.SITE_PATH, app.Environment.IsDevelopment() ? 302 : 301));

app.UseRouting();

// Capture the original path so the error page can display it.
app.UseErrorContext();

string siteViewRoot = WebsiteConstants.SITE_VIEW_PATH.TrimStart('/').TrimEnd('/'); // "your-council"

// ─────────────────────────────────────────────────────────────────────
// ENDPOINT REGISTRATION — ORDER MATTERS
//
// Attribute-routed controllers (like PdfController with [Route("pdf")])
// are registered FIRST by MapControllers, and take precedence over the
// conventional routes below. But we still add an explicit exclusion on
// the section route so /pdf/... can never be captured by it.
// ─────────────────────────────────────────────────────────────────────

app.MapControllers();

// 1. EXACT match for /xxxxx (or /xxxxx) – must come first
app.MapControllerRoute(
    name: string.Format("{0}_root_exact", WebsiteConstants.SITE_CONTROLLER),
    pattern: WebsiteConstants.SITE_PATH,
    defaults: new { controller = WebsiteConstants.SITE_CONTROLLER, action = "Dynamic", slug = "" }
);

app.MapControllerRoute(
    name: string.Format("{0}_section", WebsiteConstants.SITE_CONTROLLER),
    pattern: WebsiteConstants.SITE_PATH + "/{section:regex(^(?!pdf$|error$).+)}/{**slug}",
    defaults: new { controller = string.Format("{0}Section", WebsiteConstants.SITE_CONTROLLER), action = "Index" }
);

app.MapRazorPages();

// Breadcrumb runs after routing so it can see the matched endpoint,
// but before status-code pages so it can log the original request.
app.UseMiddleware<BreadcrumbMiddleware>();

// Status-code re-execution LAST, so it catches 404s from everything above.
// Requires an endpoint at /Error — provided by ErrorController.
app.UseStatusCodePagesWithReExecute("/Error");

// ===== WARM UP CONTENSIS CLIENT =====
//
// Warm up the HTTP/TLS stack ONLY. Do not fetch a full entry — that can
// itself OOM at boot and leave the process in a degraded state before
// a single request has been served. A minimal node fetch with narrow
// fields exercises the same code path with negligible memory.
using (var warmupScope = app.Services.CreateScope())
{
    var logger = warmupScope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var client = warmupScope.ServiceProvider.GetRequiredService<ContensisClient>();
        await client.Nodes.GetByPathAsync(
            WebsiteConstants.SITE_PATH.TrimStart('/'),
            entryFields: new[] { "title" },
            entryLinkDepth: 0);
        logger.LogInformation("Contensis client warmed up successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Contensis client warm-up failed – first request may be slow.");
    }
}

await app.RunAsync();

#region ContensisClientFactory
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