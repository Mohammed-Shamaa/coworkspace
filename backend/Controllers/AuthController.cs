using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Coworkspace.API.Models;
using Coworkspace.API.Services;
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
    private readonly GoogleAuthService _googleAuth;
    private static byte[]? _cachedSigningKey;
    private static readonly object _keyLock = new();

    public AuthController(AppDbContext db, IConfiguration config, ILogger<AuthController> logger, GoogleAuthService googleAuth)
    {
        _db = db;
        _config = config;
        _logger = logger;
        _googleAuth = googleAuth;
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
            string.IsNullOrWhiteSpace(request.Subdomain) ||
            string.IsNullOrWhiteSpace(request.WhatsappNumber))
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
                    subdomain = string.IsNullOrWhiteSpace(request.Subdomain) ? new[] { "Subdomain is required." } : Array.Empty<string>(),
                    whatsappNumber = string.IsNullOrWhiteSpace(request.WhatsappNumber) ? new[] { "WhatsApp number is required." } : Array.Empty<string>()
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
                    Status = TenantStatus.Pending,
                    WhatsappNumber = request.WhatsappNumber,
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
                    Tenant = BuildTenantInfo(tenant)
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
                    errorCode = "AUTH_VALIDATION_ERROR"
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var userAuth = await _db.Users
                .Where(u => u.Email.ToLower() == email)
                .Select(u => new
                {
                    u.Id,
                    u.PasswordHash,
                    u.IsActive,
                    u.FullName,
                    u.Email,
                    Role = u.Role.ToString(),
                    TenantId = u.Tenant.Id,
                    TenantName = u.Tenant.Name,
                    TenantSubdomain = u.Tenant.Subdomain,
                    TenantLogoUrl = u.Tenant.LogoUrl,
                    TenantPrimaryColor = u.Tenant.PrimaryColor,
                    TenantCompanyName = u.Tenant.CompanyName,
                    TenantHasMeetingRoom = u.Tenant.HasMeetingRoom,
                    TenantStatus = u.Tenant.Status,
                    TenantPaymentStatus = u.Tenant.PaymentStatus,
                    TenantIsLocked = u.Tenant.IsLocked,
                    TenantTrialStartDate = u.Tenant.TrialStartDate,
                    TenantSubscriptionExpiryDate = u.Tenant.SubscriptionExpiryDate
                })
                .FirstOrDefaultAsync();

            if (userAuth == null)
                return Unauthorized(new { success = false, message = "Invalid email or password.", errorCode = "AUTH_INVALID_CREDENTIALS" });

            if (userAuth.PasswordHash == null)
                return Unauthorized(new { success = false, message = "This account uses Google Sign-In. Please sign in with Google.", errorCode = "AUTH_GOOGLE_ONLY" });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, userAuth.PasswordHash))
                return Unauthorized(new { success = false, message = "Invalid email or password.", errorCode = "AUTH_INVALID_CREDENTIALS" });

            if (!userAuth.IsActive)
                return Unauthorized(new { success = false, message = "Account is disabled.", errorCode = "AUTH_ACCOUNT_DISABLED" });

            if (userAuth.TenantStatus == TenantStatus.Rejected)
                return Unauthorized(new { success = false, message = "Your workspace request has been rejected. Please contact the administrator for more information.", errorCode = "AUTH_REJECTED" });

            if (userAuth.TenantIsLocked)
                return Unauthorized(new { success = false, message = "Your workspace has been temporarily disabled by the administrator. Please contact support for assistance.", errorCode = "AUTH_LOCKED" });

            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            var rows = await _db.Users
                .Where(u => u.Id == userAuth.Id)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(u => u.RefreshToken, refreshToken)
                    .SetProperty(u => u.RefreshTokenExpiry, DateTime.UtcNow.AddDays(7))
                    .SetProperty(u => u.LastLoginAt, DateTime.UtcNow));

            if (rows == 0)
            {
                _logger.LogError("Failed to persist login token fields for UserId={UserId}", userAuth.Id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Login failed while updating the session. Please try again.",
                    errorCode = "AUTH_LOGIN_UPDATE_FAILED"
                });
            }

            var tokenString = GenerateJwtToken(
                userAuth.Id.ToString(), userAuth.Email, userAuth.Role,
                userAuth.FullName, userAuth.TenantId.ToString());

            return new AuthResponse
            {
                Token = tokenString,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserInfo { Id = userAuth.Id, Email = userAuth.Email, FullName = userAuth.FullName, Role = userAuth.Role },
                Tenant = new TenantInfo
                {
                    Id = userAuth.TenantId,
                    Name = userAuth.TenantName,
                    Subdomain = userAuth.TenantSubdomain,
                    LogoUrl = userAuth.TenantLogoUrl,
                    PrimaryColor = userAuth.TenantPrimaryColor,
                    CompanyName = userAuth.TenantCompanyName,
                    HasMeetingRoom = userAuth.TenantHasMeetingRoom,
                    Status = userAuth.TenantStatus.ToString(),
                    PaymentStatus = userAuth.TenantPaymentStatus.ToString(),
                    IsLocked = userAuth.TenantIsLocked,
                    TrialStartDate = userAuth.TenantTrialStartDate,
                    SubscriptionExpiryDate = userAuth.TenantSubscriptionExpiryDate
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed with exception for Email={Email}. ExceptionType={ExceptionType}, Message={Message}",
                request.Email, ex.GetType().Name, ex.Message);
            return StatusCode(500, new
            {
                success = false,
                message = "An unexpected error occurred during login. Please try again.",
                errorCode = "AUTH_LOGIN_ERROR"
            });
        }
    }

    [HttpPost("google-login")]
    public async Task<ActionResult> GoogleLogin(GoogleLoginRequest request)
    {
        try
        {
            var payload = await _googleAuth.ValidateGoogleTokenAsync(request.IdToken);
            if (payload == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Google authentication failed. Please try again.",
                    errorCode = "AUTH_GOOGLE_INVALID_TOKEN"
                });
            }

            var email = payload.Email.Trim().ToLowerInvariant();
            var googleId = payload.Subject;

            var existingUser = await _db.Users
                .Where(u => u.Email.ToLower() == email)
                .Select(u => new
                {
                    u.Id,
                    u.IsActive,
                    u.FullName,
                    u.Email,
                    u.GoogleId,
                    Role = u.Role.ToString(),
                    TenantId = u.Tenant.Id,
                    TenantName = u.Tenant.Name,
                    TenantSubdomain = u.Tenant.Subdomain,
                    TenantLogoUrl = u.Tenant.LogoUrl,
                    TenantPrimaryColor = u.Tenant.PrimaryColor,
                    TenantCompanyName = u.Tenant.CompanyName,
                    TenantHasMeetingRoom = u.Tenant.HasMeetingRoom,
                    TenantStatus = u.Tenant.Status,
                    TenantPaymentStatus = u.Tenant.PaymentStatus,
                    TenantIsLocked = u.Tenant.IsLocked,
                    TenantTrialStartDate = u.Tenant.TrialStartDate,
                    TenantSubscriptionExpiryDate = u.Tenant.SubscriptionExpiryDate
                })
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                if (!existingUser.IsActive)
                    return Unauthorized(new { success = false, message = "Account is disabled.", errorCode = "AUTH_ACCOUNT_DISABLED" });

                if (existingUser.TenantStatus == TenantStatus.Rejected)
                    return Unauthorized(new { success = false, message = "Your workspace request has been rejected.", errorCode = "AUTH_REJECTED" });

                if (existingUser.TenantIsLocked)
                    return Unauthorized(new { success = false, message = "Your workspace has been temporarily disabled.", errorCode = "AUTH_LOCKED" });

                // Link GoogleId if this is a returning Google user or first-time Google link
                if (existingUser.GoogleId == null)
                {
                    await _db.Users
                        .Where(u => u.Id == existingUser.Id)
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(u => u.GoogleId, googleId));
                }

                var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

                var rows = await _db.Users
                    .Where(u => u.Id == existingUser.Id)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(u => u.RefreshToken, refreshToken)
                        .SetProperty(u => u.RefreshTokenExpiry, DateTime.UtcNow.AddDays(7))
                        .SetProperty(u => u.LastLoginAt, DateTime.UtcNow));

                if (rows == 0)
                {
                    _logger.LogError("Failed to persist login token fields for Google UserId={UserId}", existingUser.Id);
                    return StatusCode(500, new { success = false, message = "Login failed. Please try again.", errorCode = "AUTH_LOGIN_UPDATE_FAILED" });
                }

                var tokenString = GenerateJwtToken(
                    existingUser.Id.ToString(), existingUser.Email, existingUser.Role,
                    existingUser.FullName, existingUser.TenantId.ToString());

                return Ok(new AuthResponse
                {
                    Token = tokenString,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    User = new UserInfo { Id = existingUser.Id, Email = existingUser.Email, FullName = existingUser.FullName, Role = existingUser.Role },
                    Tenant = new TenantInfo
                    {
                        Id = existingUser.TenantId,
                        Name = existingUser.TenantName,
                        Subdomain = existingUser.TenantSubdomain,
                        LogoUrl = existingUser.TenantLogoUrl,
                        PrimaryColor = existingUser.TenantPrimaryColor,
                        CompanyName = existingUser.TenantCompanyName,
                        HasMeetingRoom = existingUser.TenantHasMeetingRoom,
                        Status = existingUser.TenantStatus.ToString(),
                        PaymentStatus = existingUser.TenantPaymentStatus.ToString(),
                        IsLocked = existingUser.TenantIsLocked,
                        TrialStartDate = existingUser.TenantTrialStartDate,
                        SubscriptionExpiryDate = existingUser.TenantSubscriptionExpiryDate
                    }
                });
            }

            // New user — generate a short-lived registration token
            var regToken = GenerateGoogleRegistrationToken(email, googleId, payload.Name);

            _logger.LogInformation("New Google user requiring completion: Email={Email}", email);

            return Ok(new GoogleLoginResponse
            {
                RequiresRegistration = true,
                RegistrationToken = regToken,
                Email = email,
                Name = payload.Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google login failed for IdToken={IdToken}", request.IdToken[..Math.Min(20, request.IdToken.Length)]);
            return StatusCode(500, new { success = false, message = "An unexpected error occurred during Google sign-in.", errorCode = "AUTH_GOOGLE_ERROR" });
        }
    }

    [HttpPost("complete-google-registration")]
    public async Task<ActionResult<AuthResponse>> CompleteGoogleRegistration(CompleteGoogleRegistrationRequest request)
    {
        try
        {
            var (email, googleId, name) = ValidateGoogleRegistrationToken(request.RegistrationToken);
            if (email == null || googleId == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid or expired registration token. Please sign in with Google again.",
                    errorCode = "AUTH_REGISTRATION_TOKEN_INVALID"
                });
            }

            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                return Conflict(new
                {
                    success = false,
                    message = "This email is already registered. Please sign in.",
                    errorCode = "AUTH_EMAIL_EXISTS"
                });
            }

            if (await _db.Tenants.AnyAsync(t => t.Subdomain == request.Subdomain))
            {
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
                _logger.LogError(ex, "Password hashing failed for Google registration Email={Email}", normalizedEmail);
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
                    Status = TenantStatus.Pending,
                    WhatsappNumber = request.WhatsappNumber,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Tenants.Add(tenant);

                var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

                var user = new User
                {
                    Email = normalizedEmail,
                    PasswordHash = passwordHash,
                    GoogleId = googleId,
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

                _logger.LogInformation("Google registration completed: UserId={UserId}, TenantId={TenantId}, Email={Email}",
                    user.Id, tenant.Id, user.Email);

                return new AuthResponse
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    User = new UserInfo { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role.ToString() },
                    Tenant = BuildTenantInfo(tenant)
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
            _logger.LogError(ex, "DB constraint during Google registration for Email={Email}", request.RegistrationToken[..Math.Min(20, request.RegistrationToken.Length)]);
            return Conflict(new { success = false, message = "A database constraint was violated.", errorCode = "AUTH_DB_CONSTRAINT" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google registration failed");
            return StatusCode(500, new { success = false, message = "An unexpected error occurred.", errorCode = "AUTH_GOOGLE_REGISTRATION_ERROR" });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshTokenRequest request)
    {
        try
        {
            var now = DateTime.UtcNow;

            var userData = await _db.Users
                .Where(u => u.RefreshToken == request.RefreshToken)
                .Select(u => new
                {
                    u.Id,
                    u.RefreshTokenExpiry,
                    u.FullName,
                    u.Email,
                    Role = u.Role.ToString(),
                    TenantId = u.Tenant.Id,
                    TenantName = u.Tenant.Name,
                    TenantSubdomain = u.Tenant.Subdomain,
                    TenantLogoUrl = u.Tenant.LogoUrl,
                    TenantPrimaryColor = u.Tenant.PrimaryColor,
                    TenantCompanyName = u.Tenant.CompanyName,
                    TenantHasMeetingRoom = u.Tenant.HasMeetingRoom,
                    TenantStatus = u.Tenant.Status,
                    TenantPaymentStatus = u.Tenant.PaymentStatus,
                    TenantIsLocked = u.Tenant.IsLocked,
                    TenantTrialStartDate = u.Tenant.TrialStartDate,
                    TenantSubscriptionExpiryDate = u.Tenant.SubscriptionExpiryDate
                })
                .FirstOrDefaultAsync();

            if (userData == null || userData.RefreshTokenExpiry <= now)
                return Unauthorized(new { success = false, message = "Invalid or expired refresh token.", errorCode = "AUTH_TOKEN_EXPIRED" });

            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            var rows = await _db.Users
                .Where(u => u.Id == userData.Id)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(u => u.RefreshToken, refreshToken)
                    .SetProperty(u => u.RefreshTokenExpiry, DateTime.UtcNow.AddDays(7)));

            if (rows == 0)
            {
                _logger.LogError("Failed to persist refresh token for UserId={UserId}", userData.Id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to refresh session. Please try again.",
                    errorCode = "AUTH_REFRESH_UPDATE_FAILED"
                });
            }

            var tokenString = GenerateJwtToken(
                userData.Id.ToString(), userData.Email, userData.Role,
                userData.FullName, userData.TenantId.ToString());

            return new AuthResponse
            {
                Token = tokenString,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserInfo { Id = userData.Id, Email = userData.Email, FullName = userData.FullName, Role = userData.Role },
                Tenant = new TenantInfo
                {
                    Id = userData.TenantId,
                    Name = userData.TenantName,
                    Subdomain = userData.TenantSubdomain,
                    LogoUrl = userData.TenantLogoUrl,
                    PrimaryColor = userData.TenantPrimaryColor,
                    CompanyName = userData.TenantCompanyName,
                    HasMeetingRoom = userData.TenantHasMeetingRoom,
                    Status = userData.TenantStatus.ToString(),
                    PaymentStatus = userData.TenantPaymentStatus.ToString(),
                    IsLocked = userData.TenantIsLocked,
                    TrialStartDate = userData.TenantTrialStartDate,
                    SubscriptionExpiryDate = userData.TenantSubscriptionExpiryDate
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
                errorCode = "AUTH_REFRESH_ERROR"
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
        var key = GetSigningKey();
        var tokenHandler = new JwtSecurityTokenHandler();
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

    private string GenerateJwtToken(string userId, string email, string role, string fullName, string tenantId)
    {
        var key = GetSigningKey();
        var tokenHandler = new JwtSecurityTokenHandler();
        var expiry = DateTime.UtcNow.AddMinutes(15);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim("TenantId", tenantId),
            new Claim("FullName", fullName)
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

    private byte[] GetSigningKey()
    {
        if (_cachedSigningKey != null)
            return _cachedSigningKey;

        lock (_keyLock)
        {
            if (_cachedSigningKey != null)
                return _cachedSigningKey;

            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 16)
            {
                _logger.LogCritical("Jwt:Key is missing or too short (minimum 16 bytes required). Auth will fail.");
                throw new InvalidOperationException("Jwt:Key is not configured or is too short.");
            }

            _cachedSigningKey = Encoding.UTF8.GetBytes(jwtKey);
            return _cachedSigningKey;
        }
    }

    private static TenantInfo BuildTenantInfo(Tenant tenant) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Subdomain = tenant.Subdomain,
        LogoUrl = tenant.LogoUrl,
        PrimaryColor = tenant.PrimaryColor,
        CompanyName = tenant.CompanyName,
        HasMeetingRoom = tenant.HasMeetingRoom,
        Status = tenant.Status.ToString(),
        PaymentStatus = tenant.PaymentStatus.ToString(),
        IsLocked = tenant.IsLocked,
        TrialStartDate = tenant.TrialStartDate,
        SubscriptionExpiryDate = tenant.SubscriptionExpiryDate
    };

    private string GenerateGoogleRegistrationToken(string email, string googleId, string name)
    {
        var key = GetSigningKey();
        var tokenHandler = new JwtSecurityTokenHandler();
        var claims = new[]
        {
            new Claim("GoogleEmail", email),
            new Claim("GoogleId", googleId),
            new Claim("GoogleName", name ?? ""),
            new Claim("Purpose", "GoogleRegistration")
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "CoworkspaceAPI",
            audience: _config["Jwt:Audience"] ?? "CoworkspaceApp",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        );
        return tokenHandler.WriteToken(token);
    }

    private (string? Email, string? GoogleId, string? Name) ValidateGoogleRegistrationToken(string token)
    {
        try
        {
            var key = GetSigningKey();
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"] ?? "CoworkspaceAPI",
                ValidAudience = _config["Jwt:Audience"] ?? "CoworkspaceApp",
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            var purpose = principal.FindFirst("Purpose")?.Value;

            if (purpose != "GoogleRegistration")
                return (null, null, null);

            var email = principal.FindFirst("GoogleEmail")?.Value;
            var googleId = principal.FindFirst("GoogleId")?.Value;
            var name = principal.FindFirst("GoogleName")?.Value;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(googleId))
                return (null, null, null);

            return (email, googleId, name ?? "");
        }
        catch
        {
            return (null, null, null);
        }
    }
}
