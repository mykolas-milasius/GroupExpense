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
            //.Select(u => new {u.Id, u.Name})
            .ToListAsync();
    }
}