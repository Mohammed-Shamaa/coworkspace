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
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db) => _db = db;

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard()
    {   
        var now = DateTime.Today;
        var members = _db.Members.AsNoTracking().Where(m => m.TenantId == TenantId);

        // Individual indexed COUNT queries — each uses a covering index and avoids a single
        // massive GroupBy scan that would force a full table sort on every dashboard load.
        var totalMembers = await members.CountAsync();
        var activeMembers = await members.CountAsync(m => m.NoEndDate || (m.EndDate != null && m.EndDate >= now));
        var expiredMembers = await members.CountAsync(m => !m.NoEndDate && m.EndDate != null && m.EndDate < now);
        var unpaidMembers = await members.CountAsync(m => m.PaymentStatus == PaymentStatus.Unpaid);
        var studentCount = await members.CountAsync(m => m.MemberType == MemberType.Student);
        var remoteWorkerCount = await members.CountAsync(m => m.MemberType == MemberType.RemoteWorker);
        var monthlyIncome = await members.Where(m => m.PaymentStatus == PaymentStatus.Paid).SumAsync(m => (decimal?)m.MonthlyFee) ?? 0;

        var recent = await members
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .Select(m => new RecentRegistration
            {
                Id = m.Id,
                FullName = m.FullName,
                MemberType = m.MemberType.ToString(),
                RegistrationDate = m.RegistrationDate,
                MonthlyFee = m.MonthlyFee
            })
            .ToListAsync();

        return new DashboardResponse
        {
            TotalMembers = totalMembers,
            ActiveMembers = activeMembers,
            ExpiredMembers = expiredMembers,
            UnpaidMembers = unpaidMembers,
            StudentCount = studentCount,
            RemoteWorkerCount = remoteWorkerCount,
            MonthlyIncome = monthlyIncome,
            RecentRegistrations = recent,
        };
    }
}
