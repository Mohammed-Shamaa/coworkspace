using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;

namespace Coworkspace.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private const int AnonymousMaxRequests = 100;
    private const int AuthenticatedMaxRequests = 300;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);

    public RateLimitingMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (HttpMethods.IsOptions(context.Request.Method))
        {
            await _next(context);
            return;
        }

        var isAuthenticated = context.User.Identity?.IsAuthenticated == true;
        var maxRequests = isAuthenticated ? AuthenticatedMaxRequests : AnonymousMaxRequests;

        string clientKey;
        if (isAuthenticated)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anon";
            clientKey = $"user_{userId}";
        }
        else
        {
            clientKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        var expiry = DateTime.UtcNow.Add(Window);

        var entry = _cache.GetOrCreate(clientKey, _ => new RateLimitEntry { Count = 0, ResetTime = expiry }) ?? new RateLimitEntry { Count = 0, ResetTime = expiry };
        var isRateLimited = false;
        string retryAfter;

        lock (entry)
        {
            if (entry.ResetTime <= DateTime.UtcNow)
            {
                entry.Count = 0;
                entry.ResetTime = expiry;
            }

            entry.Count++;
            if (entry.Count > maxRequests)
            {
                isRateLimited = true;
                retryAfter = entry.ResetTime.Subtract(DateTime.UtcNow).TotalSeconds.ToString("0");
            }
            else
            {
                retryAfter = "";
            }
        }

        if (isRateLimited)
        {
            context.Response.StatusCode = 429;
            context.Response.ContentType = "application/json";
            context.Response.Headers["Retry-After"] = retryAfter;
            var body = System.Text.Json.JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Rate limit exceeded. Try again in {retryAfter} seconds.",
                errorCode = "RATE_LIMIT_EXCEEDED",
                retryAfterSeconds = retryAfter
            }, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
            await context.Response.WriteAsync(body);
            return;
        }

        _cache.Set(clientKey, entry, expiry);

        await _next(context);
    }

    private class RateLimitEntry
    {
        public int Count { get; set; }
        public DateTime ResetTime { get; set; }
    }
}

public static class RateLimitingExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
        => builder.UseMiddleware<RateLimitingMiddleware>();
}
