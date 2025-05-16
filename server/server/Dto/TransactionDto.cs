namespace server.Dto;

public class TransactionDto
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int GroupMemberId{ get; set; }
    public required string GroupMemberName { get; set; }
    public TransactionTypeEnum TransactionType { get; set; }
}