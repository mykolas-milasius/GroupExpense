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
    public DbSet<User> Users { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>()
            .HasMany(g => g.Users)
            .WithMany(u => u.Groups)
            .UsingEntity<Dictionary<string, object>>(
                "GroupUser",
                j => j.HasOne<User>().WithMany().HasForeignKey("UsersId"),
                j => j.HasOne<Group>().WithMany().HasForeignKey("GroupsId"),
                j =>
                {
                    j.Property<int>("GroupsId");
                    j.Property<int>("UsersId");
                    j.HasKey("GroupsId", "UsersId");
                });
        
    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.User)
        .WithMany()
        .HasForeignKey(t => t.UserId)
        .OnDelete(DeleteBehavior.Restrict)
        .IsRequired(false);

    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.Group)
        .WithMany()
        .HasForeignKey(t => t.GroupId)
        .OnDelete(DeleteBehavior.Restrict)
        .IsRequired(false);

    modelBuilder.Entity<Transaction>()
        .Property(t => t.UserId)
        .IsRequired();

    modelBuilder.Entity<Transaction>()
        .Property(t => t.GroupId)
        .IsRequired();
    }
}