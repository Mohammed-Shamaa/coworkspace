using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Services;

public static class BillingHelper
{
    public static string GetCurrentPaidMonthKey(Member member)
    {
        var reference = member.NextDueDate ?? member.RegistrationDate;
        return $"{reference.Year:D4}-{reference.Month:D2}";
    }

    public static (int Years, int Months, int Days) CalculateDateDuration(DateTime from, DateTime to)
    {
        if (from >= to) return (0, 0, 0);
        var years = 0;
        var cursor = from;
        while (cursor.AddYears(1) <= to) { years++; cursor = cursor.AddYears(1); }
        var months = 0;
        while (cursor.AddMonths(1) <= to) { months++; cursor = cursor.AddMonths(1); }
        var days = (int)(to - cursor).TotalDays;
        return (years, months, days);
    }

    public static string FormatDateDuration(DateTime from, DateTime to)
    {
        if (from >= to) return string.Empty;
        var (years, months, days) = CalculateDateDuration(from, to);
        var parts = new List<string>();
        if (years > 0) parts.Add($"{years} Year{(years != 1 ? "s" : "")}");
        if (months > 0) parts.Add($"{months} Month{(months != 1 ? "s" : "")}");
        if (days > 0) parts.Add($"{days} Day{(days != 1 ? "s" : "")}");
        return parts.Count > 0 ? string.Join(", ", parts) : string.Empty;
    }

    public static string FormatTimeDuration(TimeSpan start, TimeSpan end)
    {
        if (start >= end) return string.Empty;
        var diff = end - start;
        var hours = (int)diff.TotalHours;
        var minutes = diff.Minutes;
        var parts = new List<string>();
        if (hours > 0) parts.Add($"{hours} Hour{(hours != 1 ? "s" : "")}");
        if (minutes > 0) parts.Add($"{minutes} Minute{(minutes != 1 ? "s" : "")}");
        return parts.Count > 0 ? string.Join(", ", parts) : string.Empty;
    }

    public static string FormatTimePeriod(DateTime? endDate, bool noEndDate, DateTime registrationDate, TimeSpan startTime, TimeSpan endTime)
    {
        if (noEndDate || endDate == null) return "Ongoing";
        var datePart = FormatDateDuration(registrationDate, endDate.Value);
        var timePart = FormatTimeDuration(startTime, endTime);
        if (string.IsNullOrEmpty(datePart)) return timePart;
        return string.IsNullOrEmpty(timePart) ? datePart : $"{datePart}, {timePart}";
    }

    public static bool IsPaymentDue(Member member)
    {
        if (member.NextDueDate == null) return true;
        if (!member.NoEndDate && member.EndDate.HasValue && member.NextDueDate.Value > member.EndDate.Value) return false;
        return member.NextDueDate.Value <= DateTime.Today;
    }


}
