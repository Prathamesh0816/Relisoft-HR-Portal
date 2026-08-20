using RelisoftHR.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace RelisoftHR.Services;

public interface IOneDriveStorageService
{
    /// <summary>
    /// Maps an employee to their ReliSoft OneDrive path and (optionally) uploads the file.
    /// Returns the stored path (OneDrive web URL when configured, else a local relative path).
    /// </summary>
    Task<string> UploadDocumentAsync(Employee employee, string documentName, byte[] content, string mimeType, CancellationToken ct = default);
}

public class OneDriveStorageService : IOneDriveStorageService
{
    private readonly IConfiguration _config;
    private readonly ILogger<OneDriveStorageService> _logger;
    private static readonly HttpClient _http = new();
    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTimeOffset _tokenExpiry;

    public OneDriveStorageService(IConfiguration config, ILogger<OneDriveStorageService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<string> UploadDocumentAsync(Employee employee, string documentName, byte[] content, string mimeType, CancellationToken ct = default)
    {
        var email = string.IsNullOrWhiteSpace(employee.Email)
            ? $"{employee.FullName.Replace(" ", ".").ToLowerInvariant()}@relisofttechnologies.com"
            : employee.Email.Trim();

        var basePath = _config["OneDrive:BasePath"];
        if (string.IsNullOrWhiteSpace(basePath))
        {
            // No OneDrive directory configured → fall back to local App_Data storage.
            var safeName = Path.GetInvalidFileNameChars().Aggregate(documentName, (cur, c) => cur.Replace(c, '_'));
            var dir = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "OneDrive", email.Replace('@', '_'));
            Directory.CreateDirectory(dir);
            var path = Path.Combine(dir, safeName);
            await System.IO.File.WriteAllBytesAsync(path, content, ct);
            return Path.GetRelativePath(Directory.GetCurrentDirectory(), path);
        }

        var tenantId = _config["OneDrive:TenantId"];
        var clientId = _config["OneDrive:ClientId"];
        var clientSecret = _config["OneDrive:ClientSecret"];
        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            // Configured base path but no Graph credentials → store under the base path locally.
            var dir = Path.Combine(basePath, email.Replace('@', '_'));
            Directory.CreateDirectory(dir);
            var path = Path.Combine(dir, documentName);
            await System.IO.File.WriteAllBytesAsync(path, content, ct);
            return path;
        }

        try
        {
            return await UploadToOneDriveAsync(tenantId, clientId, clientSecret, email, documentName, content, mimeType, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OneDrive upload failed for {Email}; falling back to local storage.", email);
            var dir = Path.Combine(basePath, email.Replace('@', '_'));
            Directory.CreateDirectory(dir);
            var path = Path.Combine(dir, documentName);
            await System.IO.File.WriteAllBytesAsync(path, content, ct);
            return path;
        }
    }

    private async Task<string> UploadToOneDriveAsync(string tenantId, string clientId, string clientSecret, string email, string fileName, byte[] content, string mimeType, CancellationToken ct)
    {
        var token = await GetAccessTokenAsync(tenantId, clientId, clientSecret, ct);
        var driveRoot = $"https://graph.microsoft.com/v1.0/users/{Uri.EscapeDataString(email)}/drive";
        var folderPath = _config["OneDrive:FolderPath"] ?? "ReliSoft HR/Documents";

        using var req = new HttpRequestMessage(HttpMethod.Put,
            $"{driveRoot}/root:/{folderPath}/{Uri.EscapeDataString(fileName)}:/content");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        req.Content = new ByteArrayContent(content);
        req.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

        using var resp = await _http.SendAsync(req, ct);
        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException($"Graph upload failed: {(int)resp.StatusCode} {await resp.Content.ReadAsStringAsync(ct)}");

        var json = await resp.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("webUrl", out var url))
            return url.GetString() ?? $"{folderPath}/{fileName}";
        return $"{folderPath}/{fileName}";
    }

    private async Task<string> GetAccessTokenAsync(string tenantId, string clientId, string clientSecret, CancellationToken ct)
    {
        // Reuse a valid cached token; only fetch a new one near expiry.
        if (_cachedToken != null && DateTimeOffset.UtcNow < _tokenExpiry)
            return _cachedToken;

        await _tokenLock.WaitAsync(ct);
        try
        {
            if (_cachedToken != null && DateTimeOffset.UtcNow < _tokenExpiry)
                return _cachedToken;

            using var req = new HttpRequestMessage(HttpMethod.Post,
                $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token");
            req.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["scope"] = "https://graph.microsoft.com/.default"
            });

            using var resp = await _http.SendAsync(req, ct);
            resp.EnsureSuccessStatusCode();
            var json = await resp.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);

            var token = doc.RootElement.GetProperty("access_token").GetString()
                ?? throw new InvalidOperationException("No access token returned.");
            var expiresIn = doc.RootElement.TryGetProperty("expires_in", out var exp) && exp.TryGetInt64(out var seconds)
                ? seconds
                : 3600;
            _cachedToken = token;
            _tokenExpiry = DateTimeOffset.UtcNow.AddSeconds(seconds: Math.Max(60, expiresIn - 300)); // refresh 5 min early
            return token;
        }
        finally
        {
            _tokenLock.Release();
        }
    }
}