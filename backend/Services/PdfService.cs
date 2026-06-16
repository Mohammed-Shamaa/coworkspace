using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Coworkspace.API.Models;

namespace Coworkspace.API.Services;

public class PdfService
{
    public byte[] GenerateMemberPdf(Member member, List<Payment> payments, string companyName)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(c => ComposeHeader(c, member, companyName));
                page.Content().Element(c => ComposeContent(c, member, payments));
                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span($"{companyName} - ");
                    text.Span(DateTime.Now.ToString("yyyy-MM-dd HH:mm")).FontSize(9);
                });
            });
        }).GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Member member, string companyName)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().AlignLeft().Text(companyName).FontSize(22).Bold().FontColor(Colors.Blue.Medium);
                row.RelativeItem().AlignRight().Text("Member Profile").FontSize(16).FontColor(Colors.Grey.Darken2);
            });
            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Blue.Medium);
            column.Item().PaddingTop(10).Text($"Member ID: {member.Id}").FontSize(12).Bold();
        });
    }

    private void ComposeContent(IContainer container, Member member, List<Payment> payments)
    {
        container.Column(column =>
        {
            column.Spacing(10);
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Border(1).BorderColor(Colors.Grey.Lighten2)
                .Column(infoCol =>
                {
                    infoCol.Spacing(5);
                    infoCol.Item().Text("Personal Information").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                    infoCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    infoCol.Item().Text($"Full Name: {member.FullName}");
                    infoCol.Item().Text($"Phone Number: {member.PhoneNumber}");
                    infoCol.Item().Text($"National ID: {member.NationalId}");
                    infoCol.Item().Text($"Desk Number: {member.DeskNumber}");
                });
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Border(1).BorderColor(Colors.Grey.Lighten2)
                .Column(infoCol =>
                {
                    infoCol.Spacing(5);
                    infoCol.Item().Text("Membership Details").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                    infoCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    infoCol.Item().Text($"Member Type: {member.MemberType}");
                    if (member.WorkerType.HasValue) infoCol.Item().Text($"Worker Type: {member.WorkerType}");
                    infoCol.Item().Text($"Registration Date: {member.RegistrationDate:yyyy-MM-dd}");
                    infoCol.Item().Text($"End Date: {(member.NoEndDate ? "Active Until Removed" : member.EndDate?.ToString("yyyy-MM-dd") ?? "Not Set")}");
                    if (member.EndDate.HasValue && !member.NoEndDate)
                    {
                        var durStr = BillingHelper.FormatDateDuration(member.RegistrationDate, member.EndDate.Value);
                        infoCol.Item().Text($"Subscription Duration: {durStr}");
                    }
                    var plan = member.AttendancePlan == AttendancePlan.ThreeDaysPerWeek ? "3 Days/Week" : "6 Days/Week";
                    if (member.AttendanceSchedule.HasValue)
                    {
                        var days = member.AttendanceSchedule.Value switch
                        {
                            AttendanceSchedule.SaturdayMondayWednesday => "Sat, Mon, Wed",
                            AttendanceSchedule.SundayTuesdayThursday => "Sun, Tue, Thu",
                            _ => ""
                        };
                        plan += $" ({days})";
                    }
                    infoCol.Item().Text($"Attendance Plan: {plan}");
                    infoCol.Item().Text($"Working Hours: {member.StartTime:hh\\:mm} - {member.EndTime:hh\\:mm} = {BillingHelper.FormatTimeDuration(member.StartTime, member.EndTime)}");
                    infoCol.Item().Text($"Monthly Fee: ${member.MonthlyFee:F2}");
                    infoCol.Item().Text($"Payment Status: {member.PaymentStatus}");
                });
            column.Item().PaddingTop(10).Text("Payment History").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            if (payments.Count == 0)
            {
                column.Item().PaddingTop(5).Text("No payment records found.").Italic();
            }
            else
            {
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });
                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Date").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Time").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Amount").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Status").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Blue.Medium).Padding(5).Text("Month").FontColor(Colors.White).Bold();
                    });
                    foreach (var payment in payments.OrderBy(p => p.PaymentDate))
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(payment.PaymentDate.ToString("yyyy-MM-dd"));
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(payment.PaymentTime);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"${payment.Amount:F2}");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(payment.Status);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(string.IsNullOrEmpty(payment.PaidMonth) ? "-" : payment.PaidMonth);
                    }
                });
            }
        });
    }
}
