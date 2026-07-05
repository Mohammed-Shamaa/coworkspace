using System.Security.Claims;
using Coworkspace.API.Data;
using Coworkspace.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Coworkspace.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
            var isSuperAdmin = roleClaim == "SuperAdmin";

            if (isSuperAdmin)
            {
                context.Items["TenantId"] = -1;
                context.Items["IsSuperAdmin"] = true;
            }
            else
            {
                var tenantIdClaim = context.User.FindFirst("TenantId")?.Value;
                if (!string.IsNullOrEmpty(tenantIdClaim) && int.TryParse(tenantIdClaim, out var tenantId))
                {
                    context.Items["TenantId"] = tenantId;
                }
            }
        }

        var subdomain = context.Request.Headers["X-Tenant-Subdomain"].FirstOrDefault();
        if (!string.IsNullOrEmpty(subdomain) && context.Items["TenantId"] == null)
        {
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Subdomain == subdomain);
            if (tenant != null)
            {
                context.Items["TenantId"] = tenant.Id;
                context.Items["Tenant"] = tenant;
            }
        }

        await _next(context);
    }
}

public static class TenantMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
        => builder.UseMiddleware<TenantMiddleware>();
}
