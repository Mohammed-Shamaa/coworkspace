using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Coworkspace.API.Models;
using Coworkspace.API.Services;
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
    private readonly PdfService _pdfService;
    private readonly EmailService _emailService;
    private readonly NotificationService _notificationService;
    private readonly IServiceScopeFactory _scopeFactory;

    public AdminController(AppDbContext db, ILogger<AdminController> logger, PdfService pdfService, EmailService emailService, NotificationService notificationService, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _logger = logger;
        _pdfService = pdfService;
        _emailService = emailService;
        _notificationService = notificationService;
        _scopeFactory = scopeFactory;
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
                t.WhatsappNumber,
                t.Status,
                t.PaymentStatus,
                t.TrialStartDate,
                t.SubscriptionExpiryDate,
                t.TotalDesks,
                t.MaxCapacity,
                t.HasMeetingRoom,
                t.Address,
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
        var tenant = await _db.Tenants
            .Include(t => t.Users)
            .FirstOrDefaultAsync(t => t.Id == tenantId);

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

        // Notify tenant admins
        await _notificationService.CreateForTenantAdminsAsync(
            tenantId,
            "Workspace Approved",
            $"Your workspace \"{tenant.CompanyName}\" has been approved! You can now log in and start managing your space.",
            "workspace_approved");

        // Fire-and-forget approval email — never blocks the HTTP response
        var adminUser = tenant.Users.FirstOrDefault(u => u.Role == UserRole.Admin);
        if (adminUser != null)
        {
            var email = adminUser.Email;
            var name = adminUser.FullName;
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var emailSvc = scope.ServiceProvider.GetRequiredService<EmailService>();
                    await emailSvc.SendApprovalEmailAsync(email, name);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Fire-and-forget approval email to {Email} failed", email);
                }
            });
        }

        return Ok(new
        {
            success = true,
            message = "Tenant approved successfully."
        });
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

    [HttpGet("workspaces/search")]
    public async Task<ActionResult> SearchWorkspaces([FromQuery] string q = "")
    {
        var query = _db.Tenants
            .Where(t => t.Status == TenantStatus.Approved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(search) ||
                t.CompanyName.ToLower().Contains(search) ||
                t.Subdomain.ToLower().Contains(search) ||
                t.WhatsappNumber.Contains(search) ||
                t.Users.Any(u => u.Role == UserRole.Admin && (
                    u.Email.ToLower().Contains(search) ||
                    u.FullName.ToLower().Contains(search)
                ))
            );
        }

        var results = await query
            .OrderByDescending(t => t.ApprovalDate)
            .Select(t => new AdminWorkspaceSearchResult
            {
                Id = t.Id,
                Name = t.Name,
                CompanyName = t.CompanyName,
                Subdomain = t.Subdomain,
                Status = t.Status.ToString(),
                PaymentStatus = t.PaymentStatus.ToString(),
                AdminEmail = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Email).FirstOrDefault() ?? "",
                AdminName = t.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.FullName).FirstOrDefault() ?? "",
                TrialStartDate = t.TrialStartDate,
                SubscriptionExpiryDate = t.SubscriptionExpiryDate,
                MemberCount = t.Members.Count
            })
            .ToListAsync();

        return Ok(new { success = true, data = results });
    }

    [HttpGet("workspaces/{tenantId}/detail")]
    public async Task<ActionResult> GetWorkspaceDetail(int tenantId)
    {
        var tenant = await _db.Tenants
            .Include(t => t.Users)
            .Include(t => t.Members)
            .Include(t => t.MeetingRoomReservations)
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.Status == TenantStatus.Approved);

        if (tenant == null)
            return NotFound(new { success = false, message = "Workspace not found." });

        var admin = tenant.Users.FirstOrDefault(u => u.Role == UserRole.Admin);

        var detail = new AdminWorkspaceDetail
        {
            Id = tenant.Id,
            Name = tenant.Name,
            CompanyName = tenant.CompanyName,
            Subdomain = tenant.Subdomain,
            WhatsappNumber = tenant.WhatsappNumber,
            Address = tenant.Address,
            TotalDesks = tenant.TotalDesks,
            MaxCapacity = tenant.MaxCapacity,
            HasMeetingRoom = tenant.HasMeetingRoom,
            OpeningTime = tenant.OpeningTime,
            ClosingTime = tenant.ClosingTime,
            Status = tenant.Status.ToString(),
            PaymentStatus = tenant.PaymentStatus.ToString(),
            TrialStartDate = tenant.TrialStartDate,
            SubscriptionExpiryDate = tenant.SubscriptionExpiryDate,
            ApprovalDate = tenant.ApprovalDate,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt,
            AdminEmail = admin?.Email ?? "",
            AdminName = admin?.FullName ?? "",
            MemberCount = tenant.Members.Count,
            MeetingRoomReservationCount = tenant.MeetingRoomReservations.Count,
            RecentMembers = tenant.Members
                .OrderByDescending(m => m.CreatedAt)
                .Take(5)
                .Select(m => new AdminMemberSummary
                {
                    Id = m.Id,
                    FullName = m.FullName,
                    PhoneNumber = m.PhoneNumber,
                    MemberType = m.MemberType.ToString(),
                    PaymentStatus = m.PaymentStatus.ToString(),
                    RegistrationDate = m.RegistrationDate
                })
                .ToList()
        };

        return Ok(new { success = true, data = detail });
    }

    [HttpGet("notifications")]
    public async Task<ActionResult> GetNotifications()
    {
        var now = DateTime.UtcNow;
        var notifications = new List<AdminNotification>();

        var approvedTenants = await _db.Tenants
            .Where(t => t.Status == TenantStatus.Approved)
            .Select(t => new { t.Id, t.Name, t.PaymentStatus, t.TrialStartDate, t.SubscriptionExpiryDate })
            .ToListAsync();

        foreach (var t in approvedTenants)
        {
            if (t.TrialStartDate.HasValue && t.PaymentStatus == TenantPaymentStatus.Trial)
            {
                var trialEnd = t.TrialStartDate.Value.AddDays(30);
                if (trialEnd <= now)
                {
                    notifications.Add(new AdminNotification
                    {
                        Type = "trial_ended",
                        Message = $"Trial period ended for {t.Name}",
                        TenantId = t.Id,
                        TenantName = t.Name,
                        OccuredAt = trialEnd
                    });
                }
            }

            if (t.SubscriptionExpiryDate.HasValue && t.SubscriptionExpiryDate.Value <= now)
            {
                notifications.Add(new AdminNotification
                {
                    Type = "subscription_expired",
                    Message = $"Subscription expired for {t.Name}",
                    TenantId = t.Id,
                    TenantName = t.Name,
                    OccuredAt = t.SubscriptionExpiryDate.Value
                });
            }

            if (t.PaymentStatus == TenantPaymentStatus.Expired || t.PaymentStatus == TenantPaymentStatus.Suspended)
            {
                notifications.Add(new AdminNotification
                {
                    Type = "payment_needed",
                    Message = $"Payment action needed for {t.Name}",
                    TenantId = t.Id,
                    TenantName = t.Name,
                    OccuredAt = now
                });
            }
        }

        var ordered = notifications
            .OrderByDescending(n => n.OccuredAt)
            .ToList();

        return Ok(new { success = true, data = new AdminNotificationsResponse { Notifications = ordered, TotalCount = ordered.Count } });
    }

    [HttpGet("workspaces/{tenantId}/pdf")]
    public async Task<ActionResult> ExportWorkspacePdf(int tenantId)
    {
        var tenant = await _db.Tenants
            .Include(t => t.Users)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.Status == TenantStatus.Approved);

        if (tenant == null)
            return NotFound(new { success = false, message = "Workspace not found." });

        var admin = tenant.Users.FirstOrDefault(u => u.Role == UserRole.Admin);

        var pdfBytes = _pdfService.GenerateWorkspaceReport(
            tenant,
            admin?.FullName ?? "N/A",
            admin?.Email ?? "N/A",
            tenant.Members.ToList()
        );

        return File(pdfBytes, "application/pdf", $"workspace_{tenant.Subdomain}_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }
}
