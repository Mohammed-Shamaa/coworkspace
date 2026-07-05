using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coworkspace.API.Models;

public class Tenant
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Subdomain { get; set; } = string.Empty;

    [MaxLength(500)]
    public string LogoUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string PrimaryColor { get; set; } = "#1565C0";

    [MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Onboarding fields
    public bool OnboardingCompleted { get; set; } = false;
    public int? TotalDesks { get; set; }
    public int? MaxCapacity { get; set; }
    public bool HasMeetingRoom { get; set; } = false;
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    public TimeSpan? OpeningTime { get; set; }
    public TimeSpan? ClosingTime { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Member> Members { get; set; } = new List<Member>();
    public ICollection<MeetingRoomReservation> MeetingRoomReservations { get; set; } = new List<MeetingRoomReservation>();
}
