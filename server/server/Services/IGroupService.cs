using server.Models;

namespace server.Services;

public interface IGroupsService
{
    Task<IEnumerable<Group>> GetGroupsAsync();
    Task<IEnumerable<GroupDto>> GetGroupsWithBalanceAsync(int userId);
    Task<GroupDto?> GetGroupAsync(int id);
    Task<Group> CreateGroupAsync(Group group);
    Task<Group> CreateGroupAsync(CreateGroupDto createGroupDto);
    Task<bool> UpdateGroupAsync(int id, Group group);
    Task<bool> DeleteGroupAsync(int id);
    Task<bool> AddUserToGroupAsync(int groupId, int userId);
    Task<bool> RemoveUserFromGroupAsync(int groupId, int userId);
}