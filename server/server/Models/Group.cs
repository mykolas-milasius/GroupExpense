namespace server.Models;

public class Group
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();
}