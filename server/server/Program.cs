using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;

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
    dbContext.Groups.AddRange(
        new server.Models.Group { Name = "Group 1", Description = "First group" },
        new server.Models.Group { Name = "Group 2", Description = "Second group" },
        new server.Models.Group { Name = "Group 3", Description = "Third group" }
    );
    dbContext.SaveChanges();
}

app.Run();