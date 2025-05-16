using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services;

public interface IUserService
{
    Task<IEnumerable<User>> GetUsersAsync();
    Task<IEnumerable<User>> GetAvailableUsersAsync(int groupId);
    Task<IEnumerable<GroupMemberDto>> GetGroupMembersFromGroup(int groupId);
}