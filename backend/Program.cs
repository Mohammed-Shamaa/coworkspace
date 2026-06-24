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
    || connString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
    || connString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase);
if (isPostgres)
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connString));
else
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connString));

// JWT Authentication — key is REQUIRED in production (set via Jwt__Key env var).
// In development, a default key is provided for convenience.
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? (builder.Environment.IsDevelopment() ? "DevJwtKeyForLocalDevelopmentOnly_Min32Chars!!" : null)
    ?? throw new InvalidOperationException("Jwt:Key is not configured. Set the Jwt__Key environment variable.");
// Push into configuration so controllers (e.g. AuthController.GenerateJwtToken) can read it.
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:Key"] = jwtKey });
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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireManager", policy => policy.RequireRole("Admin", "Manager"));
});

// CORS — environment-aware
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
if (!builder.Environment.IsDevelopment() && string.IsNullOrEmpty(frontendUrl))
{
    throw new InvalidOperationException("FRONTEND_URL environment variable is required in production. Set it to your Vercel frontend URL.");
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(frontendUrl!).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
        }
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
                errorCode = "AUTH_VALIDATION_ERROR",
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

// Apply pending EF Core migrations (safe — never drops data).
// Uses MigrateAsync in all environments.  A one-time transition helper
// handles databases previously created by EnsureCreated — it creates the
// __EFMigrationsHistory table and marks all migrations as applied so that
// future deploys use normal migration flow with zero data loss.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await db.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        // If MigrateAsync fails, it may be because the database was
        // previously created by EnsureCreated (tables exist but no
        // __EFMigrationsHistory). Try the transition path.
        Console.WriteLine($"[Startup] MigrateAsync failed: {ex.Message}. Attempting transition from EnsureCreated...");
        try
        {
            var allMigrations = scope.ServiceProvider
                .GetRequiredService<Microsoft.EntityFrameworkCore.Migrations.IMigrationsAssembly>()
                .Migrations.Keys.OrderBy(m => m).ToList();

            if (allMigrations.Count != 0)
            {
                await db.Database.ExecuteSqlRawAsync(
                    "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" TEXT NOT NULL, \"ProductVersion\" TEXT NOT NULL, PRIMARY KEY (\"MigrationId\"))");

                var insertSql = db.Database.ProviderName?.Contains("Npgsql") == true
                    ? "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1}) ON CONFLICT DO NOTHING"
                    : "INSERT OR IGNORE INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1})";

                foreach (var m in allMigrations)
                {
                    await db.Database.ExecuteSqlRawAsync(insertSql, m, "10.0.8");
                }

                Console.WriteLine($"[Startup] Transition complete: marked {allMigrations.Count} migration(s) as applied.");
            }
        }
        catch (Exception innerEx)
        {
            Console.WriteLine($"[Startup] FATAL: Database migration failed: {innerEx.Message}");
            Console.WriteLine("[Startup] The application cannot start without a working database.");
            throw;
        }
    }
}

// Configure pipeline
app.UseMiddleware<Coworkspace.API.Middleware.ExceptionHandlingMiddleware>();
app.UseMiddleware<Coworkspace.API.Middleware.RequestLoggingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    // Render terminates SSL at the proxy. ForwardedHeaders reads the
    // X-Forwarded-Proto header so that generated URLs use HTTPS correctly.
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
    });
}

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiting();
app.UseTenantMiddleware();
app.MapControllers();

// Health check
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
