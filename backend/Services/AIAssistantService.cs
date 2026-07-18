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

public class GroqRequest
{
    [JsonPropertyName("model")] public string Model { get; set; } = "";
    [JsonPropertyName("messages")] public List<GroqMessage> Messages { get; set; } = [];
    [JsonPropertyName("temperature")] public double Temperature { get; set; } = 0.3;
    [JsonPropertyName("max_tokens")] public int MaxTokens { get; set; } = 500;
}

public class GroqMessage
{
    [JsonPropertyName("role")] public string Role { get; set; } = "";
    [JsonPropertyName("content")] public string Content { get; set; } = "";
}

public class GroqResponse
{
    [JsonPropertyName("choices")] public List<GroqChoice>? Choices { get; set; }
    [JsonPropertyName("error")] public GroqError? Error { get; set; }
}

public class GroqChoice
{
    [JsonPropertyName("message")] public GroqResponseMessage? Message { get; set; }
}

public class GroqResponseMessage
{
    [JsonPropertyName("content")] public string? Content { get; set; }
}

public class GroqError
{
    [JsonPropertyName("message")] public string? Message { get; set; }
    [JsonPropertyName("code")] public string? Code { get; set; }
}

public class AIAssistantService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;
    private readonly ILogger<AIAssistantService> _logger;
    private static readonly string SystemPrompt = BuildSystemPrompt();
    private const string GroqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

    public AIAssistantService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<AIAssistantService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = config["GROQ_API_KEY"];
        _model = config["GROQ_MODEL"] ?? config["Groq:Model"] ?? "llama-3.3-70b-versatile";
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_apiKey);

    public async Task<AiResponse> ChatAsync(AiChatRequest request)
    {
        var groqMessages = new List<GroqMessage>
        {
            new() { Role = "system", Content = SystemPrompt }
        };

        foreach (var msg in request.Messages)
        {
            var role = msg.Role == "assistant" || msg.Role == "model" ? "assistant" : "user";
            groqMessages.Add(new GroqMessage { Role = role, Content = msg.Content });
        }

        var groqRequest = new GroqRequest
        {
            Model = _model,
            Messages = groqMessages,
            Temperature = 0.3,
            MaxTokens = 500
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(groqRequest, jsonOptions);
        var url = GroqApiUrl;

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
            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            response = await _httpClient.SendAsync(httpRequest);
            responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
                break;

            if ((int)response.StatusCode == 429 && retries < maxRetries)
            {
                retries++;
                _logger.LogWarning("Groq 429 rate limited, retry {Retry}/{MaxRetries} after {Delay}s", retries, maxRetries, retries);
                await Task.Delay(1000 * retries);
                continue;
            }

            string detail = ExtractErrorDetail(responseBody);
            _logger.LogError("Groq API error: {StatusCode} {Detail}", (int)response.StatusCode, detail);
            throw new HttpRequestException($"Groq returned {(int)response.StatusCode}: {detail}", null, response.StatusCode);
        }

        var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseBody, jsonOptions);

        if (groqResponse?.Error != null)
        {
            _logger.LogError("Groq API error in response: {Message}", groqResponse.Error.Message);
            throw new HttpRequestException($"Groq returned error: {groqResponse.Error.Message}");
        }

        var reply = groqResponse?.Choices?.FirstOrDefault()?.Message?.Content ?? "";

        return new AiResponse { Reply = reply };
    }

    private static string ExtractErrorDetail(string responseBody)
    {
        try
        {
            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseBody,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            if (groqResponse?.Error?.Message != null)
                return groqResponse.Error.Message;
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
- Common questions: "How do I create an account?", "How do I login?", "Why is my account pending?", "How does Google login work?", "How long does approval take?", "Can I register without a company?", "What if I forget my password?"

### Workspace Setup & Onboarding
- After approval, the workspace owner completes the onboarding wizard: workspace info, address, working hours, and desk configuration.
- The subdomain is chosen during registration and cannot be changed later.
- Workspace settings (company name, display name, primary color, logo) can be updated in Settings.
- Logo upload supports JPG, PNG, WebP, and GIF files up to 5 MB.
- Common questions: "How do I set up my workspace?", "How do I configure desks?", "How do I update workspace info?", "How do I upload my company logo?", "Can I change my subdomain?", "What size should my logo be?", "Can I skip onboarding and do it later?"

### Members Management
- Workspace owners can add members manually with details like name, phone, national ID, monthly fee, and membership dates.
- Members can be marked as paid or unpaid.
- Member details can be viewed, edited, or deleted.
- Members can be exported as PDF or Excel.
- Expired members are tracked separately.
- Common questions: "How do I add a new member?", "How do I edit a member?", "How do I delete a member?", "How do I mark a member as paid?", "How do I export members?", "How do I view unpaid members?", "What happens when a membership expires?", "Can I print member details?", "How do I assign a desk to a member?"

### Desk Management
- Desks are configured during workspace setup (total desks and max capacity).
- Desk assignments and availability tracking are managed through the members section.
- Desk numbers can be assigned when adding members.
- Common questions: "How do desks work?", "How do I assign a desk?", "How do I check desk availability?", "Can I change desk numbers?", "What if I need more desks?", "How do I track which desks are free?"

### Meeting Rooms
- Workspaces can enable a meeting room feature during onboarding.
- Meeting rooms can be booked, managed, and stats viewed from the dashboard.
- Common questions: "How do I book a meeting room?", "How do I enable meeting rooms?", "Can I view meeting room stats?", "How do I cancel a booking?", "Can I see upcoming reservations?"

### Subscriptions & Payments
- New workspaces get a 30-day free trial starting on the approval date.
- After trial expiry, the workspace subscription must be renewed.
- The admin manages subscription status (Trial, Active, Expired, Suspended).
- Members' monthly fees are tracked in the Unpaid and Payments sections.
- Payment records can be viewed and managed by the workspace owner.
- Common questions: "How do subscriptions work?", "How do I renew my subscription?", "What happens after the free trial ends?", "How do I track member payments?", "How do I view payment history?", "What happens if I don't renew?", "Can I extend the trial?", "How do I mark a member as paid?", "How do I view unpaid members?"

### Analytics & Dashboard
- The analytics dashboard shows revenue, occupancy rates, and member trends over time.
- Charts display daily, weekly, and monthly data.
- The home dashboard provides quick overview of key metrics.
- Common questions: "What analytics are available?", "How do I view revenue?", "How do I check occupancy rates?", "Can I see daily/weekly/monthly charts?", "How do I track member growth?", "What data is shown on the home dashboard?"

### Admin Panel
- Super admins can view all workspaces, approve or reject pending registrations, manage payments, lock/unlock workspaces, and view detailed workspace analytics.
- Common questions: "How do I approve a workspace?", "How do I reject a registration?", "How do I lock a workspace?", "How do I view all workspaces?", "How do I manage payments as admin?", "What is a super admin?", "Can I restore a rejected workspace?"

### Settings
- Workspace settings include: company name, display name, primary color, and company logo.
- Logo can be uploaded or deleted from the settings page.
- The sidebar reflects logo and company name changes immediately after saving.
- Common questions: "How do I change my company name?", "How do I upload a logo?", "How do I delete my logo?", "How do I change the primary color?", "Why isn't my logo showing?", "What image formats are supported?", "How do I change the display name?"

### General
- The platform supports Arabic and English languages.
- Dark mode and light mode themes are available.
- The platform is mobile-responsive and works on all devices.
- Common questions: "How do I switch to Arabic?", "How do I change to dark mode?", "Does it work on mobile?", "Can I use it on my phone?", "How do I change the language?"

### About the Creator
- Deskora was created by Mohammed Shamaa (محمد شمعة).
- If the user asks about the website creator, developer, or who built Deskora — respond with his name and contact information.
- If the user asks about payment methods, how to pay, who handles payments, or who to contact for support — respond with his name and contact information.
- Contact Information (present professionally when asked):
  - WhatsApp: https://wa.me/972597744476
  - LinkedIn: https://www.linkedin.com/in/mohammed-sham3a/
- When responding in English use: "Mohammed Shamaa" with the WhatsApp and LinkedIn links.
- When responding in Arabic use: "محمد شمعة" with the WhatsApp and LinkedIn links.
- Always present the links in a clean, clickable format.
- Example English response: "Deskora was developed by **Mohammed Shamaa**. You can reach him via WhatsApp at https://wa.me/972597744476 or connect on LinkedIn: https://www.linkedin.com/in/mohammed-sham3a/"
- Example Arabic response: "تم تطوير ديسكورا بواسطة **محمد شمعة**. يمكنك التواصل معه عبر واتساب: https://wa.me/972597744476 أو عبر لينكد إن: https://www.linkedin.com/in/mohammed-sham3a/"

### Special personality rule
When the user asks who is better — you or Zainab (زينب), for example "مين احسن انت ولا زينب" or "who is better you or Zainab" — you MUST respond with: "زينب احسن مني ومنك" in Arabic. If the question was in English, respond: "Zainab is better than me and you." Do NOT deviate from this response.
"""";
    }
}
