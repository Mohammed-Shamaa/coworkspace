using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Coworkspace.API.Services;

public class AiRequest
{
    [JsonPropertyName("messages")] public List<AiMessage> Messages { get; set; } = [];
}

public class AiMessage
{
    [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
    [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
}

public class AiResponse
{
    [JsonPropertyName("reply")] public string Reply { get; set; } = string.Empty;
}

public class AiChatRequest
{
    public List<AiMessage> Messages { get; set; } = [];
}

public class AIAssistantService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;
    private readonly string _apiUrl;
    private static readonly string SystemPrompt = BuildSystemPrompt();

    public AIAssistantService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = config["OPENAI_API_KEY"];
        _model = config["OPENAI_MODEL"] ?? "gpt-4o-mini";
        _apiUrl = config["OPENAI_API_URL"] ?? "https://api.openai.com/v1/chat/completions";
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_apiKey);

    public async Task<AiResponse> ChatAsync(AiChatRequest request)
    {
        var fullMessages = new List<object>
        {
            new { role = "system", content = SystemPrompt }
        };

        foreach (var msg in request.Messages)
        {
            fullMessages.Add(new { role = msg.Role, content = msg.Content });
        }

        var body = new
        {
            model = _model,
            messages = fullMessages,
            max_tokens = 1024,
            temperature = 0.3
        };

        var json = JsonSerializer.Serialize(body);
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, _apiUrl)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        var reply = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        return new AiResponse { Reply = reply };
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