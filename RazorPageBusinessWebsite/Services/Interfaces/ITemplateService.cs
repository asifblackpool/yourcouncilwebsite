namespace RazorPageBusinessWebsite.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<string> RenderAsync<T>(string templateName, T model);
    }
}
