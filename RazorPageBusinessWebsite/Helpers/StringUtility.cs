using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Zengenti.Contensis.Delivery;


namespace RazorPageBusinessWebsite.Helpers
{

    //Add Enum File Extension
    public enum FILE_Extension
    {
        [Display(Name = "aspx page", Description = ".aspx")]
        ASPX = 1,
        [Display(Name = "html page", Description = ".html")]
        HTML = 2,
        [Display(Name = "jpg image", Description = ".jpg")]
        JPEG = 3
    }

    public static class EnumerationExtension
    {
        public static string Description(this Enum value)
        {
            // get attributes  
            var field = value.GetType().GetField(value.ToString());
            var attributes = (field != null) ? field.GetCustomAttributes(false) : null;

            // Description is in a hidden Attribute class called DisplayAttribute
            // Not to be confused with DisplayNameAttribute
            dynamic? displayAttribute = null;

            if (attributes != null && attributes.Any())
            {
                displayAttribute = attributes.ElementAt(0);
            }

            // return description
            return displayAttribute?.Description ?? "Description Not Found";
        }
    }

    public static class StringExtensions
    {
        public static string LimitWords(this string text, int maxWords, string suffix = "...")
        {
            if (string.IsNullOrWhiteSpace(text) || maxWords <= 0)
                return string.Empty;

            var words = text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            if (words.Length <= maxWords)
                return text;

            return string.Join(" ", words.Take(maxWords)) + suffix;
        }

        public static string LimitWordsWithQuotations(this string text, int maxWords, int maxCharacters, string suffix = " ...")
        {
            if (string.IsNullOrWhiteSpace(text) || maxWords <= 0 || maxCharacters <= 0)
                return string.Empty;

            var words = text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            var builder = new List<string>();
            int currentLength = 0;

            foreach (var word in words.Take(maxWords))
            {
                // +1 for space between words
                int wordLengthWithSpace = word.Length + (builder.Count > 0 ? 1 : 0);

                // stop if adding this word exceeds the max characters
                if (currentLength + wordLengthWithSpace > maxCharacters)
                    break;

                builder.Add(word);
                currentLength += wordLengthWithSpace;
            }

            var limitedText = string.Join(" ", builder);

            // if no truncation happened, don't append suffix
            bool truncated = limitedText.Length < text.Length;

            return $"\"{limitedText}{(truncated ? suffix : "")}\"";
        }



        public static string? RemoveFileExtension(this string path, FILE_Extension extensiontype)
        {
            string description = extensiontype.Description();
            string temp = path.Contains(description) ? path.Replace(description, string.Empty) : path;
            return temp.Trim().ToLower();
        }

        public static string CapitalizeFirstLetter(this string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            input = input.Trim();

            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }
    }

}