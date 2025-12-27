using BooksEcommerce.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Register DbContext
builder.Services.AddDbContext<BooksDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();

// --- CORS setup ---
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Get from config/env: CSV string like "https://frontend1,https://frontend2"
        var origins = builder.Configuration
            .GetValue<string>("AllowedOrigins")?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? Array.Empty<string>();

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ---------------------

// --- Swagger setup ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BooksEcommerce API", Version = "v1" });
});

// ---- MIGRATION ENTRYPOINT ----
if (args.Length == 2 && args[0].ToLower() == "database" && args[1].ToLower() == "update")
{
    Console.WriteLine("Running EF Core migrations...");
    var host = builder.Build();
    using (var scope = host.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<BooksDbContext>();
        db.Database.Migrate();
    }
    Console.WriteLine("Migration complete.");
    return; // Exit after migration.
}
// --------------------------------

var app = builder.Build();

// Enable Swagger UI (change to conditional if you only want it in Development)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BooksEcommerce API v1");
    // default RoutePrefix ("swagger") is kept so UI is served at /swagger
});

app.UseHttpsRedirection();

// Enable CORS (must be before UseAuthorization and before endpoints)
app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();
