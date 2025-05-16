namespace server.Models;

public class GroupMember
{
    public int Id { get; set; }
    public decimal? Amount { get; set; } = null;
    public int GroupId { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public Group? Group { get; set; }
}