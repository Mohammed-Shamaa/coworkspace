using System.Security.Claims;
using Coworkspace.API.DTOs;
using Coworkspace.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Coworkspace.API.Data;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeetingRoomController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly MeetingRoomService _service;

    public MeetingRoomController(AppDbContext db, MeetingRoomService service)
    {
        _db = db;
        _service = service;
    }

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));

    [HttpGet]
    public async Task<ActionResult<List<ReservationResponse>>> GetAll([FromQuery] string? date, [FromQuery] string? search)
    {
        var query = _db.MeetingRoomReservations
            .Where(r => r.TenantId == TenantId);

        if (!string.IsNullOrEmpty(date) && DateOnly.TryParse(date, out var filterDate))
        {
            var dt = DateTime.SpecifyKind(filterDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            query = query.Where(r => r.ReservationDate == dt);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            query = query.Where(r => r.PersonName.ToLower().Contains(term));
        }

        var reservations = await query.ToListAsync();

        return reservations
            .OrderByDescending(r => r.ReservationDate)
            .ThenBy(r => r.StartTime)
            .Select(MapToResponse)
            .ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationResponse>> GetById(int id)
    {
        var reservation = await _db.MeetingRoomReservations
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == TenantId);

        if (reservation == null) return NotFound();

        return MapToResponse(reservation);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> Create(CreateReservationRequest request)
    {
        if (!DateOnly.TryParse(request.ReservationDate, out var dateOnly))
            return BadRequest(new { message = "Invalid date format." });

        if (!TimeSpan.TryParse(request.StartTime, out var startTime))
            return BadRequest(new { message = "Invalid start time format. Use HH:mm." });

        if (!TimeSpan.TryParse(request.EndTime, out var endTime))
            return BadRequest(new { message = "Invalid end time format. Use HH:mm." });

        try
        {
            var reservationDate = DateTime.SpecifyKind(dateOnly.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var reservation = await _service.CreateReservation(
                TenantId,
                request.PersonName,
                reservationDate,
                startTime,
                endTime,
                request.Notes
            );

            return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, MapToResponse(reservation));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReservationResponse>> Update(int id, UpdateReservationRequest request)
    {
        if (!DateOnly.TryParse(request.ReservationDate, out var dateOnly))
            return BadRequest(new { message = "Invalid date format." });

        if (!TimeSpan.TryParse(request.StartTime, out var startTime))
            return BadRequest(new { message = "Invalid start time format. Use HH:mm." });

        if (!TimeSpan.TryParse(request.EndTime, out var endTime))
            return BadRequest(new { message = "Invalid end time format. Use HH:mm." });

        try
        {
            var updateDate = DateTime.SpecifyKind(dateOnly.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var reservation = await _service.UpdateReservation(
                id,
                TenantId,
                request.PersonName,
                updateDate,
                startTime,
                endTime,
                request.Notes
            );

            return MapToResponse(reservation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var reservation = await _db.MeetingRoomReservations
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == TenantId);

        if (reservation == null) return NotFound();

        _db.MeetingRoomReservations.Remove(reservation);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ReservationStatsResponse>> GetStats()
    {
        var now = DateTime.UtcNow;
        var today = now.Date;

        var reservations = await _db.MeetingRoomReservations
            .Where(r => r.TenantId == TenantId)
            .ToListAsync();

        var total = reservations.Count;
        var todays = reservations.Count(r => r.ReservationDate == today);
        var upcoming = reservations.Count(r => r.ReservationDate >= today && r.StartTime > now.TimeOfDay);
        var past = reservations.Count(r => r.ReservationDate < today || (r.ReservationDate == today && r.EndTime <= now.TimeOfDay));

        return new ReservationStatsResponse
        {
            TotalReservations = total,
            TodaysReservations = todays,
            UpcomingReservations = upcoming,
            PastReservations = past
        };
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<ReservationResponse>>> GetUpcoming()
    {
        var now = DateTime.UtcNow;
        var today = now.Date;

        var reservations = await _db.MeetingRoomReservations
            .Where(r => r.TenantId == TenantId && r.ReservationDate >= today)
            .ToListAsync();
        reservations = reservations
            .OrderBy(r => r.ReservationDate)
            .ThenBy(r => r.StartTime)
            .Take(10)
            .ToList();

        return reservations.Select(MapToResponse).ToList();
    }

    private static ReservationResponse MapToResponse(Models.MeetingRoomReservation r)
    {
        return new ReservationResponse
        {
            Id = r.Id,
            PersonName = r.PersonName,
            ReservationDate = r.ReservationDate.ToString("yyyy-MM-dd"),
            StartTime = r.StartTime.ToString(@"hh\:mm"),
            EndTime = r.EndTime.ToString(@"hh\:mm"),
            Notes = r.Notes,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };
    }
}
