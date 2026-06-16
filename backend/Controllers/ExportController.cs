using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExportController(AppDbContext db) => _db = db;

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));

    [HttpGet("members-excel")]
    public async Task<ActionResult> ExportMembersExcel()
    {
        var members = await _db.Members
            .AsNoTracking()
            .Where(m => m.TenantId == TenantId)
            .OrderByDescending(m => m.Id)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Members");

        // Header row
        var headers = new[] {
            "ID", "Full Name", "Phone Number", "National ID", "Member Type",
            "Worker Type", "Registration Date", "End Date", "No End Date",
            "Attendance Plan", "Attendance Schedule", "Start Time", "End Time",
            "Desk Number", "Working Hours", "Subscription Months", "Remaining Days",
            "Time Period", "Monthly Fee", "Payment Status", "Last Payment Date",
            "Next Due Date", "Created At", "Updated At"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
            ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1565C0");
            ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        // Data rows
        int row = 2;
        foreach (var m in members)
        {
            ws.Cell(row, 1).Value = m.Id;
            ws.Cell(row, 2).Value = m.FullName;
            ws.Cell(row, 3).Value = m.PhoneNumber;
            ws.Cell(row, 4).Value = m.NationalId;
            ws.Cell(row, 5).Value = m.MemberType.ToString();
            ws.Cell(row, 6).Value = m.WorkerType?.ToString() ?? "";
            ws.Cell(row, 7).Value = m.RegistrationDate.ToString("yyyy-MM-dd");
            ws.Cell(row, 8).Value = m.EndDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 9).Value = m.NoEndDate ? "Yes" : "No";
            ws.Cell(row, 10).Value = m.AttendancePlan.ToString();
            ws.Cell(row, 11).Value = m.AttendanceSchedule?.ToString() ?? "";
            ws.Cell(row, 12).Value = m.StartTime.ToString(@"HH\:mm");
            ws.Cell(row, 13).Value = m.EndTime.ToString(@"HH\:mm");
            ws.Cell(row, 14).Value = m.DeskNumber;
            ws.Cell(row, 15).Value = m.WorkingHours;
            ws.Cell(row, 16).Value = m.SubscriptionMonths;
            ws.Cell(row, 17).Value = m.RemainingDays;
            ws.Cell(row, 18).Value = m.TimePeriod;
            ws.Cell(row, 19).Value = (double)m.MonthlyFee;
            ws.Cell(row, 20).Value = m.PaymentStatus.ToString();
            ws.Cell(row, 21).Value = m.LastPaymentDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 22).Value = m.NextDueDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 23).Value = m.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            ws.Cell(row, 24).Value = m.UpdatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            row++;
        }

        // Auto-fit columns
        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Seek(0, SeekOrigin.Begin);

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"Members_Export_{DateTime.Today:yyyy-MM-dd}.xlsx");
    }
}
