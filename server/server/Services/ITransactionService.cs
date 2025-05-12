using server.Models;
using System.Threading.Tasks;

namespace server.Services;

public interface ITransactionService
{
    Task<Transaction> CreateTransactionAsync(Transaction transaction);
    Task<IEnumerable<Transaction>> GetTransactionsByGroupAsync(int groupId);
}