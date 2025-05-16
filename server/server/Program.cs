using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;
using server.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Groups API", Version = "v1" });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("GroupsDb"));

builder.Services.AddScoped<IGroupsService, GroupsService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Seed Groups if none exist
    if (!await dbContext.Groups.AnyAsync())
    {
        var groups = new[]
        {
            new Group { Title = "Family Gathering" },
            new Group { Title = "Work Team" },
            new Group { Title = "Friends Trip" },
            new Group { Title = "Book Club" }
        };
        dbContext.Groups.AddRange(groups);
        await dbContext.SaveChangesAsync();
    }

    // Seed Users if none exist
    if (!await dbContext.Users.AnyAsync())
    {
        var users = new[]
        {
            new User { Name = "Michael" },
            new User { Name = "Alice" },
            new User { Name = "Bob" },
            new User { Name = "Charlie" }
        };
        dbContext.Users.AddRange(users);
        await dbContext.SaveChangesAsync();
    }

    // Seed GroupMembers if none exist
    if (!await dbContext.GroupMembers.AnyAsync())
    {
        var group1 = await dbContext.Groups.FirstOrDefaultAsync(g => g.Title == "Family Gathering");
        var group2 = await dbContext.Groups.FirstOrDefaultAsync(g => g.Title == "Work Team");
        var group3 = await dbContext.Groups.FirstOrDefaultAsync(g => g.Title == "Friends Trip");
        var group4 = await dbContext.Groups.FirstOrDefaultAsync(g => g.Title == "Book Club");

        var michael = await dbContext.Users.FirstOrDefaultAsync(u => u.Name == "Michael");
        var alice = await dbContext.Users.FirstOrDefaultAsync(u => u.Name == "Alice");
        var bob = await dbContext.Users.FirstOrDefaultAsync(u => u.Name == "Bob");
        var charlie = await dbContext.Users.FirstOrDefaultAsync(u => u.Name == "Charlie");

        // Ensure all required entities exist
        if (group1 == null || group2 == null || group3 == null || group4 == null ||
            michael == null || alice == null || bob == null || charlie == null)
        {
            throw new InvalidOperationException("Required groups or users not found.");
        }

        var groupMembers = new[]
        {
            new GroupMember { UserId = michael.Id, GroupId = group1.Id },
            new GroupMember { UserId = alice.Id, GroupId = group2.Id },
            new GroupMember { UserId = bob.Id, GroupId = group3.Id },
            new GroupMember { UserId = charlie.Id, GroupId = group4.Id }
        };

        dbContext.GroupMembers.AddRange(groupMembers);
        await dbContext.SaveChangesAsync();
    }

    // Seed Transactions if none exist
    if (!await dbContext.Transactions.AnyAsync())
    {
        var michaelInFamily = await dbContext.GroupMembers
            .FirstOrDefaultAsync(gm => gm.User.Name == "Michael" && gm.Group.Title == "Family Gathering");
        var aliceInWork = await dbContext.GroupMembers
            .FirstOrDefaultAsync(gm => gm.User.Name == "Alice" && gm.Group.Title == "Work Team");
        var bobInFriends = await dbContext.GroupMembers
            .FirstOrDefaultAsync(gm => gm.User.Name == "Bob" && gm.Group.Title == "Friends Trip");
        var charlieInBookClub = await dbContext.GroupMembers
            .FirstOrDefaultAsync(gm => gm.User.Name == "Charlie" && gm.Group.Title == "Book Club");

        // Ensure all required group members exist
        if (michaelInFamily == null || aliceInWork == null || bobInFriends == null || charlieInBookClub == null)
        {
            throw new InvalidOperationException("Required group members not found.");
        }

        var transactions = new[]
        {
            new Transaction
            {
                Title = "Dinner Expense",
                Amount = 50.00m,
                GroupMemberId = michaelInFamily.Id
            },
            new Transaction
            {
                Title = "Taxi Fare",
                Amount = 15.00m,
                GroupMemberId = aliceInWork.Id
            },
            new Transaction
            {
                Title = "Office Supplies",
                Amount = 30.00m,
                GroupMemberId = bobInFriends.Id
            }
        };

        dbContext.Transactions.AddRange(transactions);
        await dbContext.SaveChangesAsync();
    }
}

app.Run();