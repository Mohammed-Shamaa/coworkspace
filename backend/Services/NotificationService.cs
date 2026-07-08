using Microsoft.EntityFrameworkCore;
using Coworkspace.API.Data;
using Coworkspace.API.Models;

namespace Coworkspace.API.Services;

public class NotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateForTenantAdminsAsync(int tenantId, string title, string message, string type, int? relatedEntityId = null, string? relatedEntityType = null)
    {
        var adminUserIds = await _context.Users
            .Where(u => u.TenantId == tenantId && (u.Role == UserRole.Admin || u.Role == UserRole.SuperAdmin))
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var userId in adminUserIds)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = userId,
                TenantId = tenantId,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                RelatedEntityId = relatedEntityId,
                RelatedEntityType = relatedEntityType
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> MarkAllAsReadAsync(int userId)
    {
        var count = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();

        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

        return count;
    }

    public async Task<bool> DeleteAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> DeleteAllAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteDeleteAsync();
    }

    public async Task<(List<Notification> Items, int TotalCount)> GetPaginatedAsync(int userId, int page = 1, int pageSize = 20)
    {
        var query = _context.Notifications.AsNoTracking().Where(n => n.UserId == userId);
        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
