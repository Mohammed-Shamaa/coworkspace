using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Coworkspace.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireSuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(AppDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet("pending-tenants")]
    public async Task<ActionResult> GetPendingTenants()
    {
        var tenants = await _db.Tenants
            .Where(t => t.Status == TenantStatus.Pending && t.OnboardingCompleted)
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.CompanyName,
                t.Subdomain,
                t.WhatsappNumber,
                t.Address,
                t.TotalDesks,
                t.MaxCapacity,
                t.HasMeetingRoom,
                t.OpeningTime,
                t.ClosingTime,
                t.CreatedAt,
                AdminEmail = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Email).FirstOrDefault(),
                AdminName = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.FullName).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new { success = true, data = tenants });
    }

    [HttpGet("active-workspaces")]
    public async Task<ActionResult> GetActiveWorkspaces()
    {
        var tenants = await _db.Tenants
            .Where(t => t.Status == TenantStatus.Approved)
            .OrderByDescending(t => t.ApprovalDate)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.CompanyName,
                t.Subdomain,
                t.Status,
                t.PaymentStatus,
                t.TrialStartDate,
                t.SubscriptionExpiryDate,
                t.TotalDesks,
                t.MaxCapacity,
                t.CreatedAt,
                t.ApprovalDate,
                AdminEmail = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Email).FirstOrDefault(),
                AdminName = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.FullName).FirstOrDefault(),
                MemberCount = t.Members.Count
            })
            .ToListAsync();

        return Ok(new { success = true, data = tenants });
    }

    [HttpPost("{tenantId}/approve")]
    public async Task<ActionResult> ApproveTenant(int tenantId)
    {
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return NotFound(new { success = false, message = "Tenant not found." });

        if (tenant.Status != TenantStatus.Pending)
            return BadRequest(new { success = false, message = "Tenant is not in pending status." });

        tenant.Status = TenantStatus.Approved;
        tenant.ApprovalDate = DateTime.UtcNow;
        tenant.TrialStartDate = DateTime.UtcNow;
        tenant.SubscriptionExpiryDate = DateTime.UtcNow.AddDays(30);
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Tenant {TenantId} ({Name}) approved by SuperAdmin", tenantId, tenant.Name);

        return Ok(new { success = true, message = "Tenant approved successfully." });
    }

    [HttpPost("{tenantId}/reject")]
    public async Task<ActionResult> RejectTenant(int tenantId)
    {
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return NotFound(new { success = false, message = "Tenant not found." });

        if (tenant.Status != TenantStatus.Pending)
            return BadRequest(new { success = false, message = "Tenant is not in pending status." });

        tenant.Status = TenantStatus.Rejected;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Tenant {TenantId} ({Name}) rejected by SuperAdmin", tenantId, tenant.Name);

        return Ok(new { success = true, message = "Tenant rejected." });
    }

    [HttpPost("{tenantId}/payment-status")]
    public async Task<ActionResult> UpdatePaymentStatus(int tenantId, [FromBody] UpdatePaymentStatusRequest request)
    {
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return NotFound(new { success = false, message = "Tenant not found." });

        if (!Enum.TryParse<TenantPaymentStatus>(request.PaymentStatus, true, out var newStatus))
            return BadRequest(new { success = false, message = "Invalid payment status." });

        tenant.PaymentStatus = newStatus;
        tenant.UpdatedAt = DateTime.UtcNow;

        if (newStatus == TenantPaymentStatus.Active && tenant.SubscriptionExpiryDate < DateTime.UtcNow)
        {
            tenant.SubscriptionExpiryDate = DateTime.UtcNow.AddDays(30);
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Tenant {TenantId} payment status changed to {Status}", tenantId, newStatus);

        return Ok(new { success = true, message = "Payment status updated." });
    }

    [HttpGet("payments")]
    public async Task<ActionResult> GetPayments()
    {
        var tenants = await _db.Tenants
            .Where(t => t.Status == TenantStatus.Approved)
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.CompanyName,
                t.Subdomain,
                t.PaymentStatus,
                t.TrialStartDate,
                t.SubscriptionExpiryDate,
                AdminEmail = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Email).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new { success = true, data = tenants });
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        var totalTenants = await _db.Tenants.CountAsync();
        var pendingTenants = await _db.Tenants.CountAsync(t => t.Status == TenantStatus.Pending);
        var approvedTenants = await _db.Tenants.CountAsync(t => t.Status == TenantStatus.Approved);
        var rejectedTenants = await _db.Tenants.CountAsync(t => t.Status == TenantStatus.Rejected);
        var activeSubscriptions = await _db.Tenants.CountAsync(t => t.PaymentStatus == TenantPaymentStatus.Active);
        var trialTenants = await _db.Tenants.CountAsync(t => t.PaymentStatus == TenantPaymentStatus.Trial);
        var totalMembers = await _db.Members.CountAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalTenants,
                pendingTenants,
                approvedTenants,
                rejectedTenants,
                activeSubscriptions,
                trialTenants,
                totalMembers
            }
        });
    }
}
