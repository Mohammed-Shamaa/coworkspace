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
public class MembersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuditService _audit;
    private readonly PdfService _pdf;

    public MembersController(AppDbContext db, AuditService audit, PdfService pdf)
    {
        _db = db;
        _audit = audit;
        _pdf = pdf;
    }

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));
    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("Missing NameIdentifier"));

    [HttpGet]
    public async Task<ActionResult<List<MemberResponse>>> GetAll(
        [FromQuery] string? search, [FromQuery] string? filter,
        [FromQuery] string? type, [FromQuery] string? paymentStatus,
        [FromQuery] bool? expired, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = _db.Members.AsNoTracking().Where(m => m.TenantId == TenantId);

        if (expired == true)
        {
            var now = DateTime.Today;
            query = query.Where(m => !m.NoEndDate && m.EndDate != null && m.EndDate < now);
        }

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<MemberType>(type, true, out var mt))
            query = query.Where(m => m.MemberType == mt);

        if (!string.IsNullOrWhiteSpace(paymentStatus) && Enum.TryParse<PaymentStatus>(paymentStatus, true, out var ps))
            query = query.Where(m => m.PaymentStatus == ps);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = filter?.ToLower() switch
            {
                "name" => query.Where(m => m.FullName.ToLower().Contains(s)),
                "nationalid" => query.Where(m => m.NationalId.ToLower().Contains(s)),
                "phone" => query.Where(m => m.PhoneNumber.ToLower().Contains(s)),
                "desk" => query.Where(m => m.DeskNumber.ToLower().Contains(s)),
                _ => query.Where(m => m.FullName.ToLower().Contains(s) || m.PhoneNumber.ToLower().Contains(s) || m.NationalId.ToLower().Contains(s))
            };
        }

        var memberEntities = await query
            .OrderByDescending(m => m.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var members = memberEntities.Select(MapToResponse).ToList();

        return members;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MemberResponse>> GetById(int id)
    {
        var member = await _db.Members.AsNoTracking().AsSplitQuery().Include(m => m.Payments).FirstOrDefaultAsync(m => m.Id == id && m.TenantId == TenantId);
        if (member == null) return NotFound();

        var response = MapToResponse(member);
        response.Payments = member.Payments.OrderByDescending(p => p.PaymentDate).Select(p => new PaymentResponse
        {
            Id = p.Id,
            PaymentDate = p.PaymentDate,
            PaymentTime = p.PaymentTime,
            Amount = p.Amount,
            Status = p.Status,
            PaidMonth = p.PaidMonth,
            CreatedAt = p.CreatedAt
        }).ToList();

        return response;
    }

    [HttpPost]
    public async Task<ActionResult<MemberResponse>> Create(CreateMemberRequest request)
    {
        if (!TimeSpan.TryParse(request.StartTime, out var startTime) || !TimeSpan.TryParse(request.EndTime, out var endTime))
            return BadRequest(new { message = "Invalid time format. Use HH:mm." });

        if (!Enum.TryParse<MemberType>(request.MemberType, true, out var memberType))
            return BadRequest(new { message = "Invalid member type." });

        WorkerType? workerType = null;
        if (!string.IsNullOrEmpty(request.WorkerType) && Enum.TryParse<WorkerType>(request.WorkerType, true, out var wt))
            workerType = wt;

        if (!Enum.TryParse<AttendancePlan>(request.AttendancePlan, true, out var plan))
            return BadRequest(new { message = "Invalid attendance plan." });

        AttendanceSchedule? schedule = null;
        if (!string.IsNullOrEmpty(request.AttendanceSchedule) && Enum.TryParse<AttendanceSchedule>(request.AttendanceSchedule, true, out var sch))
            schedule = sch;

        var dupCheck = await CheckDuplicates(null, request.FullName, request.PhoneNumber, request.NationalId, request.DeskNumber, startTime, endTime);
        if (dupCheck != null) return dupCheck;

        var workingHours = (endTime - startTime).TotalHours;

        var member = new Member
        {
            TenantId = TenantId,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            NationalId = request.NationalId.Trim(),
            DeskNumber = request.DeskNumber.Trim(),
            MemberType = memberType,
            WorkerType = workerType,
            RegistrationDate = request.RegistrationDate,
            EndDate = request.NoEndDate ? null : request.EndDate,
            NoEndDate = request.NoEndDate,
            AttendancePlan = plan,
            AttendanceSchedule = plan == AttendancePlan.ThreeDaysPerWeek ? schedule : null,
            StartTime = startTime,
            EndTime = endTime,
            WorkingHours = workingHours,
            MonthlyFee = request.MonthlyFee,
            PaymentStatus = PaymentStatus.Unpaid,
            NextDueDate = request.RegistrationDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!request.NoEndDate && request.EndDate.HasValue)
        {
            var dur = BillingHelper.CalculateDateDuration(request.RegistrationDate, request.EndDate.Value);
            member.SubscriptionMonths = dur.Years * 12 + dur.Months;
            member.RemainingDays = dur.Days;
        }

        member.TimePeriod = BillingHelper.FormatTimePeriod(member.EndDate, member.NoEndDate, member.RegistrationDate, member.StartTime, member.EndTime);

        await using var tx = await _db.Database.BeginTransactionAsync();
        _db.Members.Add(member);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(TenantId, UserId, "Create", "Member", member.Id, $"Created member: {member.FullName}");
        await tx.CommitAsync();

        return CreatedAtAction(nameof(GetById), new { id = member.Id }, MapToResponse(member));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MemberResponse>> Update(int id, UpdateMemberRequest request)
    {
        var member = await _db.Members.FirstOrDefaultAsync(m => m.Id == id && m.TenantId == TenantId);
        if (member == null) return NotFound();

        if (!TimeSpan.TryParse(request.StartTime, out var startTime) || !TimeSpan.TryParse(request.EndTime, out var endTime))
            return BadRequest(new { message = "Invalid time format." });

        if (!Enum.TryParse<MemberType>(request.MemberType, true, out var memberType))
            return BadRequest(new { message = "Invalid member type." });

        WorkerType? workerType = null;
        if (!string.IsNullOrEmpty(request.WorkerType) && Enum.TryParse<WorkerType>(request.WorkerType, true, out var wt))
            workerType = wt;

        if (!Enum.TryParse<AttendancePlan>(request.AttendancePlan, true, out var plan))
            return BadRequest(new { message = "Invalid attendance plan." });

        AttendanceSchedule? schedule = null;
        if (!string.IsNullOrEmpty(request.AttendanceSchedule) && Enum.TryParse<AttendanceSchedule>(request.AttendanceSchedule, true, out var sch))
            schedule = sch;

        var dupCheck = await CheckDuplicates(id, request.FullName, request.PhoneNumber, request.NationalId, request.DeskNumber, startTime, endTime);
        if (dupCheck != null) return dupCheck;

        member.FullName = request.FullName.Trim();
        member.PhoneNumber = request.PhoneNumber.Trim();
        member.NationalId = request.NationalId.Trim();
        member.DeskNumber = request.DeskNumber.Trim();
        member.MemberType = memberType;
        member.WorkerType = workerType;
        member.RegistrationDate = request.RegistrationDate;
        member.EndDate = request.NoEndDate ? null : request.EndDate;
        member.NoEndDate = request.NoEndDate;
        member.AttendancePlan = plan;
        member.AttendanceSchedule = plan == AttendancePlan.ThreeDaysPerWeek ? schedule : null;
        member.StartTime = startTime;
        member.EndTime = endTime;
        member.WorkingHours = (endTime - startTime).TotalHours;
        member.MonthlyFee = request.MonthlyFee;
        member.TimePeriod = BillingHelper.FormatTimePeriod(member.EndDate, member.NoEndDate, member.RegistrationDate, member.StartTime, member.EndTime);
        if (member.NextDueDate == null) member.NextDueDate = member.RegistrationDate;
        member.UpdatedAt = DateTime.UtcNow;

        if (!request.NoEndDate && request.EndDate.HasValue)
        {
            var dur = BillingHelper.CalculateDateDuration(request.RegistrationDate, request.EndDate.Value);
            member.SubscriptionMonths = dur.Years * 12 + dur.Months;
            member.RemainingDays = dur.Days;
        }
        else
        {
            member.SubscriptionMonths = 0;
            member.RemainingDays = 0;
        }

        await using var tx = await _db.Database.BeginTransactionAsync();
        await _db.SaveChangesAsync();
        await _audit.LogAsync(TenantId, UserId, "Update", "Member", member.Id, $"Updated member: {member.FullName}");
        await tx.CommitAsync();

        return MapToResponse(member);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var member = await _db.Members.Include(m => m.Payments).FirstOrDefaultAsync(m => m.Id == id && m.TenantId == TenantId);
        if (member == null) return NotFound();

        var name = member.FullName;
        await using var tx = await _db.Database.BeginTransactionAsync();
        _db.Payments.RemoveRange(member.Payments);
        _db.Members.Remove(member);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(TenantId, UserId, "Delete", "Member", id, $"Deleted member: {name}");
        await tx.CommitAsync();

        return NoContent();
    }

    [HttpPost("{id}/mark-paid")]
    public async Task<ActionResult> MarkPaid(int id, [FromBody] MarkPaidRequest? request)
    {
        var member = await _db.Members.FirstOrDefaultAsync(m => m.Id == id && m.TenantId == TenantId);
        if (member == null) return NotFound();

        var paidMonthKey = BillingHelper.GetCurrentPaidMonthKey(member);

        member.PaymentStatus = PaymentStatus.Paid;
        member.LastPaymentDate = DateTime.UtcNow;
        member.NextDueDate = member.LastPaymentDate.Value.AddMonths(1);
        member.UpdatedAt = DateTime.UtcNow;

        var payment = new Payment
        {
            MemberId = member.Id,
            TenantId = TenantId,
            PaymentDate = DateTime.Today,
            PaymentTime = DateTime.Now.ToString("HH:mm:ss"),
            Amount = member.MonthlyFee,
            Status = "Paid",
            PaidMonth = paidMonthKey,
            RecordedByUserId = request?.RecordedByUserId ?? (User.FindFirst(ClaimTypes.NameIdentifier) != null ? UserId : null),
            CreatedAt = DateTime.UtcNow
        };

        await using var tx = await _db.Database.BeginTransactionAsync();
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(TenantId, UserId, "PaymentReceived", "Member", member.Id, $"Payment of ${member.MonthlyFee} received from {member.FullName} ({paidMonthKey})");
        await tx.CommitAsync();

        return Ok(new { message = $"Payment of ${member.MonthlyFee} received." });
    }

    [HttpGet("{id}/pdf")]
    public async Task<ActionResult> GeneratePdf(int id)
    {
        var member = await _db.Members.AsNoTracking().AsSplitQuery().Include(m => m.Payments).Include(m => m.Tenant).FirstOrDefaultAsync(m => m.Id == id && m.TenantId == TenantId);
        if (member == null) return NotFound();

        var pdfBytes = _pdf.GenerateMemberPdf(member, member.Payments.ToList(), member.Tenant?.CompanyName ?? "Coworkspace");

        return File(pdfBytes, "application/pdf", $"Member_{member.FullName}_{DateTime.Now:yyyy-MM-dd}.pdf");
    }

    private async Task<ActionResult?> CheckDuplicates(int? excludeId, string fullName, string phoneNumber, string nationalId, string? deskNumber = null, TimeSpan? startTime = null, TimeSpan? endTime = null)
    {
        var query = _db.Members.Where(m => m.TenantId == TenantId);
        if (excludeId.HasValue) query = query.Where(m => m.Id != excludeId.Value);

        var nameExists = await query.AnyAsync(m => m.FullName.ToLower() == fullName.ToLower());
        if (nameExists) return BadRequest(new { message = "A member with this Full Name already exists." });

        var phoneExists = await query.AnyAsync(m => m.PhoneNumber == phoneNumber);
        if (phoneExists) return BadRequest(new { message = "A member with this Phone Number already exists." });

        var nationalIdExists = await query.AnyAsync(m => m.NationalId == nationalId);
        if (nationalIdExists) return BadRequest(new { message = "A member with this National ID already exists." });

        if (!string.IsNullOrEmpty(deskNumber) && startTime.HasValue && endTime.HasValue)
        {
            var st = startTime.Value;
            var et = endTime.Value;
            var deskConflict = await query
                .AnyAsync(m => m.DeskNumber == deskNumber && m.StartTime < et && m.EndTime > st);
            if (deskConflict)
                return BadRequest(new { message = "This desk is already occupied during the selected time period." });
        }

        return null;
    }

    private static MemberResponse MapToResponse(Member m) => new()
    {
        Id = m.Id,
        FullName = m.FullName,
        PhoneNumber = m.PhoneNumber,
        NationalId = m.NationalId,
        MemberType = m.MemberType.ToString(),
        WorkerType = m.WorkerType?.ToString(),
        RegistrationDate = m.RegistrationDate,
        EndDate = m.EndDate,
        NoEndDate = m.NoEndDate,
        AttendancePlan = m.AttendancePlan.ToString(),
        AttendanceSchedule = m.AttendanceSchedule?.ToString(),
        StartTime = m.StartTime.ToString(@"hh\:mm"),
        EndTime = m.EndTime.ToString(@"hh\:mm"),
        DeskNumber = m.DeskNumber,
        WorkingHours = m.WorkingHours,
        SubscriptionMonths = m.SubscriptionMonths,
        RemainingDays = m.RemainingDays,
        TimePeriod = m.TimePeriod,
        MonthlyFee = m.MonthlyFee,
        PaymentStatus = m.PaymentStatus.ToString(),
        PaymentStatusDisplay = m.PaymentStatus == PaymentStatus.Unpaid ? "Payment Required" : "Paid",
        LastPaymentDate = m.LastPaymentDate,
        NextDueDate = m.NextDueDate,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt
    };
}
