namespace Coworkspace.API.Services;

public class BackupService
{
    private readonly IConfiguration _config;
    private readonly ILogger<BackupService> _logger;

    public BackupService(IConfiguration config, ILogger<BackupService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task CreateBackup()
    {
        var connString = _config.GetConnectionString("DefaultConnection") ?? "";
        if (connString.StartsWith("Data Source="))
        {
            _logger.LogInformation("SQLite in use; backup copies the database file");
            var backupDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Backups");
            Directory.CreateDirectory(backupDir);
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var dbPath = connString.Replace("Data Source=", "").Trim();
            var backupFile = Path.Combine(backupDir, $"coworkspace_backup_{timestamp}.db");
            File.Copy(dbPath, backupFile, true);
            _logger.LogInformation("Backup completed: {BackupFile}", backupFile);
            CleanupOldBackups(backupDir, 30);
            return;
        }

        try
        {
            var backupDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Backups");
            Directory.CreateDirectory(backupDir);
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var backupFile = Path.Combine(backupDir, $"coworkspace_backup_{timestamp}.sql");

            var parts = connString.Split(';');
            var host = GetValue(parts, "Host") ?? "localhost";
            var database = GetValue(parts, "Database") ?? "coworkspace";
            var username = GetValue(parts, "Username") ?? "postgres";
            var port = GetValue(parts, "Port") ?? "5432";

            var process = new System.Diagnostics.Process
            {
                StartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "pg_dump",
                    Arguments = $"-h {host} -p {port} -U {username} -d {database} -F c -f \"{backupFile}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            _logger.LogInformation("Starting database backup to {BackupFile}", backupFile);
            process.Start();
            await process.WaitForExitAsync();

            if (process.ExitCode == 0)
            {
                _logger.LogInformation("Backup completed: {BackupFile}", backupFile);
                CleanupOldBackups(backupDir, 30);
            }
            else
            {
                var error = await process.StandardError.ReadToEndAsync();
                _logger.LogError("Backup failed: {Error}", error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup failed");
        }
    }

    private void CleanupOldBackups(string backupDir, int maxDays)
    {
        try
        {
            var oldFiles = Directory.GetFiles(backupDir, "coworkspace_backup_*.sql")
                .Select(f => new FileInfo(f))
                .Where(f => f.CreationTime < DateTime.Now.AddDays(-maxDays));

            foreach (var file in oldFiles)
            {
                file.Delete();
                _logger.LogInformation("Deleted old backup: {FileName}", file.Name);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to clean up old backups");
        }
    }

    private static string? GetValue(string[] parts, string key)
        => parts.FirstOrDefault(p => p.Trim().StartsWith(key, StringComparison.OrdinalIgnoreCase))
            ?.Split('=', 2).ElementAtOrDefault(1)?.Trim();
}
