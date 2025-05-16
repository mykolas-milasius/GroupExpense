using server.Dto;
using server.Models;
using System.Threading.Tasks;

namespace server.Services;

public interface ITransactionService
{
    Task<Transaction> CreateTransactionAsync(TransactionDto transactionDto);
    Task<IEnumerable<TransactionDto>> GetTransactionsByGroupAsync(int groupId);
}