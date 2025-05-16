using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Dto;
using server.Models;
using System.Threading.Tasks;

namespace server.Services;

public class TransactionService : ITransactionService
{
    private readonly AppDbContext _context;

    public TransactionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Transaction> CreateTransactionAsync(TransactionDto transactionDto)
    {
        if (string.IsNullOrWhiteSpace(transactionDto.Title))
        {
            throw new ArgumentException("Transaction title cannot be empty");
        }
        if (transactionDto.Amount <= 0)
        {
            throw new ArgumentException("Transaction amount must be greater than zero");
        }
        if (!await _context.GroupMembers.AnyAsync(u => u.Id == transactionDto.GroupMemberId))
        {
            throw new ArgumentException("Invalid group member ID");
        }

        var transaction = new Transaction() { Title = transactionDto.Title, Amount = transactionDto.Amount, GroupMemberId = transactionDto.GroupMemberId };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByGroupAsync(int groupId)
    {
        return await _context.Transactions
            .Where(t => t.GroupMember!.GroupId == groupId)
            .AsNoTracking()
            .ToListAsync();
    }
}