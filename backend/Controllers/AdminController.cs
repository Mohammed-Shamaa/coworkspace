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
[Route("api/admin")]
[Authorize(Roles = "SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuditService _audit;
    private readonly ILogger<AdminController> _logger;

    public AdminController(AppDbContext db, AuditService audit, ILogger<AdminController> logger)
    {
        _db = db;
        _audit = audit;
        _logger = logger;
    }

    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    private string CurrentUserName => User.FindFirst("FullName")?.Value ?? "Unknown";
    private string RemoteIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> GetDashboard()
    {
        var tenants = _db.Tenants.AsNoTracking();

        var total = await tenants.CountAsync();
        var pending = await tenants.CountAsync(t => t.Status == TenantStatus.Pending);
        var approved = await tenants.CountAsync(t => t.Status == TenantStatus.Approved);
        var rejected = await tenants.CountAsync(t => t.Status == TenantStatus.Rejected);
        var suspended = await tenants.CountAsync(t => t.Status == TenantStatus.Suspended);
        var active = await tenants.CountAsync(t => t.Status == TenantStatus.Approved && t.IsActive);
        var paid = await tenants.CountAsync(t => t.Status == TenantStatus.Approved && t.PaymentStatus == "Paid");
        var unpaid = await tenants.CountAsync(t => t.Status == TenantStatus.Approved && (t.PaymentStatus == null || t.PaymentStatus == "Unpaid"));

        var totalDecided = approved + rejected;
        var approvalRate = totalDecided > 0 ? Math.Round((double)approved / totalDecided * 100, 1) : 0;

        var monthlyGrowth = await tenants
            .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
            .Select(g => new MonthlyGrowthItem
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                Count = g.Count()
            })
            .OrderBy(m => m.Month)
            .ToListAsync();

        var companiesByCountry = await tenants
            .Where(t => t.Country != null && t.Country != "")
            .GroupBy(t => t.Country!)
            .Select(g => new CountryDistributionItem
            {
                Country = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(c => c.Count)
            .ToListAsync();

        var companiesByCity = await tenants
            .Where(t => t.City != null && t.City != "")
            .GroupBy(t => t.City!)
            .Select(g => new CityDistributionItem
            {
                City = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(c => c.Count)
            .Take(10)
            .ToListAsync();

        var workspaceDistribution = (await tenants
            .Where(t => t.Status == TenantStatus.Approved && t.WorkspaceCapacity != null)
            .Select(t => t.WorkspaceCapacity)
            .ToListAsync())
            .GroupBy(c => c <= 10 ? "1-10" : c <= 25 ? "11-25" : c <= 50 ? "26-50" : c <= 100 ? "51-100" : "100+")
            .Select(g => new WorkspaceDistributionItem
            {
                Range = g.Key,
                Count = g.Count()
            })
            .OrderBy(w => w.Range)
            .ToList();

        var registrationTrends = await tenants
            .Where(t => t.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            .GroupBy(t => t.CreatedAt.Date)
            .Select(g => new RegistrationTrendItem
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Count = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToListAsync();

        return new AdminDashboardResponse
        {
            TotalCompanies = total,
            PendingRequests = pending,
            ApprovedCompanies = approved,
            RejectedCompanies = rejected,
            SuspendedCompanies = suspended,
            ActiveCompanies = active,
            PaidCompanies = paid,
            UnpaidCompanies = unpaid,
            ApprovalRate = approvalRate,
            MonthlyGrowth = monthlyGrowth,
            CompaniesByCountry = companiesByCountry,
            CompaniesByCity = companiesByCity,
            WorkspaceDistribution = workspaceDistribution,
            RegistrationTrends = registrationTrends
        };
    }

    [HttpGet("companies/pending")]
    public async Task<ActionResult<List<CompanyListItem>>> GetPendingCompanies()
    {
        return await GetCompaniesByStatus(TenantStatus.Pending);
    }

    [HttpGet("companies/approved")]
    public async Task<ActionResult<List<CompanyListItem>>> GetApprovedCompanies()
    {
        return await GetCompaniesByStatus(TenantStatus.Approved);
    }

    [HttpGet("companies/rejected")]
    public async Task<ActionResult<List<CompanyListItem>>> GetRejectedCompanies()
    {
        return await GetCompaniesByStatus(TenantStatus.Rejected);
    }

    private async Task<List<CompanyListItem>> GetCompaniesByStatus(TenantStatus status)
    {
        return await _db.Tenants
            .AsNoTracking()
            .Where(t => t.Status == status)
            .Select(t => new CompanyListItem
            {
                Id = t.Id,
                CompanyName = t.CompanyName,
                OwnerName = t.OwnerName,
                Email = t.Email,
                Phone = t.PhoneNumber,
                Country = t.Country,
                City = t.City,
                WorkspaceCapacity = t.WorkspaceCapacity,
                MeetingRooms = t.NumberOfMeetingRooms,
                Desks = t.NumberOfDesks,
                Offices = t.NumberOfOffices,
                CreatedAt = t.CreatedAt,
                Status = t.Status.ToString(),
                ApprovalDate = t.ApprovalDate,
                ApprovedByName = t.ApprovedByUser != null ? t.ApprovedByUser.FullName : null
            })
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("companies/{id}")]
    public async Task<ActionResult<CompanyDetailResponse>> GetCompanyDetail(int id)
    {
        var tenant = await _db.Tenants
            .AsNoTracking()
            .Include(t => t.Users)
            .Include(t => t.Members)
            .Include(t => t.ApprovedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant == null) return NotFound(new { message = "Company not found." });

        return new CompanyDetailResponse
        {
            Id = tenant.Id,
            CompanyName = tenant.CompanyName,
            Subdomain = tenant.Subdomain,
            OwnerName = tenant.OwnerName,
            Email = tenant.Users.Select(u => u.Email).FirstOrDefault(),
            PhoneNumber = tenant.PhoneNumber,
            Country = tenant.Country,
            City = tenant.City,
            FullAddress = tenant.FullAddress,
            Latitude = tenant.Latitude,
            Longitude = tenant.Longitude,
            WorkspaceCapacity = tenant.WorkspaceCapacity,
            NumberOfOffices = tenant.NumberOfOffices,
            NumberOfMeetingRooms = tenant.NumberOfMeetingRooms,
            NumberOfDesks = tenant.NumberOfDesks,
            WorkspaceDescription = tenant.WorkspaceDescription,
            Status = tenant.Status.ToString(),
            CreatedAt = tenant.CreatedAt,
            ApprovalDate = tenant.ApprovalDate,
            ApprovedByName = tenant.ApprovedByUser?.FullName,
            RejectionReason = tenant.RejectionReason,
            SubscriptionPlan = tenant.SubscriptionPlan,
            LastPaymentDate = tenant.LastPaymentDate,
            NextDueDate = tenant.NextDueDate,
            UpdatedAt = tenant.UpdatedAt,
            UserCount = tenant.Users.Count,
            MemberCount = tenant.Members.Count
        };
    }

    [HttpPost("companies/{id}/approve")]
    public async Task<IActionResult> ApproveCompany(int id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Company not found." });
        if (tenant.Status != TenantStatus.Pending)
            return BadRequest(new { message = $"Company is already {tenant.Status}. Only pending companies can be approved." });

        tenant.Status = TenantStatus.Approved;
        tenant.IsActive = true;
        tenant.ApprovalDate = DateTime.UtcNow;
        tenant.ApprovedByUserId = CurrentUserId;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync(tenant.Id, CurrentUserId, "Approve", "Tenant", tenant.Id,
            $"Admin '{CurrentUserName}' approved company '{tenant.CompanyName}'", RemoteIp);

        _logger.LogInformation("Company {CompanyName} (ID={TenantId}) approved by Admin ID={AdminId}", tenant.CompanyName, tenant.Id, CurrentUserId);
        return Ok(new { message = "Company approved successfully." });
    }

    [HttpPost("companies/{id}/reject")]
    public async Task<IActionResult> RejectCompany(int id, [FromBody] RejectCompanyRequest? request)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Company not found." });
        if (tenant.Status != TenantStatus.Pending)
            return BadRequest(new { message = $"Company is already {tenant.Status}. Only pending companies can be rejected." });

        tenant.Status = TenantStatus.Rejected;
        tenant.IsActive = false;
        tenant.RejectionReason = request?.Reason;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync(tenant.Id, CurrentUserId, "Reject", "Tenant", tenant.Id,
            $"Admin '{CurrentUserName}' rejected company '{tenant.CompanyName}'. Reason: {request?.Reason ?? "N/A"}", RemoteIp);

        _logger.LogInformation("Company {CompanyName} (ID={TenantId}) rejected by Admin ID={AdminId}", tenant.CompanyName, tenant.Id, CurrentUserId);
        return Ok(new { message = "Company rejected." });
    }

    [HttpPost("companies/{id}/suspend")]
    public async Task<IActionResult> SuspendCompany(int id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Company not found." });
        if (tenant.Status != TenantStatus.Approved)
            return BadRequest(new { message = "Only approved companies can be suspended." });

        var prev = tenant.Status;
        tenant.Status = TenantStatus.Suspended;
        tenant.IsActive = false;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync(tenant.Id, CurrentUserId, "Suspend", "Tenant", tenant.Id,
            $"Admin '{CurrentUserName}' suspended company '{tenant.CompanyName}'. Previous status: {prev}", RemoteIp);

        return Ok(new { message = "Company suspended." });
    }

    [HttpPost("companies/{id}/activate")]
    public async Task<IActionResult> ActivateCompany(int id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Company not found." });

        tenant.Status = TenantStatus.Approved;
        tenant.IsActive = true;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync(tenant.Id, CurrentUserId, "Activate", "Tenant", tenant.Id,
            $"Admin '{CurrentUserName}' activated company '{tenant.CompanyName}'", RemoteIp);

        return Ok(new { message = "Company activated." });
    }

    [HttpPut("companies/{id}")]
    public async Task<IActionResult> EditCompany(int id, [FromBody] EditCompanyRequest request)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Company not found." });

        var changes = new System.Text.StringBuilder();

        if (request.CompanyName != null) { changes.Append($"CompanyName: '{tenant.CompanyName}' → '{request.CompanyName}'; "); tenant.CompanyName = request.CompanyName; tenant.Name = request.CompanyName; }
        if (request.OwnerName != null) { changes.Append($"OwnerName: '{tenant.OwnerName}' → '{request.OwnerName}'; "); tenant.OwnerName = request.OwnerName; }
        if (request.PhoneNumber != null) { changes.Append($"Phone: '{tenant.PhoneNumber}' → '{request.PhoneNumber}'; "); tenant.PhoneNumber = request.PhoneNumber; }
        if (request.Country != null) { changes.Append($"Country: '{tenant.Country}' → '{request.Country}'; "); tenant.Country = request.Country; }
        if (request.City != null) { changes.Append($"City: '{tenant.City}' → '{request.City}'; "); tenant.City = request.City; }
        if (request.FullAddress != null) { changes.Append($"Address changed; "); tenant.FullAddress = request.FullAddress; }
        if (request.Latitude != null) { tenant.Latitude = request.Latitude; }
        if (request.Longitude != null) { tenant.Longitude = request.Longitude; }
        if (request.WorkspaceCapacity != null) { changes.Append($"Capacity: {tenant.WorkspaceCapacity} → {request.WorkspaceCapacity}; "); tenant.WorkspaceCapacity = request.WorkspaceCapacity; }
        if (request.NumberOfOffices != null) { changes.Append($"Offices: {tenant.NumberOfOffices} → {request.NumberOfOffices}; "); tenant.NumberOfOffices = request.NumberOfOffices; }
        if (request.NumberOfMeetingRooms != null) { changes.Append($"Meeting rooms: {tenant.NumberOfMeetingRooms} → {request.NumberOfMeetingRooms}; "); tenant.NumberOfMeetingRooms = request.NumberOfMeetingRooms; }
        if (request.NumberOfDesks != null) { changes.Append($"Desks: {tenant.NumberOfDesks} → {request.NumberOfDesks}; "); tenant.NumberOfDesks = request.NumberOfDesks; }
        if (request.WorkspaceDescription != null) { tenant.WorkspaceDescription = request.WorkspaceDescription; }
        if (request.SubscriptionPlan != null) { changes.Append($"Plan: '{tenant.SubscriptionPlan}' → '{request.SubscriptionPlan}'; "); tenant.SubscriptionPlan = request.SubscriptionPlan; }

        tenant.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        if (changes.Length > 0)
        {
            await _audit.LogAsync(tenant.Id, CurrentUserId, "Edit", "Tenant", tenant.Id,
                $"Admin '{CurrentUserName}' edited company '{tenant.CompanyName}': {changes}", RemoteIp);
        }

        return Ok(new { message = "Company updated." });
    }

    [HttpDelete("companies/{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var tenant = await _db.Tenants
            .Include(t => t.Users)
            .Include(t => t.Members)
            .ThenInclude(m => m.Payments)
            .Include(t => t.MeetingRoomReservations)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant == null) return NotFound(new { message = "Company not found." });

        var companyName = tenant.CompanyName;
        _db.MeetingRoomReservations.RemoveRange(tenant.MeetingRoomReservations);
        _db.Payments.RemoveRange(tenant.Members.SelectMany(m => m.Payments));
        _db.Members.RemoveRange(tenant.Members);
        _db.Users.RemoveRange(tenant.Users);
        _db.Tenants.Remove(tenant);

        await _db.SaveChangesAsync();

        await _audit.LogAsync(0, CurrentUserId, "Delete", "Tenant", id,
            $"Admin '{CurrentUserName}' deleted company '{companyName}' (ID={id})", RemoteIp);

        _logger.LogInformation("Company {CompanyName} (ID={TenantId}) deleted by Admin ID={AdminId}", companyName, id, CurrentUserId);
        return Ok(new { message = "Company deleted permanently." });
    }

    [HttpGet("payments")]
    public async Task<ActionResult<List<CompanyListItem>>> GetPayments()
    {
        return await _db.Tenants
            .AsNoTracking()
            .Where(t => t.Status == TenantStatus.Approved)
            .Select(t => new CompanyListItem
            {
                Id = t.Id,
                CompanyName = t.CompanyName,
                OwnerName = t.OwnerName,
                Email = t.Email,
                Phone = t.PhoneNumber,
                Country = t.Country,
                City = t.City,
                WorkspaceCapacity = t.WorkspaceCapacity,
                MeetingRooms = t.NumberOfMeetingRooms,
                Desks = t.NumberOfDesks,
                Offices = t.NumberOfOffices,
                CreatedAt = t.CreatedAt,
                Status = t.Status.ToString(),
                PaymentStatus = t.PaymentStatus,
                ApprovalDate = t.ApprovalDate,
                ApprovedByName = t.ApprovedByUser != null ? t.ApprovedByUser.FullName : null
            })
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    [HttpPut("payments/{id}/status")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusRequest request)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == id && t.Status == TenantStatus.Approved);
        if (tenant == null) return NotFound(new { message = "Approved company not found." });

        var oldStatus = tenant.PaymentStatus;
        tenant.PaymentStatus = request.PaymentStatus;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync(0, CurrentUserId, "PaymentUpdate", "Tenant", id,
            $"Admin '{CurrentUserName}' updated payment status of '{tenant.CompanyName}': {oldStatus} → {request.PaymentStatus}", RemoteIp);

        return Ok(new { message = "Payment status updated." });
    }

    [HttpGet("audit-logs")]
    public async Task<ActionResult<PagedResult<AuditLogItem>>> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;
        if (pageSize > 200) pageSize = 200;

        var query = _db.AuditLogs
            .Include(a => a.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Details.Contains(search) || a.EntityType.Contains(search));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogItem
            {
                Id = a.Id,
                AdminName = a.User != null ? a.User.FullName : "System",
                Action = a.Action,
                EntityType = a.EntityType,
                TargetEntity = a.Details,
                Timestamp = a.CreatedAt,
                Details = a.Details,
                IpAddress = a.IpAddress
            })
            .ToListAsync();

        return new PagedResult<AuditLogItem>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    [HttpGet("audit-logs/actions")]
    public async Task<ActionResult<List<string>>> GetAuditLogActions()
    {
        var actions = await _db.AuditLogs
            .Select(a => a.Action)
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync();
        return actions;
    }
}
