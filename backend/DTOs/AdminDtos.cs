namespace Coworkspace.API.DTOs;

public class AdminWorkspaceDetail
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string WhatsappNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int? TotalDesks { get; set; }
    public int? MaxCapacity { get; set; }
    public bool HasMeetingRoom { get; set; }
    public TimeSpan? OpeningTime { get; set; }
    public TimeSpan? ClosingTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
    public DateTime? TrialStartDate { get; set; }
    public DateTime? SubscriptionExpiryDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public int MeetingRoomReservationCount { get; set; }
    public List<AdminMemberSummary> RecentMembers { get; set; } = new();
}

public class AdminMemberSummary
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string MemberType { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
}

public class AdminWorkspaceSearchResult
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminName { get; set; } = string.Empty;
    public DateTime? TrialStartDate { get; set; }
    public DateTime? SubscriptionExpiryDate { get; set; }
    public int MemberCount { get; set; }
}

public class AdminNotification
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateTime OccuredAt { get; set; }
}

public class AdminNotificationsResponse
{
    public List<AdminNotification> Notifications { get; set; } = new();
    public int TotalCount { get; set; }
}
