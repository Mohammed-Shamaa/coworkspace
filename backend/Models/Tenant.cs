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

    // Admin registration fields
    public TenantStatus Status { get; set; } = TenantStatus.Pending;
    [MaxLength(200)]
    public string? Email { get; set; }
    [MaxLength(200)]
    public string? OwnerName { get; set; }
    [MaxLength(50)]
    public string? PhoneNumber { get; set; }
    [MaxLength(100)]
    public string? Country { get; set; }
    [MaxLength(100)]
    public string? City { get; set; }
    [MaxLength(500)]
    public string? FullAddress { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? WorkspaceCapacity { get; set; }
    public int? NumberOfOffices { get; set; }
    public int? NumberOfMeetingRooms { get; set; }
    public int? NumberOfDesks { get; set; }
    [MaxLength(2000)]
    public string? WorkspaceDescription { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? RejectionReason { get; set; }
    [MaxLength(20)]
    public string? PaymentStatus { get; set; } = "Unpaid";
    public string? SubscriptionPlan { get; set; }
    public DateTime? LastPaymentDate { get; set; }
    public DateTime? NextDueDate { get; set; }

    [ForeignKey(nameof(ApprovedByUserId))]
    public User? ApprovedByUser { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Member> Members { get; set; } = new List<Member>();
    public ICollection<MeetingRoomReservation> MeetingRoomReservations { get; set; } = new List<MeetingRoomReservation>();
}
