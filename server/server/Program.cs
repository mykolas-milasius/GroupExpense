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
    
    if (!dbContext.Groups.Any())
    {
        var groups = new[]
        {
            new Group { Title = "Family Gathering"},
            new Group { Title = "Work Team"},
            new Group { Title = "Friends Trip"},
            new Group { Title = "Book Club"}
        };
        dbContext.Groups.AddRange(groups);
        await dbContext.SaveChangesAsync();
    }

    if (!dbContext.Users.Any())
    {
        var users = new[]
        {
            new User { Name = "Alice" },
            new User { Name = "Bob" },
            new User { Name = "Charlie" }
        };
        dbContext.Users.AddRange(users);
        await dbContext.SaveChangesAsync();

        var group1 = await dbContext.Groups.FirstAsync(g => g.Title == "Family Gathering");
        var group2 = await dbContext.Groups.FirstAsync(g => g.Title == "Work Team");
        var alice = await dbContext.Users.FirstAsync(u => u.Name == "Alice");
        var bob = await dbContext.Users.FirstAsync(u => u.Name == "Bob");

        group1.Users.Add(alice);
        group1.Users.Add(bob);
        group2.Users.Add(bob);
        await dbContext.SaveChangesAsync();
    }

    if (!dbContext.Transactions.Any())
    {
        var alice = await dbContext.Users.FirstAsync(u => u.Name == "Alice");
        var bob = await dbContext.Users.FirstAsync(u => u.Name == "Bob");
        var group1 = await dbContext.Groups.FirstAsync(g => g.Title == "Family Gathering");
        var group2 = await dbContext.Groups.FirstAsync(g => g.Title == "Work Team");

        var transactions = new[]
        {
            new Transaction
            {
                Title = "Dinner Expense",
                Amount = 50.00m,
                Date = DateTime.Now.AddDays(-2),
                UserId = alice.Id,
                User = alice,
                GroupId = group1.Id,
                Group = group1
            },
            new Transaction
            {
                Title = "Taxi Fare",
                Amount = 15.00m,
                Date = DateTime.Now.AddDays(-1),
                UserId = bob.Id,
                User = bob,
                GroupId = group1.Id,
                Group = group1
            },
            new Transaction
            {
                Title = "Office Supplies",
                Amount = 30.00m,
                Date = DateTime.Now,
                UserId = bob.Id,
                User = bob,
                GroupId = group2.Id,
                Group = group2
            }
        };
        dbContext.Transactions.AddRange(transactions);
        await dbContext.SaveChangesAsync();
    }
}

app.Run();