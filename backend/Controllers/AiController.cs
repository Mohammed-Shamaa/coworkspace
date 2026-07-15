using Coworkspace.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coworkspace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly AIAssistantService _ai;
    private readonly ILogger<AiController> _logger;

    public AiController(AIAssistantService ai, ILogger<AiController> logger)
    {
        _ai = ai;
        _logger = logger;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequest request)
    {
        if (!_ai.IsConfigured)
        {
            _logger.LogWarning("AI chat requested but OPENAI_API_KEY is not configured");
            return Ok(new AiResponse { Reply = "AI assistant is not configured. Please contact support." });
        }

        if (request.Messages == null || request.Messages.Count == 0)
            return BadRequest(new { message = "At least one message is required." });

        if (request.Messages.Count > 50)
            return BadRequest(new { message = "Message limit exceeded (max 50)." });

        foreach (var msg in request.Messages)
        {
            if (string.IsNullOrWhiteSpace(msg.Content) || msg.Content.Length > 4000)
                return BadRequest(new { message = "Each message must be between 1 and 4000 characters." });
        }

        try
        {
            var result = await _ai.ChatAsync(request);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "AI service request failed");
            return StatusCode(502, new AiResponse { Reply = "The AI service is temporarily unavailable. Please try again later." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected AI chat error");
            return StatusCode(500, new AiResponse { Reply = "An unexpected error occurred. Please try again." });
        }
    }
}