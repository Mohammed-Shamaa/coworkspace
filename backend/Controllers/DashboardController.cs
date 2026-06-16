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

        var result = await members
            .GroupBy(m => 1)
            .Select(g => new DashboardResponse
            {
                TotalMembers = g.Count(),
                ActiveMembers = g.Count(m => m.NoEndDate || (m.EndDate != null && m.EndDate >= now)),
                ExpiredMembers = g.Count(m => !m.NoEndDate && m.EndDate != null && m.EndDate < now),
                UnpaidMembers = g.Count(m => m.PaymentStatus == PaymentStatus.Unpaid),
                StudentCount = g.Count(m => m.MemberType == MemberType.Student),
                RemoteWorkerCount = g.Count(m => m.MemberType == MemberType.RemoteWorker),
                MonthlyIncome = g.Where(m => m.PaymentStatus == PaymentStatus.Paid).Select(m => (decimal?)m.MonthlyFee).Sum() ?? 0,
                RecentRegistrations = g.OrderByDescending(m => m.CreatedAt).Take(10)
                    .Select(m => new RecentRegistration
                    {
                        Id = m.Id,
                        FullName = m.FullName,
                        MemberType = m.MemberType.ToString(),
                        RegistrationDate = m.RegistrationDate,
                        MonthlyFee = m.MonthlyFee
                    }).ToList()
            })
            .FirstOrDefaultAsync();

        return result ?? new DashboardResponse();
    }
}
