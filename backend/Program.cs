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

// Apply pending EF Core migrations.
// SQLite (dev): use MigrateAsync with the existing SQLite-compatible migration.
// PostgreSQL (Render): MigrateAsync will fail at model-snapshot mismatch because
// the migration was generated for SQLite. In that case we run raw PostgreSQL DDL
// with proper identity columns, create __EFMigrationsHistory, and mark the
// migration as applied — a one-time bootstrap per database.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var usingPostgres = db.Database.ProviderName?.Contains("Npgsql") == true;

    if (usingPostgres)
    {
        // For PostgreSQL — try MigrateAsync first.  If it fails (expected on a
        // fresh database because the migration was generated for SQLite),
        // bootstrap with raw DDL and stub the history table.
        try
        {
            await db.Database.MigrateAsync();
        }
        catch
        {
            Console.WriteLine("[Startup] MigrateAsync failed on PostgreSQL; running raw schema bootstrap...");
            try
            {
                await db.Database.ExecuteSqlRawAsync("""
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" text NOT NULL,
    "ProductVersion" text NOT NULL,
    PRIMARY KEY ("MigrationId")
);

CREATE TABLE IF NOT EXISTS "Tenants" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Subdomain" character varying(100) NOT NULL,
    "LogoUrl" character varying(500) NOT NULL,
    "PrimaryColor" character varying(200) NOT NULL,
    "CompanyName" character varying(200) NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "OnboardingCompleted" boolean NOT NULL,
    "TotalDesks" integer NULL,
    "MaxCapacity" integer NULL,
    "HasMeetingRoom" boolean NOT NULL,
    "Address" character varying(500) NOT NULL,
    "OpeningTime" interval NULL,
    "ClosingTime" interval NULL,
    CONSTRAINT "PK_Tenants" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "MeetingRoomReservations" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "TenantId" integer NOT NULL,
    "PersonName" character varying(200) NOT NULL,
    "ReservationDate" timestamp with time zone NOT NULL,
    "StartTime" interval NOT NULL,
    "EndTime" interval NOT NULL,
    "Notes" character varying(1000) NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_MeetingRoomReservations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_MeetingRoomReservations_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Members" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "TenantId" integer NOT NULL,
    "FullName" character varying(200) NOT NULL,
    "PhoneNumber" character varying(50) NOT NULL,
    "NationalId" character varying(50) NOT NULL,
    "MemberType" character varying(20) NOT NULL,
    "WorkerType" character varying(20) NULL,
    "RegistrationDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NULL,
    "NoEndDate" boolean NOT NULL,
    "AttendancePlan" character varying(20) NOT NULL,
    "AttendanceSchedule" character varying(30) NULL,
    "StartTime" interval NOT NULL,
    "EndTime" interval NOT NULL,
    "DeskNumber" character varying(20) NOT NULL,
    "WorkingHours" double precision NOT NULL,
    "SubscriptionMonths" integer NOT NULL,
    "RemainingDays" integer NOT NULL,
    "TimePeriod" character varying(200) NOT NULL,
    "MonthlyFee" numeric(18,2) NOT NULL,
    "PaymentStatus" character varying(10) NOT NULL,
    "LastPaymentDate" timestamp with time zone NULL,
    "NextDueDate" timestamp with time zone NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Members" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Members_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "Email" character varying(100) NOT NULL,
    "PasswordHash" character varying(200) NOT NULL,
    "FullName" character varying(200) NOT NULL,
    "Role" integer NOT NULL,
    "TenantId" integer NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "LastLoginAt" timestamp with time zone NULL,
    "RefreshToken" text NULL,
    "RefreshTokenExpiry" timestamp with time zone NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Users_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "AuditLogs" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "TenantId" integer NOT NULL,
    "UserId" integer NULL,
    "Action" character varying(50) NOT NULL,
    "EntityType" character varying(200) NOT NULL,
    "EntityId" integer NULL,
    "Details" character varying(2000) NOT NULL,
    "IpAddress" character varying(50) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AuditLogs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "MemberId" integer NOT NULL,
    "TenantId" integer NOT NULL,
    "RecordedByUserId" integer NULL,
    "PaymentDate" timestamp with time zone NOT NULL,
    "PaymentTime" character varying(20) NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "Status" character varying(10) NOT NULL,
    "PaidMonth" character varying(30) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Payments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Payments_Members_MemberId" FOREIGN KEY ("MemberId") REFERENCES "Members" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Payments_Users_RecordedByUserId" FOREIGN KEY ("RecordedByUserId") REFERENCES "Users" ("Id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Tenants_Subdomain" ON "Tenants" ("Subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Members_TenantId_FullName" ON "Members" ("TenantId", "FullName");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Members_TenantId_PhoneNumber" ON "Members" ("TenantId", "PhoneNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Members_TenantId_NationalId" ON "Members" ("TenantId", "NationalId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_TenantId_Email" ON "Users" ("TenantId", "Email");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_TenantId" ON "AuditLogs" ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_UserId" ON "AuditLogs" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_MeetingRoomReservations_TenantId_ReservationDate_StartTime" ON "MeetingRoomReservations" ("TenantId", "ReservationDate", "StartTime");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_CreatedAt" ON "Members" ("TenantId", "CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_DeskNumber" ON "Members" ("TenantId", "DeskNumber");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_EndDate" ON "Members" ("TenantId", "EndDate");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_MemberType" ON "Members" ("TenantId", "MemberType");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_NextDueDate" ON "Members" ("TenantId", "NextDueDate");
CREATE INDEX IF NOT EXISTS "IX_Members_TenantId_PaymentStatus" ON "Members" ("TenantId", "PaymentStatus");
CREATE INDEX IF NOT EXISTS "IX_Payments_MemberId" ON "Payments" ("MemberId");
CREATE INDEX IF NOT EXISTS "IX_Payments_RecordedByUserId" ON "Payments" ("RecordedByUserId");
CREATE INDEX IF NOT EXISTS "IX_Payments_TenantId_MemberId_PaymentDate" ON "Payments" ("TenantId", "MemberId", "PaymentDate");
CREATE INDEX IF NOT EXISTS "IX_Users_RefreshToken" ON "Users" ("RefreshToken");
""");
                var migrationId = "20260619182035_InitialCreate";
                await db.Database.ExecuteSqlRawAsync(
                    "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1}) ON CONFLICT DO NOTHING",
                    migrationId, "10.0.8");
                Console.WriteLine("[Startup] PostgreSQL schema bootstrapped and migration marked as applied.");
            }
            catch (Exception innerEx)
            {
                Console.WriteLine($"[Startup] FATAL: PostgreSQL schema bootstrap failed: {innerEx.Message}");
                Console.WriteLine("[Startup] The application cannot start without a working database.");
                throw;
            }
        }
    }
    else
    {
        // SQLite — use normal MigrateAsync flow
        try
        {
            await db.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
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

                    foreach (var m in allMigrations)
                    {
                        await db.Database.ExecuteSqlRawAsync(
                            "INSERT OR IGNORE INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1})",
                            m, "10.0.8");
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
