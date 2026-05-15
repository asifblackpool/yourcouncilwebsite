namespace RazorPageBusinessWebsite.Core.Services.ContentProcessing.Interfaces
{
    public interface ITextProcessor
    {
        Task<string> ProcessAsync(string? input);
        string Process(string input); // Optional sync version
    }
}
