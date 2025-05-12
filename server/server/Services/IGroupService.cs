using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services;

public interface IGroupsService
{
    Task<IEnumerable<Group>> GetGroupsAsync();
    Task<Group?> GetGroupAsync(int id);
    Task<Group> CreateGroupAsync(Group group);
    Task<bool> UpdateGroupAsync(int id, Group group);
    Task<bool> DeleteGroupAsync(int id);
}
