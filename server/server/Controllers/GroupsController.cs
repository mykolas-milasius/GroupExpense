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
    private const int FixedUserId = 1;
    private readonly IGroupsService _groupsService;

    public GroupsController(IGroupsService groupsService)
    {
        _groupsService = groupsService;
    }

    /// <summary>
    /// Gets all groups for the default user with their balance.
    /// </summary>
    /// <returns>A list of groups with balances.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GroupDto>>> GetGroups()
    {
        var groups = await _groupsService.GetGroupsWithBalanceAsync(FixedUserId);
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
    /// <param name="createGroupDto">The group data to create.</param>
    /// <returns>The created group.</returns>
    [HttpPost]
    public async Task<ActionResult<Group>> PostGroup([FromBody] CreateGroupDto createGroupDto)
    {
        if (string.IsNullOrWhiteSpace(createGroupDto.Title))
            return BadRequest("Grupės pavadinimas yra privalomas");

        var createdGroup = await _groupsService.CreateGroupAsync(createGroupDto);
        return CreatedAtAction(nameof(GetGroup), new { id = createdGroup.Id }, createdGroup);
    }
}