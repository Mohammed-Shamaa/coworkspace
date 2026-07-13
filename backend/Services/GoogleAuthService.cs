using System.Text.Json.Serialization;
using Coworkspace.API.Data;

namespace Coworkspace.API.Services;

public class GoogleTokenPayload
{
    [JsonPropertyName("sub")] public string Subject { get; set; } = string.Empty;
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("aud")] public string Audience { get; set; } = string.Empty;
    [JsonPropertyName("iss")] public string Issuer { get; set; } = string.Empty;
}

public class GoogleAuthService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(HttpClient httpClient, AppDbContext db, IConfiguration config, ILogger<GoogleAuthService> logger)
    {
        _httpClient = httpClient;
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<GoogleTokenPayload?> ValidateGoogleTokenAsync(string idToken)
    {
        try
        {
            var clientId = _config["Google:ClientId"];
            if (string.IsNullOrEmpty(clientId))
            {
                _logger.LogError("Google:ClientId is not configured");
                return null;
            }

            var response = await _httpClient.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}",
                HttpCompletionOption.ResponseContentRead);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Google token validation failed: {StatusCode}, {Body}",
                    response.StatusCode, body);
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<GoogleTokenPayload>();

            if (payload == null)
            {
                _logger.LogWarning("Google token info returned null payload");
                return null;
            }

            if (payload.Audience != clientId)
            {
                _logger.LogWarning("Google token audience mismatch: expected {Expected}, got {Actual}",
                    clientId, payload.Audience);
                return null;
            }

            if (string.IsNullOrEmpty(payload.Email))
            {
                _logger.LogWarning("Google token missing email claim");
                return null;
            }

            return payload;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token validation threw an exception");
            return null;
        }
    }
}
