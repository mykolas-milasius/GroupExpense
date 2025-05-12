using Microsoft.EntityFrameworkCore;
     using server.Data;

     var builder = WebApplication.CreateBuilder(args);

     // Add services to the container.
     builder.Services.AddControllers()
         .AddNewtonsoftJson(options =>
         {
             options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
         });

     // Add Swagger services
     builder.Services.AddEndpointsApiExplorer();
     builder.Services.AddSwaggerGen(c =>
     {
         c.SwaggerDoc("v1", new() { Title = "Groups API", Version = "v1" });
     });

     // Configure EF Core with in-memory database
     builder.Services.AddDbContext<AppDbContext>(options =>
         options.UseInMemoryDatabase("GroupsDb"));

     // Add CORS to allow frontend requests
     builder.Services.AddCors(options =>
     {
         options.AddPolicy("AllowAll", builder =>
         {
             builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
         });
     });

     var app = builder.Build();

     // Configure the HTTP request pipeline.
     if (app.Environment.IsDevelopment())
     {
         app.UseSwagger();
         app.UseSwaggerUI();
     }

     // Remove HTTPS redirection to avoid issues with HTTP
     // app.UseHttpsRedirection();
     app.UseCors("AllowAll");
     app.UseAuthorization();
     app.MapControllers();

     // Seed initial data
     using (var scope = app.Services.CreateScope())
     {
         var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
         dbContext.Groups.AddRange(
             new server.Models.Group { Name = "Group 1", Description = "First group" },
             new server.Models.Group { Name = "Group 2", Description = "Second group" }
         );
         dbContext.SaveChanges();
     }

     app.Run();