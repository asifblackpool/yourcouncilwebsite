
using System.Text;
using Zengenti.Contensis.Delivery;

namespace RazorPageYourCouncilWebsite.Helpers
{
    public static class ButtonHelper
    {
        public static string? BuildButton(string? text, string? href, string cssClasses)
        {
            StringBuilder sb = new StringBuilder();

            string t1 = (href != string.Empty) ? "onclick=\"window.location.href='" + href + "'\"" : string.Empty;
            string t2 = (cssClasses != string.Empty) ? "class=\"" + cssClasses + "\"" : string.Empty;

            sb.Append("<button {0} {1}>");
            sb.Append(text);
            sb.Append("</button>");

            return String.Format(sb.ToString(), t1, t2);
        }
    }


}


