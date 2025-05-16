namespace server.Models;

public class Transaction
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int GroupMemberId { get; set; }
    public GroupMember? GroupMember { get; set; }
}