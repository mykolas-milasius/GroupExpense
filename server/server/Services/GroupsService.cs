using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services;

public class GroupsService : IGroupsService
{
    private readonly AppDbContext _context;

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

    public async Task<Group?> GetGroupAsync(int id)
    {
        return await _context.Groups
            .Include(g => g.Users)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Group> CreateGroupAsync(Group group)
    {
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
}