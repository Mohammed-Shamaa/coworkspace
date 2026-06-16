using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Coworkspace.API.Services;

public class BillingSyncService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<BillingSyncService> _logger;

    public BillingSyncService(IServiceProvider services, ILogger<BillingSyncService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Billing sync service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTime.Today;
                var overdue = await db.Members
                    .Where(m => m.PaymentStatus == PaymentStatus.Paid
                        && m.NextDueDate != null
                        && m.NextDueDate <= now)
                    .ToListAsync(stoppingToken);

                foreach (var m in overdue)
                {
                    if (m.NoEndDate || (m.EndDate.HasValue && m.NextDueDate <= m.EndDate))
                        m.PaymentStatus = PaymentStatus.Unpaid;
                }

                if (overdue.Count > 0)
                {
                    await db.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Billing sync updated {Count} members to Unpaid", overdue.Count);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Billing sync failed");
            }
        }
    }
}
