namespace server.Models;

public class GroupDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public List<UserDto> Users { get; set; } = new List<UserDto>();
}