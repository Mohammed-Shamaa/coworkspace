using System.ComponentModel.DataAnnotations;

namespace Coworkspace.API.DTOs;

public class RegisterRequest
{
    [Required] [MaxLength(100)] public string Email { get; set; } = string.Empty;
    [Required] [MinLength(6)] public string Password { get; set; } = string.Empty;
    [Required] [MaxLength(200)] public string FullName { get; set; } = string.Empty;
    [Required] [MaxLength(200)] public string CompanyName { get; set; } = string.Empty;
    [Required] [MaxLength(100)] public string Subdomain { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserInfo User { get; set; } = null!;
    public TenantInfo Tenant { get; set; } = null!;
}

public class UpdateTenantSettingsRequest
{
    [Required] [MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Required] [MaxLength(200)] public string CompanyName { get; set; } = string.Empty;
    [MaxLength(500)] public string LogoUrl { get; set; } = string.Empty;
    [MaxLength(7)] public string PrimaryColor { get; set; } = "#1565C0";
}

public class RefreshTokenRequest
{
    [Required] public string RefreshToken { get; set; } = string.Empty;
}

public class UserInfo
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class TenantInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#1565C0";
    public string CompanyName { get; set; } = string.Empty;
    public bool HasMeetingRoom { get; set; }
}
