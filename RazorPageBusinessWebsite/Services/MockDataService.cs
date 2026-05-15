using RazorPageBusinessWebsite.Core.Models;
using RazorPageBusinessWebsite.Models;
using RazorPageBusinessWebsite.Services.Interfaces;
using System.Reflection;

namespace RazorPageBusinessWebsite.Services
{

    public class MockDataService<T> : IDataService<T> where T : class, new()
    {
        private List<T> _mockData;
        private string _path        = "";
        private bool _dataLoaded    = false;

        // Proper constructor with no return type
        public MockDataService()
        {
            _mockData = new List<T>();
          
        }

        private void LoadMockData()
        {
            if (typeof(T) == typeof(Product))
            {
                var products = new List<Product>
            {
                new Product { Id = 1, Name = "Wireless Mouse", Price = 24.99m },
                new Product { Id = 2, Name = "Keyboard", Price = 49.99m }
            };
                _mockData = products.Cast<T>().ToList();
            }
            else if (typeof(T) == typeof(Customer))
            {
                var customers = new List<Customer>
            {
                new Customer { Id = 1, Name = "John Doe", Email = "john@example.com" },
                new Customer { Id = 2, Name = "Jane Smith", Email = "jane@example.com" }
            };
                _mockData = customers.Cast<T>().ToList();
            }
            else
            {
                // Default empty list for other types
                _mockData = new List<T>();
            }
        }

        private void CheckData(string? path)
        {
            if (_dataLoaded == false){
                LoadMockData();
            }
            else{
                if (path != null && _path != path)
                    LoadMockData();
            }
        }

        public string StatusMessage()
        {
            return string.Empty;
        }

        public Task<List<T>> GetAllAsync(string? path)
        {
            CheckData(path);
            return Task.FromResult(_mockData);
        }

        public Task<T?> GetByIdAsync(int id, string? path)
        {
            var item = _mockData.FirstOrDefault(x =>
                (int)x.GetType().GetProperty("Id")!.GetValue(x)! == id);
            return Task.FromResult(item);
        }
    }

}