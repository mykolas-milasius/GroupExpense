namespace server.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();
}