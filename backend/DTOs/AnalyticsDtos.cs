namespace Coworkspace.API.DTOs;

public class AnalyticsOverviewResponse
{
    public KpiData Kpis { get; set; } = new();
    public List<AnalyticsRevenuePoint> RevenueHistory { get; set; } = new();
    public List<AnalyticsMemberGrowthPoint> MemberGrowth { get; set; } = new();
    public AnalyticsOccupancyData? Occupancy { get; set; }
    public AnalyticsPaymentStatusData? PaymentStatus { get; set; }
    public List<AnalyticsSubscriptionPoint> Subscriptions { get; set; } = new();
    public List<AnalyticsMeetingRoomPoint> MeetingRoomUsage { get; set; } = new();
    public List<AnalyticsMemberActivityPoint> MemberActivity { get; set; } = new();
    public List<AnalyticsInsight> Insights { get; set; } = new();
}

public class KpiData
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int ExpiredMembers { get; set; }
    public int UnpaidMembers { get; set; }
    public int StudentCount { get; set; }
    public int RemoteWorkerCount { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal TotalRevenue { get; set; }
    public double OccupancyRate { get; set; }
    public int TotalDesks { get; set; }
    public int OccupiedDesks { get; set; }
    public int AvailableDesks { get; set; }
    public int TotalMeetingRoomBookings { get; set; }
    public int ActiveSubscriptions { get; set; }
    public double? MembersTrend { get; set; }
    public double? RevenueTrend { get; set; }
    public double? MeetingRoomTrend { get; set; }
}

public class AnalyticsRevenuePoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class AnalyticsMemberGrowthPoint
{
    public string Month { get; set; } = string.Empty;
    public int NewMembers { get; set; }
}

public class AnalyticsOccupancyData
{
    public int Occupied { get; set; }
    public int Available { get; set; }
    public double Rate { get; set; }
}

public class AnalyticsPaymentStatusData
{
    public int Paid { get; set; }
    public int Unpaid { get; set; }
    public double PaidPercentage { get; set; }
    public double UnpaidPercentage { get; set; }
}

public class AnalyticsSubscriptionPoint
{
    public string Plan { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class AnalyticsMeetingRoomPoint
{
    public string Day { get; set; } = string.Empty;
    public int Bookings { get; set; }
}

public class AnalyticsMemberActivityPoint
{
    public string Month { get; set; } = string.Empty;
    public int NewMembers { get; set; }
    public int ExpiredMembers { get; set; }
}

public class AnalyticsInsight
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}
