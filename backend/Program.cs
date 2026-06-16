using System.Text;
using Coworkspace.API.Data;
using Coworkspace.API.Middleware;
using Coworkspace.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Bind to Render dynamic PORT (fallback 5000 for local dev)
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Data Protection (persist keys to avoid container/ephemeral warnings)
var keysDir = "/tmp/keys";
Directory.CreateDirectory(keysDir);
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysDir))
    .SetApplicationName("Coworkspace");

// Database
var connString = builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=Coworkspace.db";
var isPostgres = connString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase)
    || connString.StartsWith("Server=", StringComparison.OrdinalIgnoreCase)
    || connString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);
if (isPostgres)
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connString));
else
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connString));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForDevelopment12345678!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CoworkspaceAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CoworkspaceApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Caching (used by RateLimitingMiddleware)
builder.Services.AddMemoryCache();

// Services
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<MeetingRoomService>();

// Background services
builder.Services.AddHostedService<Coworkspace.API.Services.BillingSyncService>();

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            var result = new
            {
                success = false,
                message = "Validation failed. Please check the form and try again.",
                errors
            };

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(result);
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// QuestPDF license
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var app = builder.Build();

// Log which port the server is actually listening on
var urls = app.Urls;
Console.WriteLine($"[Startup] Backend listening on: {string.Join(", ", urls)}");

// Apply migrations / ensure schema is up to date
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (app.Environment.IsDevelopment() && db.Database.ProviderName?.Contains("Sqlite") == true)
    {
        db.Database.EnsureCreated();
    }
    else
    {
        await db.Database.MigrateAsync();
    }
}

// Configure pipeline
app.UseMiddleware<Coworkspace.API.Middleware.ExceptionHandlingMiddleware>();
app.UseMiddleware<Coworkspace.API.Middleware.RequestLoggingMiddleware>();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseRateLimiting();
app.UseAuthorization();
app.UseTenantMiddleware();
app.MapControllers();

// Health check
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
