using Coworkspace.API.DTOs;
using Coworkspace.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(IgnoreApi = true)]
public class TestController : ControllerBase
{
    private readonly EmailService _emailService;
    private readonly ILogger<TestController> _logger;

    public TestController(EmailService emailService, ILogger<TestController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost("email-approval")]
    public async Task<IActionResult> TestApprovalEmail([FromBody] TestEmailRequest request)
    {
        if (request == null)
            return BadRequest(new { success = false, message = "Request body is required." });
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { success = false, message = "Email is required." });
        }

        var name = string.IsNullOrWhiteSpace(request.Name) ? "Test User" : request.Name;

        _logger.LogInformation("TEST endpoint invoked: sending test approval email to {Email} ({Name}) at {Timestamp}",
            request.Email, name, DateTime.UtcNow.ToString("O"));

        await _emailService.SendTestApprovalEmailAsync(request.Email, name);

        _logger.LogInformation("TEST endpoint completed for {Email}", request.Email);

        return Ok(new
        {
            success = true,
            message = "Test email request processed. Check server logs for delivery status.",
            data = new
            {
                recipient = request.Email,
                name = name,
                timestamp = DateTime.UtcNow,
                note = "No production data was modified. This was a standalone email test."
            }
        });
    }
}
