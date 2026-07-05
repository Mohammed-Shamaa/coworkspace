namespace Coworkspace.API.DTOs;

public class AdminDashboardResponse
{
    public int TotalCompanies { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedCompanies { get; set; }
    public int RejectedCompanies { get; set; }
    public int SuspendedCompanies { get; set; }
    public int ActiveCompanies { get; set; }
    public int PaidCompanies { get; set; }
    public int UnpaidCompanies { get; set; }
    public double ApprovalRate { get; set; }
    public List<MonthlyGrowthItem> MonthlyGrowth { get; set; } = new();
    public List<CountryDistributionItem> CompaniesByCountry { get; set; } = new();
    public List<CityDistributionItem> CompaniesByCity { get; set; } = new();
    public List<WorkspaceDistributionItem> WorkspaceDistribution { get; set; } = new();
    public List<RegistrationTrendItem> RegistrationTrends { get; set; } = new();
}

public class CityDistributionItem
{
    public string City { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class WorkspaceDistributionItem
{
    public string Range { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RegistrationTrendItem
{
    public string Date { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class MonthlyGrowthItem
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CountryDistributionItem
{
    public string Country { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CompanyListItem
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public int? WorkspaceCapacity { get; set; }
    public int? MeetingRooms { get; set; }
    public int? Desks { get; set; }
    public int? Offices { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentStatus { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? ApprovedByName { get; set; }
}

public class CompanyDetailResponse
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? FullAddress { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? WorkspaceCapacity { get; set; }
    public int? NumberOfOffices { get; set; }
    public int? NumberOfMeetingRooms { get; set; }
    public int? NumberOfDesks { get; set; }
    public string? WorkspaceDescription { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? ApprovedByName { get; set; }
    public string? RejectionReason { get; set; }
    public string? SubscriptionPlan { get; set; }
    public DateTime? LastPaymentDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int UserCount { get; set; }
    public int MemberCount { get; set; }
}

public class AuditLogItem
{
    public int Id { get; set; }
    public string AdminName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? TargetEntity { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public class RejectCompanyRequest
{
    public string? Reason { get; set; }
}

public class UpdatePaymentStatusRequest
{
    public string PaymentStatus { get; set; } = "Unpaid";
}

public class EditCompanyRequest
{
    public string? CompanyName { get; set; }
    public string? OwnerName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? FullAddress { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? WorkspaceCapacity { get; set; }
    public int? NumberOfOffices { get; set; }
    public int? NumberOfMeetingRooms { get; set; }
    public int? NumberOfDesks { get; set; }
    public string? WorkspaceDescription { get; set; }
    public string? SubscriptionPlan { get; set; }
}
