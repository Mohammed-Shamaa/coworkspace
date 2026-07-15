using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private static readonly string[] AllowedImageTypes = { ".jpg", ".jpeg", ".png", ".webp" };
    private const int MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public TenantsController(AppDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet("settings")]
    public async Task<ActionResult<TenantInfo>> GetSettings()
    {
        if (!int.TryParse(User.FindFirst("TenantId")?.Value, out var tenantId))
            return Unauthorized(new { message = "Invalid tenant in token." });
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        return new TenantInfo
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Subdomain = tenant.Subdomain,
            LogoUrl = tenant.LogoUrl,
            PrimaryColor = tenant.PrimaryColor,
            CompanyName = tenant.CompanyName
        };
    }

    [HttpPost("logo")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LogoUploadResponse>> UploadLogo(IFormFile file)
    {
        if (!int.TryParse(User.FindFirst("TenantId")?.Value, out var tenantId))
            return Unauthorized(new { message = "Invalid tenant in token." });

        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > MaxFileSize)
            return BadRequest(new { message = "File size must be under 5 MB." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageTypes.Contains(ext))
            return BadRequest(new { message = "Only JPG, PNG, and WebP images are allowed." });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "logos");
        Directory.CreateDirectory(uploadsDir);

        // Delete old logo if it exists
        if (!string.IsNullOrEmpty(tenant.LogoUrl))
        {
            var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", tenant.LogoUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        var fileName = $"tenant-{tenantId}-{DateTime.UtcNow:yyyyMMddHHmmss}-{RandomNumberGenerator.GetInt32(100000):D6}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var logoUrl = $"/uploads/logos/{fileName}";
        tenant.LogoUrl = logoUrl;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        InvalidateTenantCache(tenantId);

        return Ok(new LogoUploadResponse { LogoUrl = logoUrl });
    }

    [HttpDelete("logo")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteLogo()
    {
        if (!int.TryParse(User.FindFirst("TenantId")?.Value, out var tenantId))
            return Unauthorized(new { message = "Invalid tenant in token." });

        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        if (string.IsNullOrEmpty(tenant.LogoUrl))
            return Ok(new { success = true, message = "No logo to delete." });

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", tenant.LogoUrl.TrimStart('/'));
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        tenant.LogoUrl = string.Empty;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        InvalidateTenantCache(tenantId);

        return Ok(new { success = true, message = "Logo deleted." });
    }

    private void InvalidateTenantCache(int tenantId)
    {
        _cache.Remove($"tenant_settings_{tenantId}");
    }

    [HttpPut("settings")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TenantInfo>> UpdateSettings(UpdateTenantSettingsRequest request)
    {
        if (!int.TryParse(User.FindFirst("TenantId")?.Value, out var tenantId))
            return Unauthorized(new { message = "Invalid tenant in token." });
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        tenant.Name = request.Name;
        tenant.CompanyName = request.CompanyName;
        tenant.LogoUrl = request.LogoUrl;
        tenant.PrimaryColor = request.PrimaryColor;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new TenantInfo
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Subdomain = tenant.Subdomain,
            LogoUrl = tenant.LogoUrl,
            PrimaryColor = tenant.PrimaryColor,
            CompanyName = tenant.CompanyName
        };
    }
}
