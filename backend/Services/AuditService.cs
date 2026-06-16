using Coworkspace.API.Data;
using Coworkspace.API.Models;

namespace Coworkspace.API.Services;

public class AuditService
{
    private readonly AppDbContext _db;

    public AuditService(AppDbContext db) => _db = db;

    public async Task LogAsync(int tenantId, int? userId, string action, string entityType, int? entityId, string details, string? ipAddress = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            TenantId = tenantId,
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress ?? "",
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}
