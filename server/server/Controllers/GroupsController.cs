using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GroupsController : ControllerBase
{
    private readonly IGroupsService _groupsService;

    public GroupsController(IGroupsService groupsService)
    {
        _groupsService = groupsService;
    }

    /// <summary>
    /// Gets all groups.
    /// </summary>
    /// <returns>A list of groups.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
    {
        var groups = await _groupsService.GetGroupsAsync();
        return Ok(groups);
    }

    /// <summary>
    /// Gets a specific group by ID.
    /// </summary>
    /// <param name="id">The ID of the group.</param>
    /// <returns>The group with the specified ID.</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<Group>> GetGroup(int id)
    {
        var group = await _groupsService.GetGroupAsync(id);
        if (group == null)
        {
            return NotFound();
        }
        return Ok(group);
    }

    /// <summary>
    /// Creates a new group.
    /// </summary>
    /// <param name="group">The group to create.</param>
    /// <returns>The created group.</returns>
    [HttpPost]
    public async Task<ActionResult<Group>> PostGroup(Group group)
    {
        var createdGroup = await _groupsService.CreateGroupAsync(group);
        return CreatedAtAction(nameof(GetGroup), new { id = createdGroup.Id }, createdGroup);
    }

    /// <summary>
    /// Updates an existing group.
    /// </summary>
    /// <param name="id">The ID of the group to update.</param>
    /// <param name="group">The updated group data.</param>
    /// <returns>No content if successful.</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutGroup(int id, Group group)
    {
        var success = await _groupsService.UpdateGroupAsync(id, group);
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a group by ID.
    /// </summary>
    /// <param name="id">The ID of the group to delete.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        var success = await _groupsService.DeleteGroupAsync(id);
        if (!success)
        {
            return NotFound();
        }
        return NoContent();
    }
}