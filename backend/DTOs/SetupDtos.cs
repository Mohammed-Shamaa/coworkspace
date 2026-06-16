using System.ComponentModel.DataAnnotations;

namespace Coworkspace.API.DTOs;

public class WorkspaceInfoRequest
{
    [Required]
    [Range(1, 10000)]
    public int TotalDesks { get; set; }

    [Required]
    [Range(1, 100000)]
    public int MaxCapacity { get; set; }

    [Required]
    public bool HasMeetingRoom { get; set; }
}

public class WorkspaceAddressRequest
{
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
}

public class WorkingHoursRequest
{
    [Required]
    public string OpeningTime { get; set; } = string.Empty;

    [Required]
    public string ClosingTime { get; set; } = string.Empty;
}

public class OnboardingStatusResponse
{
    public bool OnboardingCompleted { get; set; }
}

public class OnboardingInfoResponse
{
    public bool OnboardingCompleted { get; set; }
    public int? TotalDesks { get; set; }
    public int? MaxCapacity { get; set; }
    public bool HasMeetingRoom { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
}
