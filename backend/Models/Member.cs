using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coworkspace.API.Models;

public class Member
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int TenantId { get; set; }

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string NationalId { get; set; } = string.Empty;

    [Required]
    public MemberType MemberType { get; set; }

    public WorkerType? WorkerType { get; set; }

    [Required]
    public DateTime RegistrationDate { get; set; }

    public DateTime? EndDate { get; set; }
    public bool NoEndDate { get; set; }

    [Required]
    public AttendancePlan AttendancePlan { get; set; }

    public AttendanceSchedule? AttendanceSchedule { get; set; }

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan EndTime { get; set; }

    [Required]
    [MaxLength(20)]
    public string DeskNumber { get; set; } = string.Empty;

    public double WorkingHours { get; set; }
    public int SubscriptionMonths { get; set; }
    public int RemainingDays { get; set; }

    [MaxLength(200)]
    public string TimePeriod { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyFee { get; set; }

    [Required]
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    public DateTime? LastPaymentDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(TenantId))]
    public Tenant Tenant { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
