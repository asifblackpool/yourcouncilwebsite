using Microsoft.AspNetCore.Mvc.RazorPages;
using RazorPageBusinessWebsite.Services.Interfaces;
using RazorPageBusinessWebsite.Services.Breadcrumb;
using RazorPageBusinessWebsite.Core.Models;
using RazorPageBusinessWebsite.Core.Interfaces;
using Content.Modelling.Models.Templates;

namespace RazorPageBusinessWebsite.Pages;

public class IndexModel : BasePageModel<BGStandard>
{

    public IndexModel(ILogger<BasePageModel<BGStandard>> logger,
                      IDataService<BGStandard> dataService,
                      IContentRepository contentRepository, BreadcrumbService breadcrumb) : base(logger, dataService, contentRepository, breadcrumb) { }


    public override async Task OnGetAsync() // Default handler
    {
        ViewData["Title"] = "Homepage";
      

        await base.OnGetAsync();
        Items = Items.Take(1).ToList();
    
      LogAction("Getting Business data loaded");
    }


}


