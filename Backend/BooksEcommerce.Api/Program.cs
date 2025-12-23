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
        policy.WithOrigins("http://localhost:3000",
    "http://a34385d90a2b1448189c9605a011936e-2117317455.eu-west-1.elb.amazonaws.com")
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
// ---------------------

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
