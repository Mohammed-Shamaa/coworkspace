using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Coworkspace.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext db, IConfiguration config, ILogger<AuthController> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        _logger.LogInformation(
            "Registration attempt: Email={Email}, CompanyName={CompanyName}, Subdomain={Subdomain}, FullName={FullName}",
            request.Email, request.CompanyName, request.Subdomain, request.FullName);

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.CompanyName) ||
            string.IsNullOrWhiteSpace(request.Subdomain))
        {
            _logger.LogWarning("Registration failed: required fields missing");
            return BadRequest(new
            {
                success = false,
                message = "All fields are required.",
                errorCode = "AUTH_VALIDATION_ERROR",
                errors = new
                {
                    email = string.IsNullOrWhiteSpace(request.Email) ? new[] { "Email is required." } : Array.Empty<string>(),
                    password = string.IsNullOrWhiteSpace(request.Password) ? new[] { "Password is required." } : Array.Empty<string>(),
                    fullName = string.IsNullOrWhiteSpace(request.FullName) ? new[] { "Full name is required." } : Array.Empty<string>(),
                    companyName = string.IsNullOrWhiteSpace(request.CompanyName) ? new[] { "Company name is required." } : Array.Empty<string>(),
                    subdomain = string.IsNullOrWhiteSpace(request.Subdomain) ? new[] { "Subdomain is required." } : Array.Empty<string>()
                }
            });
        }

        try
        {
            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                _logger.LogWarning("Registration failed: email already registered - {Email}", request.Email);
                return Conflict(new
                {
                    success = false,
                    message = "This email is already registered. Please use a different email or sign in.",
                    errorCode = "AUTH_EMAIL_EXISTS",
                    errors = new { email = new[] { "This email is already registered." } }
                });
            }

            if (await _db.Tenants.AnyAsync(t => t.Subdomain == request.Subdomain))
            {
                _logger.LogWarning("Registration failed: subdomain already taken - {Subdomain}", request.Subdomain);
                return Conflict(new
                {
                    success = false,
                    message = "This subdomain is already taken. Please choose a different one.",
                    errorCode = "AUTH_SUBDOMAIN_EXISTS",
                    errors = new { subdomain = new[] { "This subdomain is already taken." } }
                });
            }

            string passwordHash;
            try
            {
                passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Password hashing failed for Email={Email}", request.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Password processing failed. Please try a different password.",
                    errorCode = "AUTH_HASH_FAILURE",
                    errors = new { general = new[] { "Password hashing failed." } }
                });
            }

            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var tenant = new Tenant
                {
                    Name = request.CompanyName,
                    CompanyName = request.CompanyName,
                    Subdomain = request.Subdomain.ToLower(),
                    PrimaryColor = "#1565C0",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Tenants.Add(tenant);

                var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

                var user = new User
                {
                    Email = normalizedEmail,
                    PasswordHash = passwordHash,
                    FullName = request.FullName,
                    Role = UserRole.Admin,
                    Tenant = tenant,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
                };

                _db.Users.Add(user);

                await _db.SaveChangesAsync();

                var token = GenerateJwtToken(user, tenant);

                await transaction.CommitAsync();

                _logger.LogInformation("Registration successful: UserId={UserId}, TenantId={TenantId}, Email={Email}",
                    user.Id, tenant.Id, user.Email);

                return new AuthResponse
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    User = new UserInfo { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role.ToString() },
                    Tenant = new TenantInfo
                    {
                        Id = tenant.Id,
                        Name = tenant.Name,
                        Subdomain = tenant.Subdomain,
                        LogoUrl = tenant.LogoUrl,
                        PrimaryColor = tenant.PrimaryColor,
                        CompanyName = tenant.CompanyName,
                        HasMeetingRoom = tenant.HasMeetingRoom
                    }
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database constraint violation during registration for Email={Email}", request.Email);
            return Conflict(new
            {
                success = false,
                message = "A database constraint was violated. This email or subdomain may already be taken.",
                errorCode = "AUTH_DB_CONSTRAINT"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for Email={Email}", request.Email);
            return StatusCode(500, new
            {
                success = false,
                message = "An unexpected error occurred during registration. Please try again.",
                errorCode = "AUTH_REGISTRATION_ERROR",
                errors = new { general = new[] { "An internal error occurred." } }
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Email and password are required.",
                    errorCode = "AUTH_VALIDATION_ERROR",
                    errors = new
                    {
                        email = string.IsNullOrWhiteSpace(request.Email) ? new[] { "Email is required." } : Array.Empty<string>(),
                        password = string.IsNullOrWhiteSpace(request.Password) ? new[] { "Password is required." } : Array.Empty<string>()
                    }
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var user = await _db.Users.Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null || user.Tenant == null)
                return Unauthorized(new { success = false, message = "Invalid email or password.", errorCode = "AUTH_INVALID_CREDENTIALS", errors = new { general = new[] { "Invalid email or password." } } });

            bool passwordValid;
            try
            {
                passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Password verification failed for UserId={UserId}, Email={Email}", user.Id, user.Email);
                return Unauthorized(new { success = false, message = "Invalid email or password.", errorCode = "AUTH_INVALID_CREDENTIALS", errors = new { general = new[] { "Invalid email or password." } } });
            }

            if (!passwordValid)
                return Unauthorized(new { success = false, message = "Invalid email or password.", errorCode = "AUTH_INVALID_CREDENTIALS", errors = new { general = new[] { "Invalid email or password." } } });

            if (!user.IsActive)
                return Unauthorized(new { success = false, message = "Account is disabled.", errorCode = "AUTH_ACCOUNT_DISABLED", errors = new { general = new[] { "Account is disabled." } } });

            var tenant = user.Tenant;

            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.LastLoginAt = DateTime.UtcNow;
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Failed to persist login token fields for UserId={UserId}, TenantId={TenantId}", user.Id, user.TenantId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Login failed while updating the session. Please try again.",
                    errorCode = "AUTH_LOGIN_UPDATE_FAILED"
                });
            }

            var token = GenerateJwtToken(user, tenant);

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserInfo { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role.ToString() },
                Tenant = new TenantInfo
                {
                    Id = tenant.Id,
                    Name = tenant.Name,
                    Subdomain = tenant.Subdomain,
                    LogoUrl = tenant.LogoUrl,
                    PrimaryColor = tenant.PrimaryColor,
                    CompanyName = tenant.CompanyName,
                    HasMeetingRoom = tenant.HasMeetingRoom
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for Email={Email}", request.Email);
            return StatusCode(500, new
            {
                success = false,
                message = "An unexpected error occurred during login. Please try again.",
                errorCode = "AUTH_LOGIN_ERROR",
                errors = new { general = new[] { "An internal error occurred." } }
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshTokenRequest request)
    {
        try
        {
            var user = await _db.Users.Include(u => u.Tenant).FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);
            if (user == null || user.RefreshTokenExpiry <= DateTime.UtcNow)
                return Unauthorized(new { success = false, message = "Invalid or expired refresh token.", errorCode = "AUTH_TOKEN_EXPIRED" });

            if (user.Tenant == null)
                return BadRequest(new { success = false, message = "User has no associated tenant.", errorCode = "AUTH_TENANT_MISSING" });

            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Failed to persist refresh token for UserId={UserId}", user.Id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to refresh session. Please try again.",
                    errorCode = "AUTH_REFRESH_UPDATE_FAILED"
                });
            }

            var token = GenerateJwtToken(user, user.Tenant);

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserInfo { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role.ToString() },
                Tenant = new TenantInfo
                {
                    Id = user.Tenant.Id,
                    Name = user.Tenant.Name,
                    Subdomain = user.Tenant.Subdomain,
                    LogoUrl = user.Tenant.LogoUrl,
                    PrimaryColor = user.Tenant.PrimaryColor,
                    CompanyName = user.Tenant.CompanyName,
                    HasMeetingRoom = user.Tenant.HasMeetingRoom
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token refresh");
            return StatusCode(500, new
            {
                success = false,
                message = "An unexpected error occurred during token refresh.",
                errorCode = "AUTH_REFRESH_ERROR",
                errors = new { general = new[] { "An internal error occurred." } }
            });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserInfo>> GetMe()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            return Unauthorized(new { success = false, message = "Invalid token claims.", errorCode = "AUTH_INVALID_TOKEN" });

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { success = false, message = "User not found.", errorCode = "AUTH_USER_NOT_FOUND" });

        return new UserInfo { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role.ToString() };
    }

    private string GenerateJwtToken(User user, Tenant tenant)
    {
        var jwtKey = _config["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 16)
        {
            _logger.LogCritical("Jwt:Key is missing or too short (minimum 16 bytes required). Auth will fail.");
            throw new InvalidOperationException("Jwt:Key is not configured or is too short.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtKey);
        var expiry = DateTime.UtcNow.AddMinutes(15);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("TenantId", tenant.Id.ToString()),
            new Claim("FullName", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "CoworkspaceAPI",
            audience: _config["Jwt:Audience"] ?? "CoworkspaceApp",
            claims: claims,
            expires: expiry,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        );

        return tokenHandler.WriteToken(token);
    }
}
