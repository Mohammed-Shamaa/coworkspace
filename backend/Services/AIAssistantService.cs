using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Coworkspace.API.Services;

public class AiMessage
{
    [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
    [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
}

public class AiChatRequest
{
    public List<AiMessage> Messages { get; set; } = [];
}

public class AiResponse
{
    [JsonPropertyName("reply")] public string Reply { get; set; } = string.Empty;
}

public class AIAssistantService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;
    private readonly ILogger<AIAssistantService> _logger;
    private static readonly string SystemPrompt = BuildSystemPrompt();

    public AIAssistantService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<AIAssistantService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = config["GEMINI_API_KEY"];
        _model = config["GEMINI_MODEL"] ?? "gemini-2.0-flash";
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_apiKey);

    public async Task<AiResponse> ChatAsync(AiChatRequest request)
    {
        var contents = new List<object>();
        foreach (var msg in request.Messages)
        {
            if (msg.Role == "assistant" || msg.Role == "model")
                contents.Add(new { role = "model", parts = new[] { new { text = msg.Content } } });
            else
                contents.Add(new { role = "user", parts = new[] { new { text = msg.Content } } });
        }

        var body = new
        {
            system_instruction = new { parts = new[] { new { text = SystemPrompt } } },
            contents,
            generation_config = new
            {
                max_output_tokens = 1024,
                temperature = 0.3
            }
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };
        var json = JsonSerializer.Serialize(body, jsonOptions);
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent";

        HttpResponseMessage? response = null;
        string responseBody;
        int retries = 0;
        const int maxRetries = 2;

        while (true)
        {
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("x-goog-api-key", _apiKey);

            response = await _httpClient.SendAsync(httpRequest);
            responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
                break;

            if ((int)response.StatusCode == 429 && retries < maxRetries)
            {
                retries++;
                _logger.LogWarning("Gemini 429 rate limited, retry {Retry}/{MaxRetries} after {Delay}s", retries, maxRetries, retries);
                await Task.Delay(1000 * retries);
                continue;
            }

            string detail = ExtractErrorDetail(responseBody);
            _logger.LogError("Gemini API error: {StatusCode} {Detail}", (int)response.StatusCode, detail);
            throw new HttpRequestException($"Gemini returned {(int)response.StatusCode}: {detail}", null, response.StatusCode);
        }

        using var doc = JsonDocument.Parse(responseBody);
        var candidates = doc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() == 0)
            return new AiResponse { Reply = "" };

        var reply = candidates[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";

        return new AiResponse { Reply = reply };
    }

    private static string ExtractErrorDetail(string responseBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("error", out var errProp))
            {
                var msg = errProp.TryGetProperty("message", out var m) ? m.GetString() : null;
                var status = errProp.TryGetProperty("status", out var s) ? s.GetString() : null;
                return msg ?? status ?? responseBody;
            }
            return responseBody;
        }
        catch
        {
            return responseBody;
        }
    }

    private static string BuildSystemPrompt()
    {
        return """"
You are an intelligent support assistant for Deskora — a SaaS platform for coworking space management.

Your role is to help visitors and workspace owners understand how the platform works and guide them through tasks.

## RULES
- Respond in the SAME LANGUAGE the user wrote in (Arabic, English, or mixed).
- Answers must be clear, short, informative, and beginner-friendly.
- Do NOT make up features or capabilities that do not exist.
- If you cannot answer, say: "I don't have enough information about this. Please contact support." / "ليس لدي معلومات كافية حول هذا. يرجى التواصل مع الدعم."
- Never share internal API keys, database details, or security-sensitive information.
- Keep responses concise (3-6 sentences max unless the user asks for details).
- Use a friendly, professional tone.

## PLATFORM KNOWLEDGE

### What is Deskora?
Deskora is a SaaS platform for managing coworking spaces. It helps workspace owners handle members, desks, subscriptions, payments, analytics, and meeting rooms from a single dashboard.

### Authentication & Registration
- Anyone can sign up at /auth/register by providing company name, subdomain, full name, email, password, and optionally a WhatsApp number.
- After registration, the workspace is created with status "Pending" and awaits admin approval.
- Users can also sign in with Google via the "Sign in with Google" button on the login page.
- Google sign-in links to an existing account if the email matches, or creates a new pending workspace.
- Once approved by the admin, the workspace owner receives access and a 30-day free trial begins.
- If rejected, the user sees a rejection notice.
- Login requires email and password. Password must be at least 8 characters with uppercase, lowercase, number, and special character.

### Workspace Setup & Onboarding
- After approval, the workspace owner completes the onboarding wizard: workspace info, address, working hours, and desk configuration.
- The subdomain is chosen during registration and cannot be changed later.
- Workspace settings (company name, display name, primary color, logo) can be updated in Settings.
- Logo upload supports JPG, PNG, WebP, and GIF files up to 5 MB.

### Members Management
- Workspace owners can add members manually with details like name, phone, national ID, monthly fee, and membership dates.
- Members can be marked as paid or unpaid.
- Member details can be viewed, edited, or deleted.
- Members can be exported as PDF or Excel.
- Expired members are tracked separately.

### Desk Management
- Desks are configured during workspace setup (total desks and max capacity).
- Desk assignments and availability tracking are managed through the members section.
- Desk numbers can be assigned when adding members.

### Meeting Rooms
- Workspaces can enable a meeting room feature during onboarding.
- Meeting rooms can be booked, managed, and stats viewed from the dashboard.

### Subscriptions & Payments
- New workspaces get a 30-day free trial starting on the approval date.
- After trial expiry, the workspace subscription must be renewed.
- The admin manages subscription status (Trial, Active, Expired, Suspended).
- Members' monthly fees are tracked in the Unpaid and Payments sections.
- Payment records can be viewed and managed by the workspace owner.

### Analytics & Dashboard
- The analytics dashboard shows revenue, occupancy rates, and member trends over time.
- Charts display daily, weekly, and monthly data.
- The home dashboard provides quick overview of key metrics.

### Admin Panel
- Super admins can view all workspaces, approve or reject pending registrations, manage payments, lock/unlock workspaces, and view detailed workspace analytics.

### Settings
- Workspace settings include: company name, display name, primary color, and company logo.
- Logo can be uploaded or deleted from the settings page.
- The sidebar reflects logo and company name changes immediately after saving.

### General
- The platform supports Arabic and English languages.
- Dark mode and light mode themes are available.
- The platform is mobile-responsive and works on all devices.
"""";
    }
}
