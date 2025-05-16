using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<IEnumerable<User>> GetAvailableUsersAsync(int groupId)
    {
        return await _context.Users
            .Where(u => !u.GroupMembers.Any(g => g.Id == groupId))
            .AsNoTracking()
            //.Select(u => new GroupMemberDto {Id = u.Id, Name = u.Name, Amount } })
            .ToListAsync();
    }

    public async Task<IEnumerable<GroupMemberDto>> GetGroupMembersFromGroup(int groupId)
    {
        return await _context.GroupMembers
            .Where(gm => gm.GroupId == groupId)
            .Select(u => new GroupMemberDto {Id = u.Id, Name = u.User!.Name, Amount = u.Amount})
            .ToListAsync();
    }
}