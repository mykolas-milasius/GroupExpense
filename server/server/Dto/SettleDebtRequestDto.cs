namespace server.Models;

public class SettleDebtRequestDto
{
    public string SettleType { get; set; } = "Dynamic"; // "Equally", "Percentage", "Dynamic"
    public decimal Amount { get; set; }
    public Dictionary<int, decimal> Percentages { get; set; } = new Dictionary<int, decimal>(); // userId -> %
    public Dictionary<int, decimal> Amounts { get; set; } = new Dictionary<int, decimal>(); // userId -> amount $
}