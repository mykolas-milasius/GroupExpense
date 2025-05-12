namespace server.Models;

public class Group
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<User> Users {get; set;} = new List<User>();
}