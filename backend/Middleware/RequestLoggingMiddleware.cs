using System.Diagnostics;

namespace Coworkspace.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path;

        try
        {
            await _next(context);
        }
        catch
        {
            // Log the failed request before the exception propagates to
            // ExceptionHandlingMiddleware. Without this catch, the logging
            // line after _next is skipped and errors become invisible in logs.
            sw.Stop();
            _logger.LogWarning("{Method} {Path} threw after {ElapsedMs}ms — see ExceptionHandlingMiddleware for details",
                method, path, sw.ElapsedMilliseconds);
            throw;
        }

        sw.Stop();
        var statusCode = context.Response.StatusCode;
        _logger.LogInformation("{Method} {Path} responded {StatusCode} in {ElapsedMs}ms",
            method, path, statusCode, sw.ElapsedMilliseconds);
    }
}
