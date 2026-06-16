using System.Security.Claims;
using Coworkspace.API.Data;
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
            var tenantIdClaim = context.User.FindFirst("TenantId")?.Value;
            if (!string.IsNullOrEmpty(tenantIdClaim) && int.TryParse(tenantIdClaim, out var tenantId))
            {
                context.Items["TenantId"] = tenantId;
                var tenant = await db.Tenants.FindAsync(tenantId);
                if (tenant != null) context.Items["Tenant"] = tenant;
            }
        }

        // Also check header for subdomain-based routing
        var subdomain = context.Request.Headers["X-Tenant-Subdomain"].FirstOrDefault();
        if (!string.IsNullOrEmpty(subdomain))
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
