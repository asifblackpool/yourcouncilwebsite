using Content.Modelling.Models.Canvas.Tables;
using Microsoft.AspNetCore.Html;

namespace RazorPageBusinessWebsite.Helpers.Interfaces
{
    public interface ITableHelper
    {
        IHtmlContent BuildHtmlTable(Table table);
    }
}
