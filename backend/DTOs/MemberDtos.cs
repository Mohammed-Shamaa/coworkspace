using System.ComponentModel.DataAnnotations;
using Coworkspace.API.Models;

namespace Coworkspace.API.DTOs;

public class CreateMemberRequest
{
    [Required] [MaxLength(200)] public string FullName { get; set; } = string.Empty;
    [Required] [MaxLength(50)] public string PhoneNumber { get; set; } = string.Empty;
    [Required] [MaxLength(50)] public string NationalId { get; set; } = string.Empty;
    [Required] public string MemberType { get; set; } = "Student";
    public string? WorkerType { get; set; }
    [Required] public DateTime RegistrationDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool NoEndDate { get; set; }
    [Required] public string AttendancePlan { get; set; } = "ThreeDaysPerWeek";
    public string? AttendanceSchedule { get; set; }
    [Required] public string StartTime { get; set; } = "09:00";
    [Required] public string EndTime { get; set; } = "17:00";
    [Required] [MaxLength(20)] public string DeskNumber { get; set; } = string.Empty;
    [Required] [Range(0.01, 999999)] public decimal MonthlyFee { get; set; }
}

public class UpdateMemberRequest
{
    [Required] [MaxLength(200)] public string FullName { get; set; } = string.Empty;
    [Required] [MaxLength(50)] public string PhoneNumber { get; set; } = string.Empty;
    [Required] [MaxLength(50)] public string NationalId { get; set; } = string.Empty;
    [Required] public string MemberType { get; set; } = "Student";
    public string? WorkerType { get; set; }
    [Required] public DateTime RegistrationDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool NoEndDate { get; set; }
    [Required] public string AttendancePlan { get; set; } = "ThreeDaysPerWeek";
    public string? AttendanceSchedule { get; set; }
    [Required] public string StartTime { get; set; } = "09:00";
    [Required] public string EndTime { get; set; } = "17:00";
    [Required] [MaxLength(20)] public string DeskNumber { get; set; } = string.Empty;
    [Required] [Range(0.01, 999999)] public decimal MonthlyFee { get; set; }
}

public class MemberResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string MemberType { get; set; } = string.Empty;
    public string? WorkerType { get; set; }
    public DateTime RegistrationDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool NoEndDate { get; set; }
    public string AttendancePlan { get; set; } = string.Empty;
    public string? AttendanceSchedule { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string DeskNumber { get; set; } = string.Empty;
    public double WorkingHours { get; set; }
    public int SubscriptionMonths { get; set; }
    public int RemainingDays { get; set; }
    public string TimePeriod { get; set; } = string.Empty;
    public decimal MonthlyFee { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentStatusDisplay { get; set; } = string.Empty;
    public DateTime? LastPaymentDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PaymentResponse> Payments { get; set; } = new();
}

public class PaymentResponse
{
    public int Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentTime { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaidMonth { get; set; } = string.Empty;
    public string? RecordedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DashboardResponse
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int ExpiredMembers { get; set; }
    public int UnpaidMembers { get; set; }
    public int StudentCount { get; set; }
    public int RemoteWorkerCount { get; set; }
    public decimal MonthlyIncome { get; set; }
    public List<RecentRegistration> RecentRegistrations { get; set; } = new();
}

public class RecentRegistration
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MemberType { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public decimal MonthlyFee { get; set; }
}

public class MarkPaidRequest
{
    public int? RecordedByUserId { get; set; }
}
