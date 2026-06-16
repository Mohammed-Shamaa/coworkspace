using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.DTOs;
using Coworkspace.API.Models;
using Coworkspace.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PaymentsController(AppDbContext db) => _db = db;

    private int TenantId => int.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Missing TenantId"));

    [HttpGet]
    public async Task<ActionResult<List<PaymentResponse>>> GetAll([FromQuery] int? memberId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = _db.Payments.Where(p => p.TenantId == TenantId).AsQueryable();
        if (memberId.HasValue) query = query.Where(p => p.MemberId == memberId.Value);

        var payments = await query.OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new PaymentResponse
            {
                Id = p.Id,
                PaymentDate = p.PaymentDate,
                PaymentTime = p.PaymentTime,
                Amount = p.Amount,
                Status = p.Status,
                PaidMonth = p.PaidMonth,
                RecordedByUserName = p.RecordedByUser != null ? p.RecordedByUser.FullName : null,
                CreatedAt = p.CreatedAt
            }).ToListAsync();

        return payments;
    }
}
