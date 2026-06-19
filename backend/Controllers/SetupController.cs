using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SetupController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    public SetupController(AppDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet("status")]
    public async Task<ActionResult<OnboardingStatusResponse>> GetStatus()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
            return Unauthorized(new { success = false, message = "Invalid token: missing TenantId claim.", errorCode = "AUTH_INVALID_TOKEN" });

        var cacheKey = $"setup_status_{tenantId}";
        if (_cache.TryGetValue(cacheKey, out OnboardingStatusResponse? cached))
            return cached!;

        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return BadRequest(new { success = false, message = "Tenant not found for this account. Please re-register.", errorCode = "SETUP_TENANT_NOT_FOUND" });

        var result = new OnboardingStatusResponse { OnboardingCompleted = tenant.OnboardingCompleted };
        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    [HttpGet("info")]
    public async Task<ActionResult<OnboardingInfoResponse>> GetInfo()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
            return Unauthorized(new { success = false, message = "Invalid token: missing TenantId claim.", errorCode = "AUTH_INVALID_TOKEN" });

        var cacheKey = $"setup_info_{tenantId}";
        if (_cache.TryGetValue(cacheKey, out OnboardingInfoResponse? cached))
            return cached!;

        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return BadRequest(new { success = false, message = "Tenant not found for this account. Please re-register.", errorCode = "SETUP_TENANT_NOT_FOUND" });

        var result = new OnboardingInfoResponse
        {
            OnboardingCompleted = tenant.OnboardingCompleted,
            TotalDesks = tenant.TotalDesks,
            MaxCapacity = tenant.MaxCapacity,
            HasMeetingRoom = tenant.HasMeetingRoom,
            Address = tenant.Address,
            OpeningTime = tenant.OpeningTime?.ToString(@"hh\:mm"),
            ClosingTime = tenant.ClosingTime?.ToString(@"hh\:mm")
        };
        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    [HttpPost("workspace-info")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> SaveWorkspaceInfo(WorkspaceInfoRequest request)
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        tenant.TotalDesks = request.TotalDesks;
        tenant.MaxCapacity = request.MaxCapacity;
        tenant.HasMeetingRoom = request.HasMeetingRoom;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        InvalidateSetupCache(tenantId);
        return Ok();
    }

    [HttpPost("address")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> SaveAddress(WorkspaceAddressRequest request)
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        tenant.Address = request.Address;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        InvalidateSetupCache(tenantId);
        return Ok();
    }

    [HttpPost("working-hours")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> SaveWorkingHours(WorkingHoursRequest request)
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        if (!TimeSpan.TryParse(request.OpeningTime, out var openingTime))
            return BadRequest(new { message = "Invalid opening time format. Use HH:mm (e.g., 07:00)." });

        if (!TimeSpan.TryParse(request.ClosingTime, out var closingTime))
            return BadRequest(new { message = "Invalid closing time format. Use HH:mm (e.g., 22:00)." });

        if (openingTime >= closingTime)
            return BadRequest(new { message = "Opening time must be before closing time." });

        tenant.OpeningTime = openingTime;
        tenant.ClosingTime = closingTime;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        InvalidateSetupCache(tenantId);
        return Ok();
    }

    [HttpPost("complete")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CompleteOnboarding()
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        tenant.OnboardingCompleted = true;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        InvalidateSetupCache(tenantId);
        return Ok();
    }

    private void InvalidateSetupCache(int tenantId)
    {
        _cache.Remove($"setup_status_{tenantId}");
        _cache.Remove($"setup_info_{tenantId}");
    }
}
