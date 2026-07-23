using System.Text.RegularExpressions;
using System.Text;

namespace RazorPageYourCouncilWebsite.Helpers
{
    public static class RegExUtility
    {

        public static string UrlPath(string path, string controllername)
        {
            //@"^v1/home\.aspx$"
            var patternBuilder = new StringBuilder();
            patternBuilder.Append(@"^" + path);
            patternBuilder.Append(controllername);
            patternBuilder.Append(@"\.aspx$");

            Regex dynamicRegex = new Regex(patternBuilder.ToString());

            return patternBuilder.ToString();
        }
    }
}
