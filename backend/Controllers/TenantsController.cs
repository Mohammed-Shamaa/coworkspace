using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TenantsController(AppDbContext db) => _db = db;

    [HttpGet("settings")]
    public async Task<ActionResult<TenantInfo>> GetSettings()
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
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

    [HttpPut("settings")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TenantInfo>> UpdateSettings(UpdateTenantSettingsRequest request)
    {
        var tenantId = int.Parse(User.FindFirst("TenantId")?.Value ?? "0");
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
