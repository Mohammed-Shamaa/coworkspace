using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Coworkspace.API.Services;

public class EmailService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private const string ResendApiUrl = "https://api.resend.com/emails";
    private const string SenderEmail = "Deskora <onboarding@resend.dev>";

    public EmailService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<EmailService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendApprovalEmailAsync(string email, string companyName)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("SendApprovalEmail skipped: empty email");
            return;
        }

        var apiKey = _configuration["Resend:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("SendApprovalEmail skipped: Resend:ApiKey not configured");
            return;
        }

        try
        {
            var payload = new
            {
                from = SenderEmail,
                to = new[] { email },
                subject = "Welcome to Deskora \U0001F389",
                html = BuildApprovalHtml(companyName)
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await client.PostAsync(ResendApiUrl, content);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Approval email sent to {Email}, response: {Body}", email, body);
            }
            else
            {
                var msg = $"Resend API error ({response.StatusCode}): {body}";
                _logger.LogError("Failed to send approval email to {Email}. {Msg}", email, msg);
                throw new InvalidOperationException(msg);
            }
        }
        catch (InvalidOperationException) { throw; }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception sending approval email to {Email}", email);
            throw;
        }
    }

    private static string BuildApprovalHtml(string companyName)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Welcome to Deskora</title>
</head>
<body style=""margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f4f6f9;padding:40px 20px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" max-width=""520"" style=""max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"">
          <tr>
            <td style=""background:linear-gradient(135deg,#1565C0,#0d47a1);padding:32px 40px;text-align:center;"">
              <h1 style=""margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;"">Deskora</h1>
              <p style=""margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;"">Your workspace management platform</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:32px 40px;"">
              <h2 style=""margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:600;"">Welcome to Deskora! 🎉</h2>
              <p style=""margin:0 0 6px;color:#555;font-size:15px;line-height:1.6;"">Your account has been approved successfully.</p>
              {(string.IsNullOrEmpty(companyName) ? "" : $@"<p style=""margin:0 0 6px;color:#555;font-size:15px;line-height:1.6;"">Workspace: <strong style=""color:#1565C0;"">{companyName}</strong></p>")}
              <p style=""margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;"">You can now access the Deskora dashboard and start managing your workspace.</p>
              <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 24px;"">
                <tr>
                  <td style=""background:#1565C0;border-radius:8px;padding:12px 28px;"">
                    <a href=""https://deskora.com/dashboard"" style=""color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;"">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
              <hr style=""border:none;border-top:1px solid #e0e0e0;margin:24px 0 16px;"" />
              <p style=""margin:0;color:#999;font-size:12px;line-height:1.5;"">
                If you have any questions, reply to this email or contact our support team.<br />
                &copy; {DateTime.UtcNow.Year} Deskora. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }
}
