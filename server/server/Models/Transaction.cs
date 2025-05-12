namespace server.Models;

public class Transaction
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount {get; set; } 
    public DateTime Date { get; set; } = DateTime.Now;
    public int UserId { get; set; }
    public User? User { get; set; }
    public int GroupId { get; set; }
    public Group? Group { get; set; }
}