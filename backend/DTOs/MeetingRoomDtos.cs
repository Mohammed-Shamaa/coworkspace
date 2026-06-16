using System.ComponentModel.DataAnnotations;

namespace Coworkspace.API.DTOs;

public class CreateReservationRequest
{
    [Required]
    [MaxLength(200)]
    public string PersonName { get; set; } = string.Empty;

    [Required]
    public string ReservationDate { get; set; } = string.Empty;

    [Required]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    public string EndTime { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class UpdateReservationRequest
{
    [Required]
    [MaxLength(200)]
    public string PersonName { get; set; } = string.Empty;

    [Required]
    public string ReservationDate { get; set; } = string.Empty;

    [Required]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    public string EndTime { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class ReservationResponse
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public string ReservationDate { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ReservationStatsResponse
{
    public int TotalReservations { get; set; }
    public int TodaysReservations { get; set; }
    public int UpcomingReservations { get; set; }
    public int PastReservations { get; set; }
}
