// using Microsoft.EntityFrameworkCore;
// using server.Data;
// using server.Models;
// using System.Threading.Tasks;

// namespace server.Services;

// public class TransactionService : ITransactionService
// {
//     private readonly AppDbContext _context;

//     public TransactionService(AppDbContext context)
//     {
//         _context = context;
//     }

//     public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
//     {
//         if (string.IsNullOrWhiteSpace(transaction.Title))
//         {
//             throw new ArgumentException("Transaction title cannot be empty");
//         }
//         if (transaction.Amount <= 0)
//         {
//             throw new ArgumentException("Transaction amount must be greater than zero");
//         }
//         if (!await _context.Users.AnyAsync(u => u.Id == transaction.UserId))
//         {
//             throw new ArgumentException("Invalid user ID");
//         }
//         if (!await _context.Groups.AnyAsync(g => g.Id == transaction.GroupId))
//         {
//             throw new ArgumentException("Invalid group ID");
//         }

//         transaction.Date = DateTime.Now;
//         _context.Transactions.Add(transaction);
//         await _context.SaveChangesAsync();

//         await _context.Entry(transaction)
//                     .Reference(t => t.User)
//                     .LoadAsync();
//         await _context.Entry(transaction)
//             .Reference(t => t.Group)
//             .LoadAsync();

//         return transaction;
//     }

//     public async Task<IEnumerable<Transaction>> GetTransactionsByGroupAsync(int groupId)
//     {
//         return await _context.Transactions
//             .Where(t => t.GroupId == groupId)
//             .Include(t => t.User)
//             .Include(t => t.Group)
//             .OrderByDescending(t => t.Date)
//             .ToListAsync();
//     }

//         public async Task CreateTransactionAsync(int groupId, int userId, SettleDebtRequestDto request)
//     {
//         var group = await _context.Groups
//             .Include(g => g.Users)
//             .FirstOrDefaultAsync(g => g.Id == groupId);
//         if (group == null)
//             throw new ArgumentException("Group not found");

//         var transactions = await _context.Transactions
//             .Where(t => t.GroupId == groupId)
//             .ToListAsync();
//         var settlements = await _context.Settlements
//             .Where(s => s.GroupId == groupId)
//             .ToListAsync();

//         decimal totalExpenses = transactions.Sum(t => t.Amount);
//         int memberCount = group.Users.Count;
//         decimal userShare = memberCount > 0 ? totalExpenses / memberCount : 0;
//         decimal totalPaidByUser = transactions.Where(t => t.UserId == userId).Sum(t => t.Amount);
//         decimal totalSettledByUser = settlements.Where(s => s.UserId == userId).Sum(s => s.Amount);
//         decimal balance = totalPaidByUser - userShare + totalSettledByUser;

//         if (request.Amount > 0)
//         {
//             if (balance >= 0)
//                 throw new InvalidOperationException("Cannot settle debt when balance is not negative");
//             if (request.Amount > Math.Abs(balance))
//                 throw new ArgumentException($"Amount cannot exceed debt of {Math.Abs(balance):F2}");

//             var settlement = new Settlement
//             {
//                 GroupId = groupId,
//                 UserId = userId,
//                 Amount = request.Amount,
//                 Date = DateTime.Now
//             };
//             _context.Settlements.Add(settlement);
//         }
//         else
//         {
//             decimal totalDebt = request.Amounts.Sum(a => a.Value);
//             if (request.SettleType == "Equally")
//             {
//                 decimal amountPerUser = totalDebt / memberCount;
//                 foreach (var user in group.Users)
//                 {
//                     var settlement = new Settlement
//                     {
//                         GroupId = groupId,
//                         UserId = user.Id,
//                         Amount = amountPerUser,
//                         Date = DateTime.Now
//                     };
//                     _context.Settlements.Add(settlement);
//                 }
//             }
//             else if (request.SettleType == "Percentage")
//             {
//                 var percentages = request.Percentages.Values;

//                 if (request.Percentages.Count != memberCount)
//                     throw new ArgumentException($"Percentages must be provided for all {memberCount} group members");

//                 decimal totalPercentage = request.Percentages.Sum(p => p.Value);

//                 if (Math.Abs(totalPercentage - 100) > 0.01m)
//                     throw new ArgumentException($"Percentages must sum to 100%, but got {totalPercentage:F2}%");

//                 List<Settlement> settlementsToAdd = new List<Settlement>();

//                 var users = group.Users.OrderBy(u => u.Id).ToList();

//                 decimal totalAmount = request.Amount;

//                 for (int i = 0; i < users.Count; i++)
//                 {
//                     var user = users[i];

//                     if (!request.Percentages.ContainsKey(user.Id))
//                         throw new ArgumentException($"Percentage not provided for user {user.Name} (ID: {user.Id})");

//                     decimal percentage = request.Percentages[user.Id];

//                     if (percentage < 0)
//                         throw new ArgumentException($"Percentage for user {user.Name} (ID: {user.Id}) cannot be negative");

//                     decimal amount;

//                     if (i == users.Count - 1)
//                     {
//                         amount = totalAmount; // gal taip va
//                     }
//                     else
//                     {
//                         amount = Math.Round((totalAmount * percentage) / 100, 2);
//                         totalAmount = totalAmount - Math.Round((totalAmount * percentage) / 100, 2);
//                     }

//                     var settlement = new Settlement
//                     {
//                         GroupId = groupId,
//                         UserId = user.Id,
//                         Amount = amount,
//                         Date = DateTime.Now
//                     };
//                     settlementsToAdd.Add(settlement);
//                 }

//                 if (Math.Abs(calculatedTotal - totalDebt) > 0.01m)
//                     throw new InvalidOperationException($"Calculated total {calculatedTotal:F2} does not match requested amount {totalDebt:F2}");

//                 _context.Settlements.AddRange(settlementsToAdd);
//                 /*
//                 decimal totalPercentage = request.Percentages.Sum(p => p.Value);
//                 if (Math.Abs(totalPercentage - 100) > 0.01m)
//                     throw new ArgumentException("Percentages must sum to 100%");

//                 foreach (var user in group.Users)
//                 {
//                     decimal percentage = request.Percentages.ContainsKey(user.Id) ? request.Percentages[user.Id] : 0;
//                     decimal amount = totalDebt * (percentage / 100);
//                     var settlement = new Settlement
//                     {
//                         GroupId = groupId,
//                         UserId = user.Id,
//                         Amount = amount,
//                         Date = DateTime.Now
//                     };
//                     _context.Settlements.Add(settlement);
//                 }
//                 */
//             }
//             else if (request.SettleType == "Dynamic")
//             {
//                 decimal totalAmount = request.Amounts.Sum(a => a.Value);
//                 if (Math.Abs(totalAmount - totalDebt) > 0.01m)
//                     throw new ArgumentException($"Total amount must equal {totalDebt:F2}");

//                 foreach (var user in group.Users)
//                 {
//                     decimal amount = request.Amounts.ContainsKey(user.Id) ? request.Amounts[user.Id] : 0;
//                     var settlement = new Settlement
//                     {
//                         GroupId = groupId,
//                         UserId = user.Id,
//                         Amount = amount,
//                         Date = DateTime.Now
//                     };
//                     _context.Settlements.Add(settlement);
//                 }
//             }
//             else
//             {
//                 throw new ArgumentException("Invalid settle type");
//             }
//         }

//         await _context.SaveChangesAsync();
//     }
// }