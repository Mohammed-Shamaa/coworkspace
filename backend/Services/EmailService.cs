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

    public async Task SendApprovalEmailAsync(string email, string fullName)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("SendApprovalEmailAsync skipped: empty email");
            return;
        }

        var apiKey = _configuration["RESEND_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("SendApprovalEmailAsync skipped: RESEND_API_KEY not configured");
            return;
        }

        try
        {
            var payload = new
            {
                from = SenderEmail,
                to = new[] { email },
                subject = "Your Deskora account has been approved \U0001F389",
                html = BuildApprovalHtml(fullName)
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
                _logger.LogError("Failed to send approval email to {Email}. Status: {Status}, Body: {Body}", email, response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception sending approval email to {Email}", email);
        }
    }

    public async Task SendTestApprovalEmailAsync(string email, string fullName)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("SendTestApprovalEmailAsync skipped: empty email");
            return;
        }

        var apiKey = _configuration["RESEND_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("SendTestApprovalEmailAsync skipped: RESEND_API_KEY not configured");
            return;
        }

        try
        {
            var now = DateTime.UtcNow;
            var payload = new
            {
                from = SenderEmail,
                to = new[] { email },
                subject = "TEST - Deskora Approval Email System",
                html = BuildTestApprovalHtml(fullName, now)
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await client.PostAsync(ResendApiUrl, content);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("TEST email sent successfully to {Email} at {Timestamp}. Resend response: {Body}", email, now.ToString("O"), body);
            }
            else
            {
                _logger.LogError("TEST email FAILED to {Email}. Status: {Status}, Body: {Body}", email, response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TEST email exception for {Email}", email);
        }
    }

    private static string BuildTestApprovalHtml(string fullName, DateTime timestamp)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Deskora Email Test</title>
</head>
<body style=""margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f0f2f5;padding:48px 20px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">
          <tr>
            <td style=""background:linear-gradient(135deg,#e65100,#bf360c);padding:40px 48px;text-align:center;"">
              <h1 style=""margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;"">TEST EMAIL</h1>
              <p style=""margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;"">Deskora Approval Email System</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:40px 48px;"">
              <div style=""background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:12px 16px;margin-bottom:24px;"">
                <p style=""margin:0;color:#e65100;font-size:13px;font-weight:600;"">This is a system test. No production action was taken.</p>
              </div>
              <p style=""margin:0 0 20px;color:#1a1a2e;font-size:16px;font-weight:600;"">Hello {fullName},</p>
              <p style=""margin:0 0 12px;color:#4a4a6a;font-size:15px;line-height:1.7;"">This is a test of the Deskora approval email system.</p>
              <p style=""margin:0 0 6px;color:#4a4a6a;font-size:15px;line-height:1.7;"">If you received this, the email system is working correctly.</p>
              <p style=""margin:0 0 28px;color:#4a4a6a;font-size:15px;line-height:1.7;""><strong>Timestamp:</strong> {timestamp:yyyy-MM-dd HH:mm:ss} UTC</p>
              <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 32px;"">
                <tr>
                  <td style=""background:#e65100;border-radius:8px;padding:14px 32px;"">
                    <span style=""color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;"">System Status: Operational</span>
                  </td>
                </tr>
              </table>
              <hr style=""border:none;border-top:1px solid #e8e8ef;margin:0 0 20px;"" />
              <p style=""margin:0;color:#a0a0b8;font-size:13px;line-height:1.5;"">
                &copy; {timestamp.Year} Deskora. All rights reserved.
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

    private static string BuildApprovalHtml(string fullName)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Welcome to Deskora</title>
</head>
<body style=""margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f0f2f5;padding:48px 20px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">
          <tr>
            <td style=""background:linear-gradient(135deg,#1565C0,#0d47a1);padding:40px 48px;text-align:center;"">
              <h1 style=""margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;"">Welcome to Deskora</h1>
            </td>
          </tr>
          <tr>
            <td style=""padding:40px 48px;"">
              <p style=""margin:0 0 20px;color:#1a1a2e;font-size:16px;font-weight:600;"">Hello {fullName},</p>
              <p style=""margin:0 0 12px;color:#4a4a6a;font-size:15px;line-height:1.7;"">Your workspace registration has been approved successfully.</p>
              <p style=""margin:0 0 28px;color:#4a4a6a;font-size:15px;line-height:1.7;"">You can now access your dashboard and start managing your workspace.</p>
              <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 32px;"">
                <tr>
                  <td style=""background:#1565C0;border-radius:8px;padding:14px 32px;"">
                    <a href=""https://deskora.com/dashboard"" style=""color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;"">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
              <hr style=""border:none;border-top:1px solid #e8e8ef;margin:0 0 20px;"" />
              <p style=""margin:0;color:#a0a0b8;font-size:13px;line-height:1.5;"">
                If you have any questions, please contact our support team.<br />
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
