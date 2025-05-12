using Microsoft.EntityFrameworkCore;
using server.Data;
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

    public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
    {
        if (string.IsNullOrWhiteSpace(transaction.Title))
        {
            throw new ArgumentException("Transaction title cannot be empty");
        }
        if (transaction.Amount <= 0)
        {
            throw new ArgumentException("Transaction amount must be greater than zero");
        }
        if (!await _context.Users.AnyAsync(u => u.Id == transaction.UserId))
        {
            throw new ArgumentException("Invalid user ID");
        }
        if (!await _context.Groups.AnyAsync(g => g.Id == transaction.GroupId))
        {
            throw new ArgumentException("Invalid group ID");
        }

        transaction.Date = DateTime.Now;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        await _context.Entry(transaction)
                    .Reference(t => t.User)
                    .LoadAsync();
        await _context.Entry(transaction)
            .Reference(t => t.Group)
            .LoadAsync();

        return transaction;
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByGroupAsync(int groupId)
    {
        return await _context.Transactions
            .Where(t => t.GroupId == groupId)
            .Include(t => t.User)
            .Include(t => t.Group)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }
}