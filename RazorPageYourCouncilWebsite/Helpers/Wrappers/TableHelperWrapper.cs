using Content.Modelling.Models.Canvas.Helpers;
using Content.Modelling.Models.Canvas.Panels;
using Content.Modelling.Models.Canvas.Tables;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Helpers.Interfaces;

namespace RazorPageYourCouncilWebsite.Helpers
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
