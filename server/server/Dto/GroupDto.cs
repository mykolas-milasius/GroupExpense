namespace server.Models;

public class GroupDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<GroupMemberDto> GroupMembers { get; set; } = new List<GroupMemberDto>();
}