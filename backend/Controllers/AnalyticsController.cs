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
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db) => _db = db;

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));

    [HttpGet]
    public async Task<ActionResult<AnalyticsOverviewResponse>> GetAnalytics([FromQuery] string period = "30d")
    {
        var today = DateTime.UtcNow.Date;
        var (startDate, previousStartDate) = GetDateRange(period, today);

        var memberAgg = await _db.Members.AsNoTracking()
            .Where(m => m.TenantId == TenantId)
            .GroupBy(m => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Active = g.Count(m => m.NoEndDate || (m.EndDate != null && m.EndDate >= today)),
                Expired = g.Count(m => !m.NoEndDate && m.EndDate != null && m.EndDate < today),
                Unpaid = g.Count(m => m.PaymentStatus == PaymentStatus.Unpaid),
                Students = g.Count(m => m.MemberType == MemberType.Student),
                Workers = g.Count(m => m.MemberType == MemberType.RemoteWorker),
                MonthlyIncome = g.Where(m => m.PaymentStatus == PaymentStatus.Paid).Select(m => (decimal?)m.MonthlyFee).Sum() ?? 0,
                OccupiedDesks = g.Count(m => !string.IsNullOrEmpty(m.DeskNumber) && m.DeskNumber != "-"
                    && (m.NoEndDate || (m.EndDate != null && m.EndDate >= today)))
            })
            .FirstOrDefaultAsync();

        var totalRevenue = await _db.Payments.AsNoTracking()
            .Where(p => p.TenantId == TenantId && p.Status == "Paid")
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var tenant = await _db.Tenants.AsNoTracking()
            .Where(t => t.Id == TenantId)
            .Select(t => new { t.TotalDesks, t.HasMeetingRoom })
            .FirstOrDefaultAsync();

        var totalBookings = await _db.MeetingRoomReservations.AsNoTracking()
            .Where(r => r.TenantId == TenantId)
            .CountAsync();

        var membersCurrent = await _db.Members.AsNoTracking()
            .CountAsync(m => m.TenantId == TenantId && m.RegistrationDate >= startDate);
        var membersPrevious = await _db.Members.AsNoTracking()
            .CountAsync(m => m.TenantId == TenantId && m.RegistrationDate >= previousStartDate && m.RegistrationDate < startDate);

        var revenueCurrent = await _db.Payments.AsNoTracking()
            .Where(p => p.TenantId == TenantId && p.Status == "Paid" && p.PaymentDate >= startDate)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;
        var revenuePrevious = await _db.Payments.AsNoTracking()
            .Where(p => p.TenantId == TenantId && p.Status == "Paid" && p.PaymentDate >= previousStartDate && p.PaymentDate < startDate)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var bookingsCurrent = await _db.MeetingRoomReservations.AsNoTracking()
            .CountAsync(r => r.TenantId == TenantId && r.CreatedAt >= startDate);
        var bookingsPrevious = await _db.MeetingRoomReservations.AsNoTracking()
            .CountAsync(r => r.TenantId == TenantId && r.CreatedAt >= previousStartDate && r.CreatedAt < startDate);

        var revenueHistory = await _db.Payments.AsNoTracking()
            .Where(p => p.TenantId == TenantId && p.Status == "Paid" && p.PaymentDate >= startDate)
            .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
            .Select(g => new AnalyticsRevenuePoint
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                Revenue = g.Sum(p => p.Amount)
            })
            .OrderBy(r => r.Month)
            .ToListAsync();

        var memberGrowth = await _db.Members.AsNoTracking()
            .Where(m => m.TenantId == TenantId && m.RegistrationDate >= startDate)
            .GroupBy(m => new { m.RegistrationDate.Year, m.RegistrationDate.Month })
            .Select(g => new AnalyticsMemberGrowthPoint
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                NewMembers = g.Count()
            })
            .OrderBy(r => r.Month)
            .ToListAsync();

        var totalMembers = memberAgg?.Total ?? 0;
        var paidCount = totalMembers - (memberAgg?.Unpaid ?? 0);

        var totalDesks = tenant?.TotalDesks ?? 0;
        var occupiedDesks = memberAgg?.OccupiedDesks ?? 0;

        var hasDeskData = totalDesks > 0;

        var subscriptionsData = await _db.Members.AsNoTracking()
            .Where(m => m.TenantId == TenantId)
            .GroupBy(m => m.AttendancePlan)
            .Select(g => new AnalyticsSubscriptionPoint
            {
                Plan = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();
        var totalForPct = subscriptionsData.Sum(s => s.Count);
        foreach (var s in subscriptionsData)
            s.Percentage = totalForPct > 0 ? Math.Round((double)s.Count / totalForPct * 100, 1) : 0;

        var meetingRoomDaily = await _db.MeetingRoomReservations.AsNoTracking()
            .Where(r => r.TenantId == TenantId && r.ReservationDate >= startDate)
            .GroupBy(r => r.ReservationDate.Date)
            .Select(g => new { Date = g.Key, Bookings = g.Count() })
            .ToListAsync();

        var dayOrder = new[] { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
        var meetingRoomUsage = meetingRoomDaily
            .GroupBy(x => (int)x.Date.DayOfWeek)
            .Select(g => new AnalyticsMeetingRoomPoint
            {
                Day = dayOrder[g.Key],
                Bookings = g.Sum(x => x.Bookings)
            })
            .OrderBy(r => Array.IndexOf(dayOrder, r.Day))
            .ToList();

        var newMembersByMonth = await _db.Members.AsNoTracking()
            .Where(m => m.TenantId == TenantId && m.RegistrationDate >= startDate)
            .GroupBy(m => new { m.RegistrationDate.Year, m.RegistrationDate.Month })
            .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var expiredMembersByMonth = await _db.Members.AsNoTracking()
            .Where(m => m.TenantId == TenantId && !m.NoEndDate && m.EndDate != null && m.EndDate >= startDate)
            .GroupBy(m => new { m.EndDate!.Value.Year, m.EndDate!.Value.Month })
            .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var allMonths = newMembersByMonth.Select(n => (n.Year, n.Month))
            .Union(expiredMembersByMonth.Select(e => (e.Year, e.Month)))
            .Distinct()
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToList();

        var memberActivity = allMonths.Select(m => new AnalyticsMemberActivityPoint
        {
            Month = m.Year + "-" + m.Month.ToString("D2"),
            NewMembers = newMembersByMonth.FirstOrDefault(n => n.Year == m.Year && n.Month == m.Month)?.Count ?? 0,
            ExpiredMembers = expiredMembersByMonth.FirstOrDefault(e => e.Year == m.Year && e.Month == m.Month)?.Count ?? 0
        }).ToList();

        var insights = GenerateInsights(memberAgg, totalDesks, occupiedDesks, revenueCurrent, revenuePrevious, bookingsCurrent, bookingsPrevious, membersCurrent, membersPrevious);

        var response = new AnalyticsOverviewResponse
        {
            Kpis = new KpiData
            {
                TotalMembers = memberAgg?.Total ?? 0,
                ActiveMembers = memberAgg?.Active ?? 0,
                ExpiredMembers = memberAgg?.Expired ?? 0,
                UnpaidMembers = memberAgg?.Unpaid ?? 0,
                StudentCount = memberAgg?.Students ?? 0,
                RemoteWorkerCount = memberAgg?.Workers ?? 0,
                MonthlyIncome = memberAgg?.MonthlyIncome ?? 0,
                TotalRevenue = totalRevenue,
                OccupancyRate = hasDeskData ? Math.Round((double)occupiedDesks / totalDesks * 100, 1) : 0,
                TotalDesks = totalDesks,
                OccupiedDesks = occupiedDesks,
                AvailableDesks = Math.Max(0, totalDesks - occupiedDesks),
                TotalMeetingRoomBookings = totalBookings,
                ActiveSubscriptions = memberAgg?.Active ?? 0,
                MembersTrend = membersPrevious > 0 ? Math.Round((double)(membersCurrent - membersPrevious) / membersPrevious * 100, 1) : null,
                RevenueTrend = revenuePrevious > 0 ? Math.Round((double)(revenueCurrent - revenuePrevious) / (double)revenuePrevious * 100, 1) : null,
                MeetingRoomTrend = bookingsPrevious > 0 ? Math.Round((double)(bookingsCurrent - bookingsPrevious) / bookingsPrevious * 100, 1) : null
            },
            RevenueHistory = revenueHistory,
            MemberGrowth = memberGrowth,
            Occupancy = hasDeskData ? new AnalyticsOccupancyData
            {
                Occupied = occupiedDesks,
                Available = Math.Max(0, totalDesks - occupiedDesks),
                Rate = Math.Round((double)occupiedDesks / totalDesks * 100, 1)
            } : null,
            PaymentStatus = totalMembers > 0 ? new AnalyticsPaymentStatusData
            {
                Paid = paidCount,
                Unpaid = memberAgg?.Unpaid ?? 0,
                PaidPercentage = Math.Round((double)paidCount / totalMembers * 100, 1),
                UnpaidPercentage = Math.Round((double)(memberAgg?.Unpaid ?? 0) / totalMembers * 100, 1)
            } : null,
            Subscriptions = subscriptionsData,
            MeetingRoomUsage = meetingRoomUsage,
            MemberActivity = memberActivity,
            Insights = insights
        };

        return response;
    }

    private static List<AnalyticsInsight> GenerateInsights(
        dynamic? memberAgg, int totalDesks, int occupiedDesks,
        decimal revenueCurrent, decimal revenuePrevious,
        int bookingsCurrent, int bookingsPrevious,
        int membersCurrent, int membersPrevious)
    {
        var insights = new List<AnalyticsInsight>();
        if (memberAgg == null) return insights;

        var unpaid = (int)memberAgg.Unpaid;
        var expired = (int)memberAgg.Expired;
        var active = (int)memberAgg.Active;
        var monthlyIncome = (decimal)memberAgg.MonthlyIncome;

        if (active == 0)
        {
            insights.Add(new AnalyticsInsight
            {
                Type = "info",
                Title = "Getting Started",
                Message = "Start by registering your first member to begin tracking your workspace.",
                Icon = "info"
            });
            return insights;
        }

        if (unpaid > 0)
            insights.Add(new AnalyticsInsight
            {
                Type = "warning",
                Title = "Unpaid Members",
                Message = $"{unpaid} member(s) have outstanding payments. Consider sending reminders.",
                Icon = "alert-triangle"
            });

        if (expired > 0)
            insights.Add(new AnalyticsInsight
            {
                Type = "danger",
                Title = "Expired Memberships",
                Message = $"{expired} member(s) have expired memberships. Follow up to retain them.",
                Icon = "clock"
            });

        if (active > 0 && monthlyIncome > 0)
            insights.Add(new AnalyticsInsight
            {
                Type = "success",
                Title = "Healthy Revenue Stream",
                Message = $"You have {active} active members generating ${monthlyIncome:N2}/mo in membership fees.",
                Icon = "trending-up"
            });

        if (totalDesks > 0)
        {
            var occupancyRate = (double)occupiedDesks / totalDesks;
            if (occupancyRate > 0.8)
                insights.Add(new AnalyticsInsight
                {
                    Type = "info",
                    Title = "High Occupancy",
                    Message = $"Workspace is {occupancyRate * 100:F0}% occupied. Consider expanding capacity.",
                    Icon = "layout"
                });
            else if (occupancyRate < 0.3)
                insights.Add(new AnalyticsInsight
                {
                    Type = "warning",
                    Title = "Low Occupancy",
                    Message = $"Workspace is only {occupancyRate * 100:F0}% occupied. Consider promotions to attract new members.",
                    Icon = "layout"
                });
        }

        if (revenuePrevious > 0 && revenueCurrent > revenuePrevious)
        {
            var pct = Math.Round((double)(revenueCurrent - revenuePrevious) / (double)revenuePrevious * 100, 1);
            if (pct > 0)
                insights.Add(new AnalyticsInsight
                {
                    Type = "success",
                    Title = "Revenue Growth",
                    Message = $"Revenue grew {pct}% compared to the previous period.",
                    Icon = "trending-up"
                });
        }

        if (bookingsPrevious > 0 && bookingsCurrent > bookingsPrevious)
        {
            var pct = Math.Round((double)(bookingsCurrent - bookingsPrevious) / bookingsPrevious * 100, 1);
            if (pct > 0)
                insights.Add(new AnalyticsInsight
                {
                    Type = "success",
                    Title = "Meeting Room Growth",
                    Message = $"Meeting room bookings increased {pct}% compared to the previous period.",
                    Icon = "calendar"
                });
        }

        if (membersPrevious > 0 && membersCurrent > membersPrevious)
        {
            var pct = Math.Round((double)(membersCurrent - membersPrevious) / membersPrevious * 100, 1);
            if (pct > 0)
                insights.Add(new AnalyticsInsight
                {
                    Type = "success",
                    Title = "Member Growth",
                    Message = $"New member registrations increased {pct}% compared to the previous period.",
                    Icon = "users"
                });
        }

        return insights;
    }

    private static (DateTime startDate, DateTime previousStartDate) GetDateRange(string period, DateTime today)
    {
        var days = period switch
        {
            "7d" => 7,
            "30d" => 30,
            "90d" => 90,
            "1y" => 365,
            _ => 30
        };
        return (today.AddDays(-days), today.AddDays(-days * 2));
    }
}
