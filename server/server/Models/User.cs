namespace server.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Group> Groups { get; set; } = new List<Group>();
}