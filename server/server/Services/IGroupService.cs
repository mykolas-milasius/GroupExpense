using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services;

public interface IGroupsService
{
    Task<IEnumerable<Group>> GetGroupsAsync();
    Task<GroupDto?> GetGroupAsync(int id);
    Task<Group> CreateGroupAsync(CreateGroupDto createGroupDto);
    Task<bool> AddUserToGroupAsync(int groupId, int userId);
    Task<bool> RemoveUserFromGroupAsync(int groupId, int userId);
}