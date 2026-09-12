namespace RazorPageYourCouncilWebsite.Services.Interfaces
{

    public interface IDataService<T> where T : class, new()
    {
        Task<List<T>> GetAllAsync(string? path = null, Guid? entryId = null);
        Task<T?> GetByIdAsync(int id, string? path);
        string StatusMessage();
    }

}
