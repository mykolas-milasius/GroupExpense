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

    public GroupsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Group>> GetGroupsAsync()
    {
        return await _context.Groups
            .Include(g => g.GroupMembers)
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<GroupDto?> GetGroupAsync(int id) // krc tvarkyt reiks brolau
    {
        var group = await _context.Groups
            .Include(g => g.GroupMembers)
            .ThenInclude(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == id);
        
        if (group == null) return null;

        return new GroupDto
        {
            Id = group.Id,
            Title = group.Title,
            GroupMembers = group.GroupMembers.Select(gm => new GroupMemberDto { Id = gm.UserId, Name = gm.User!.Name, Amount = gm.Amount}).ToList()
        };
    }

    public async Task<Group> CreateGroupAsync(CreateGroupDto groupDto)
    {
        var group = new Group() { Title = groupDto.Title };
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        return group;
    }
    
    public async Task<bool> AddUserToGroupAsync(int groupId, int userId)
    {
        var group = await _context.Groups
            .Include(g => g.GroupMembers)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        
        var user = await _context.Users.FindAsync(userId);

        if (group == null || user == null)
        {
            return false;
        }

        if (!group.GroupMembers.Any(g => g.UserId == userId))
        {
            var groupMember = new GroupMember() { UserId = userId, GroupId = groupId };
            _context.GroupMembers.Add(groupMember);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<bool> RemoveUserFromGroupAsync(int groupId, int userId)
    {
        var group = await _context.Groups
            .Include(g => g.GroupMembers)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        
        var user = await _context.Users.FindAsync(userId);

        if (group == null || user == null)
        {
            return false;
        }

        var groupMember = group.GroupMembers.FirstOrDefault(gm => gm.UserId == userId);

        if (groupMember == null)
        {
            return false;
        }

        group.GroupMembers.Remove(groupMember);
        
        await _context.SaveChangesAsync();
        return true;
    }
}