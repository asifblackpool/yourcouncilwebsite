using RazorPageYourCouncilWebsite.Services;
using Zengenti.Contensis.Delivery;


namespace RazorPageYourCouncilWebsite.Core.Interfaces
{


    public interface IContensisClient
    {
        NodeOperations Nodes { get; }
        EntryOperations Entries { get; }
    }

    public class ContensisClientWrapper : IContensisClient
    {
        private readonly IContensisClientResolver _resolver;

        public ContensisClientWrapper(IContensisClientResolver resolver)
        {
            _resolver = resolver;
        }

        // Get the correct client on each property access
        private ContensisClient CurrentClient => _resolver.GetClient();

        public NodeOperations Nodes => CurrentClient.Nodes;
        public EntryOperations Entries => CurrentClient.Entries;
    }

}
