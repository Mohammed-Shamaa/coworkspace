using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Coworkspace.API.Services;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("Missing NameIdentifier"));

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _notificationService.GetPaginatedAsync(UserId, page, pageSize);
        var unreadCount = await _notificationService.GetUnreadCountAsync(UserId);

        return Ok(new
        {
            data = new
            {
                notifications = items.Select(n => new
                {
                    id = n.Id,
                    title = n.Title,
                    message = n.Message,
                    type = n.Type,
                    isRead = n.IsRead,
                    createdAt = n.CreatedAt,
                    relatedEntityId = n.RelatedEntityId,
                    relatedEntityType = n.RelatedEntityType
                }),
                totalCount,
                unreadCount,
                page,
                pageSize
            }
        });
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(UserId);
        return Ok(new { data = new { unreadCount = count } });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id, UserId);
        if (!result) return NotFound(new { message = "Notification not found" });

        return Ok(new { message = "Notification marked as read" });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var count = await _notificationService.MarkAllAsReadAsync(UserId);
        return Ok(new { message = $"{count} notifications marked as read", data = new { count } });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _notificationService.DeleteAsync(id, UserId);
        if (!result) return NotFound(new { message = "Notification not found" });

        return Ok(new { message = "Notification deleted" });
    }

    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAll()
    {
        var count = await _notificationService.DeleteAllAsync(UserId);
        return Ok(new { message = $"{count} notifications deleted", data = new { count } });
    }
}
