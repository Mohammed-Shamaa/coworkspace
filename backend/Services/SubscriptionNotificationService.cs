using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Services;

public class SubscriptionNotificationService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<SubscriptionNotificationService> _logger;

    public SubscriptionNotificationService(IServiceProvider services, ILogger<SubscriptionNotificationService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Subscription notification service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var notifService = scope.ServiceProvider.GetRequiredService<NotificationService>();

                var now = DateTime.UtcNow;

                var tenants = await db.Tenants
                    .Where(t => t.Status == TenantStatus.Approved)
                    .Select(t => new { t.Id, t.CompanyName, t.TrialStartDate, t.SubscriptionExpiryDate, t.PaymentStatus })
                    .ToListAsync(stoppingToken);

                foreach (var tenant in tenants)
                {
                    if (tenant.TrialStartDate.HasValue && tenant.PaymentStatus == TenantPaymentStatus.Trial)
                    {
                        var trialEnd = tenant.TrialStartDate.Value.AddDays(30);
                        var daysLeft = (trialEnd - now).TotalDays;

                        if (daysLeft is >= 1 and <= 3)
                        {
                            await notifService.CreateForTenantAdminsAsync(
                                tenant.Id,
                                "Trial Ending Soon",
                                $"Your trial for \"{tenant.CompanyName}\" will end in {(int)daysLeft} day(s). Please set up payment to continue using your workspace.",
                                "trial_ending_soon");
                        }

                        if (trialEnd <= now)
                        {
                            await notifService.CreateForTenantAdminsAsync(
                                tenant.Id,
                                "Trial Ended",
                                $"Your trial for \"{tenant.CompanyName}\" has ended. Please renew your subscription to regain access.",
                                "trial_ended");
                        }
                    }

                    if (tenant.SubscriptionExpiryDate.HasValue)
                    {
                        var daysLeft = (tenant.SubscriptionExpiryDate.Value - now).TotalDays;

                        if (daysLeft is >= 1 and <= 7)
                        {
                            await notifService.CreateForTenantAdminsAsync(
                                tenant.Id,
                                "Subscription Expiring Soon",
                                $"Your subscription for \"{tenant.CompanyName}\" will expire in {(int)daysLeft} day(s). Please renew to avoid service interruption.",
                                "subscription_expiring_soon");
                        }

                        if (tenant.SubscriptionExpiryDate.Value <= now && tenant.PaymentStatus != TenantPaymentStatus.Expired)
                        {
                            await notifService.CreateForTenantAdminsAsync(
                                tenant.Id,
                                "Subscription Expired",
                                $"Your subscription for \"{tenant.CompanyName}\" has expired. Please renew to restore access.",
                                "subscription_expired");
                        }
                    }
                }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Subscription notification check failed");
            }
        }
    }
}
