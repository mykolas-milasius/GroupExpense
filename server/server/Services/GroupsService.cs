using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace server.Services;

public class GroupsService : IGroupsService
{
    private readonly AppDbContext _context;
    private const int FixedUserId = 1; // Fiksuotas vartotojo ID

    public GroupsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Group>> GetGroupsAsync()
    {
        return await _context.Groups
            .Include(g => g.Users)
            .ToListAsync();
    }

    public async Task<IEnumerable<GroupDto>> GetGroupsWithBalanceAsync(int userId = FixedUserId)
    {
        var groups = await _context.Groups
            .Include(g => g.Users)
            .Where(g => g.Users.Any(u => u.Id == userId))
            .ToListAsync();

        var groupDtos = new List<GroupDto>();
        foreach (var group in groups)
        {
            var transactions = await _context.Transactions
                .Where(t => t.GroupId == group.Id)
                .ToListAsync();

            decimal balance = 0;
            foreach (var transaction in transactions)
            {
                if (transaction.UserId == userId)
                {
                    balance += transaction.Amount;
                }
                else
                {
                    int memberCount = group.Users.Count;
                    balance -= transaction.Amount / memberCount;
                }
            }

            groupDtos.Add(new GroupDto
            {
                Id = group.Id,
                Title = group.Title,
                Balance = balance
            });
        }

        return groupDtos;
    }

    public async Task<GroupDto?> GetGroupAsync(int id)
    {
        var group = await _context.Groups
            .Include(g => g.Users)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (group == null) return null;

        var transactions = await _context.Transactions
            .Where(t => t.GroupId == id)
            .ToListAsync();
        decimal totalExpenses = transactions.Sum(t => t.Amount);
        int memberCount = group.Users.Count;
        decimal userShare = memberCount > 0 ? totalExpenses / memberCount : 0;
        decimal totalPaidByUser = transactions.Where(t => t.UserId == 1).Sum(t => t.Amount); // Fiksuotas UserId = 1
        decimal balance = totalPaidByUser - userShare;

        return new GroupDto
        {
            Id = group.Id,
            Title = group.Title,
            Balance = balance,
            Users = group.Users.Select(u => new UserDto { Id = u.Id, Name = u.Name }).ToList()
        };
    }

    public async Task<Group> CreateGroupAsync(Group group)
    {
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        return group;
    }

    public async Task<Group> CreateGroupAsync(CreateGroupDto createGroupDto)
    {
        var user = await _context.Users.FindAsync(FixedUserId);
        if (user == null)
            throw new ArgumentException("Fiksuotas vartotojas nerastas");

        var group = new Group
        {
            Title = createGroupDto.Title,
            Users = new List<User> { user }
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        return group;
    }

    public async Task<bool> UpdateGroupAsync(int id, Group group)
    {
        if (id != group.Id)
        {
            return false;
        }

        _context.Entry(group).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Groups.Any(e => e.Id == id))
            {
                return false;
            }
            throw;
        }
    }

    public async Task<bool> DeleteGroupAsync(int id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group == null)
        {
            return false;
        }

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddUserToGroupAsync(int groupId, int userId)
    {
        var group = await _context.Groups
            .Include(g => g.Users)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        var user = await _context.Users.FindAsync(userId);

        if (group == null || user == null)
        {
            return false;
        }

        if (!group.Users.Contains(user))
        {
            group.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<bool> RemoveUserFromGroupAsync(int groupId, int userId)
    {
        var group = await _context.Groups
            .Include(g => g.Users)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        var user = await _context.Users.FindAsync(userId);

        if (group == null || user == null || !group.Users.Contains(user))
        {
            return false;
        }

        group.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}