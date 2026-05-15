using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Content.Modelling.Models.Canvas.Tables;
using Microsoft.AspNetCore.Html;
using RazorPageBusinessWebsite.Helpers.Interfaces;

namespace RazorPageBusinessWebsite.Helpers
{
    public class TableHelperWrapper : ITableHelper
    {
        public IHtmlContent BuildHtmlTable(Table table)
        {
            string htmlString = TableHelper.BuildHtmlTable(table);
            return new HtmlString(htmlString);
        }

      
    }
}
