using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Group> Groups { get; set; }
    public DbSet <GroupMember> GroupMembers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>()
            .HasMany(g => g.GroupMembers);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.GroupMember)
            .WithMany()
            .HasForeignKey(t => t.GroupMemberId);

        modelBuilder.Entity<User>()
        .HasMany(g => g.GroupMembers);
    }
}