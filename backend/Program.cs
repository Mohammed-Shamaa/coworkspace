using System.Text;
using Coworkspace.API.Data;
using Coworkspace.API.Middleware;
using Coworkspace.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

// Npgsql: allow DateTime with Kind=Local to be sent to PostgreSQL timestamptz columns.
// SQLite accepts any Kind, but PostgreSQL requires UTC. This switch avoids breaking
// every DateTime query when migrating from SQLite.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

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
var isPostgresUri = connString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
    || connString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase);
var isPostgresKeyValue = connString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase)
    || connString.StartsWith("Server=", StringComparison.OrdinalIgnoreCase);
var isPostgres = isPostgresUri || isPostgresKeyValue;

if (isPostgres)
{
    if (isPostgresUri)
    {
        // Parse postgresql://user:password@host:port/database → key-value format.
        // System.Uri handles any URI scheme reliably.
        try
        {
            var uri = new Uri(connString);
            var userInfo = uri.UserInfo.Split(':');
            var host = uri.Host;
            var pgPort = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.Trim('/');
            var username = Uri.UnescapeDataString(userInfo[0]);
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

            connString = $"Host={host};Port={pgPort};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Startup] Warning: Could not parse PostgreSQL URI: {ex.Message}");
            if (!connString.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
            {
                connString += ";SSL Mode=Require;Trust Server Certificate=true";
            }
        }
    }
    else
    {
        // Already key-value format — ensure SSL mode is set.
        try
        {
            var npgsqlBuilder = new NpgsqlConnectionStringBuilder(connString);
            if (npgsqlBuilder.SslMode < SslMode.Require)
            {
                npgsqlBuilder.SslMode = SslMode.Require;
            }
            connString = npgsqlBuilder.ConnectionString;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Startup] Warning: Could not parse PostgreSQL connection string: {ex.Message}");
            if (!connString.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
            {
                connString += ";SSL Mode=Require;Trust Server Certificate=true";
            }
        }
    }
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connString));
}

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
    options.AddPolicy("RequireSuperAdmin", policy => policy.RequireRole("SuperAdmin"));
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

// Resend (email)
var hasResendKey = !string.IsNullOrEmpty(builder.Configuration["RESEND_API_KEY"]);
builder.Services.AddHttpClient();
builder.Services.AddScoped<EmailService>();
if (hasResendKey)
    Console.WriteLine("[Startup] Resend email service configured.");
else
    Console.WriteLine("[Startup] Warning: RESEND_API_KEY environment variable not set. Email notifications disabled.");

// Services
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<MeetingRoomService>();
builder.Services.AddScoped<NotificationService>();

// Background services
builder.Services.AddHostedService<Coworkspace.API.Services.BillingSyncService>();
builder.Services.AddHostedService<Coworkspace.API.Services.SubscriptionNotificationService>();

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

var app = builder.Build();

// QuestPDF license
try
{
    QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
}
catch
{
    Console.WriteLine("[Startup] Warning: Could not set QuestPDF license. PDF generation may fail.");
}

// Log which port the server is actually listening on
var urls = app.Urls;
Console.WriteLine($"[Startup] Backend listening on: {string.Join(", ", urls)}");

// Apply pending EF Core migrations with graceful error handling.
// SQLite (dev): use MigrateAsync with the existing SQLite-compatible migration.
// PostgreSQL (Render): MigrateAsync will fail at model-snapshot mismatch because
// the migration was generated for SQLite. In that case we run raw PostgreSQL DDL
// with proper identity columns, create __EFMigrationsHistory, and mark the
// migration as applied — a one-time bootstrap per database.
// If ANY part of database initialization fails, the app logs a warning and
// continues starting — it never crashes the container.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var usingPostgres = db.Database.ProviderName?.Contains("Npgsql") == true;

    try
    {
        if (usingPostgres)
        {
            try
            {
                Console.WriteLine("[Startup] Applying PostgreSQL migrations...");
                await db.Database.MigrateAsync();
                Console.WriteLine("[Startup] PostgreSQL migrations applied successfully.");
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
    "Status" integer NOT NULL,
    "PaymentStatus" integer NOT NULL,
    "ApprovalDate" timestamp with time zone NULL,
    "TrialStartDate" timestamp with time zone NULL,
    "SubscriptionExpiryDate" timestamp with time zone NULL,
    "WhatsappNumber" character varying(50) NOT NULL,
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

-- Ensure new columns exist on existing tables (safe to re-run)
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "Status" integer NOT NULL DEFAULT 0;
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "PaymentStatus" integer NOT NULL DEFAULT 0;
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "ApprovalDate" timestamp with time zone NULL;
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "TrialStartDate" timestamp with time zone NULL;
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "SubscriptionExpiryDate" timestamp with time zone NULL;
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "WhatsappNumber" character varying(50) NOT NULL DEFAULT '';
ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "IsLocked" boolean NOT NULL DEFAULT FALSE;

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
CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "UserId" integer NOT NULL,
    "TenantId" integer NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Message" character varying(2000) NOT NULL,
    "Type" character varying(50) NOT NULL,
    "IsRead" boolean NOT NULL DEFAULT FALSE,
    "CreatedAt" timestamp with time zone NOT NULL,
    "RelatedEntityId" integer NULL,
    "RelatedEntityType" character varying(100) NULL,
    CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId" ON "Notifications" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId_IsRead" ON "Notifications" ("UserId", "IsRead");
CREATE INDEX IF NOT EXISTS "IX_Notifications_CreatedAt" ON "Notifications" ("CreatedAt" DESC);

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
                    Console.WriteLine($"[Startup] WARNING: PostgreSQL schema bootstrap failed: {innerEx.Message}");
                    Console.WriteLine("[Startup] App will continue starting. Manual DB setup may be required.");
                }
            }
        }
        else
        {
            try
            {
                Console.WriteLine("[Startup] Applying SQLite migrations...");
                await db.Database.MigrateAsync();
                Console.WriteLine("[Startup] SQLite migrations applied successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Startup] WARNING: SQLite migration failed: {ex.Message}");
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
                    Console.WriteLine($"[Startup] WARNING: SQLite migration fallback also failed: {innerEx.Message}");
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] WARNING: Database initialization error: {ex.Message}");
        Console.WriteLine("[Startup] App will continue starting without database access.");
    }
}

// Seed SuperAdmin account (must run AFTER migrations so tables exist)
try
{
    using var seedScope = app.Services.CreateScope();
    var seedDb = seedScope.ServiceProvider.GetRequiredService<AppDbContext>();

    var superAdminEmail = "admin@deskora.com";
    var existingSuperAdmin = await seedDb.Users.FirstOrDefaultAsync(u => u.Email == superAdminEmail);

    if (existingSuperAdmin == null)
    {
        // Check if subdomain "admin" already exists to avoid constraint violation
        if (await seedDb.Tenants.AnyAsync(t => t.Subdomain == "admin"))
        {
            Console.WriteLine("[Startup] WARNING: Subdomain 'admin' already taken. SuperAdmin tenant cannot be created.");
        }
        else
        {
            var superAdminTenant = new Coworkspace.API.Models.Tenant
            {
                Name = "Deskora",
                CompanyName = "Deskora",
                Subdomain = "admin",
                PrimaryColor = "#1565C0",
                IsActive = true,
                Status = Coworkspace.API.Models.TenantStatus.Approved,
                OnboardingCompleted = true,
                TotalDesks = 0,
                MaxCapacity = 0,
                HasMeetingRoom = false,
                Address = "Deskora HQ",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            seedDb.Tenants.Add(superAdminTenant);
            await seedDb.SaveChangesAsync();

            var superAdmin = new Coworkspace.API.Models.User
            {
                Email = superAdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Environment.GetEnvironmentVariable("SUPERADMIN_PASSWORD") ?? "Mohammed+-@@^"),
                FullName = "Super Admin",
                Role = Coworkspace.API.Models.UserRole.SuperAdmin,
                TenantId = superAdminTenant.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            seedDb.Users.Add(superAdmin);
            await seedDb.SaveChangesAsync();

            Console.WriteLine("[Startup] SuperAdmin account seeded successfully.");
        }
    }
    else
    {
        Console.WriteLine("[Startup] SuperAdmin account already exists.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[Startup] WARNING: SuperAdmin seeding failed: {ex.Message}");
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

// Health check (reports database connectivity so Render can verify the app is alive)
app.MapGet("/api/health", async (AppDbContext db) =>
{
    var dbHealthy = false;
    try
    {
        dbHealthy = await db.Database.CanConnectAsync();
    }
    catch { }
    return Results.Ok(new
    {
        status = dbHealthy ? "healthy" : "degraded",
        database = dbHealthy ? "connected" : "unavailable",
        timestamp = DateTime.UtcNow
    });
});

app.Run();
