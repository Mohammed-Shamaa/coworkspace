using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Services;

public class MeetingRoomService
{
    private readonly AppDbContext _db;

    public MeetingRoomService(AppDbContext db)
    {
        _db = db;
    }

    public async Task ValidateReservation(int tenantId, DateTime date, TimeSpan startTime, TimeSpan endTime, int? excludeReservationId = null)
    {
        var tenant = await _db.Tenants.FindAsync(tenantId)
            ?? throw new InvalidOperationException("Tenant not found.");

        if (!tenant.OpeningTime.HasValue || !tenant.ClosingTime.HasValue)
            throw new InvalidOperationException("Working hours not configured.");

        if (startTime < tenant.OpeningTime.Value)
            throw new InvalidOperationException($"Reservation cannot start before opening time ({FormatTimeSpan(tenant.OpeningTime.Value)}).");

        if (endTime > tenant.ClosingTime.Value)
            throw new InvalidOperationException($"Reservation cannot end after closing time ({FormatTimeSpan(tenant.ClosingTime.Value)}).");

        if (startTime >= endTime)
            throw new InvalidOperationException("Start time must be before end time.");

        var now = DateTime.Now;

        if (date.Year < now.Year || (date.Year == now.Year && date.Month < now.Month) || (date.Year == now.Year && date.Month == now.Month && date.Day < now.Day))
            throw new InvalidOperationException("Cannot create reservation in the past.");

        if (date.Year == now.Year && date.Month == now.Month && date.Day == now.Day && startTime <= now.TimeOfDay)
            throw new InvalidOperationException("Cannot create a reservation for a time that has already passed today.");

        var conflict = await _db.MeetingRoomReservations
            .AnyAsync(r => r.TenantId == tenantId
                        && r.ReservationDate == date
                        && r.Id != (excludeReservationId ?? 0)
                        && startTime < r.EndTime
                        && endTime > r.StartTime);

        if (conflict)
            throw new InvalidOperationException("This time slot is already reserved. Please choose a different time.");
    }

    public async Task<MeetingRoomReservation> CreateReservation(int tenantId, string personName, DateTime date, TimeSpan startTime, TimeSpan endTime, string? notes)
    {
        await ValidateReservation(tenantId, date, startTime, endTime);

        var reservation = new MeetingRoomReservation
        {
            TenantId = tenantId,
            PersonName = personName,
            ReservationDate = date,
            StartTime = startTime,
            EndTime = endTime,
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.MeetingRoomReservations.Add(reservation);
        await _db.SaveChangesAsync();

        return reservation;
    }

    public async Task<MeetingRoomReservation> UpdateReservation(int id, int tenantId, string personName, DateTime date, TimeSpan startTime, TimeSpan endTime, string? notes)
    {
        var reservation = await _db.MeetingRoomReservations
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId)
            ?? throw new InvalidOperationException("Reservation not found.");

        await ValidateReservation(tenantId, date, startTime, endTime, id);

        reservation.PersonName = personName;
        reservation.ReservationDate = date;
        reservation.StartTime = startTime;
        reservation.EndTime = endTime;
        reservation.Notes = notes;
        reservation.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return reservation;
    }

    private static string FormatTimeSpan(TimeSpan time)
    {
        var hours = time.Hours;
        var minutes = time.Minutes;
        var amPm = hours >= 12 ? "PM" : "AM";
        if (hours > 12) hours -= 12;
        if (hours == 0) hours = 12;
        return $"{hours:D2}:{minutes:D2} {amPm}";
    }
}
