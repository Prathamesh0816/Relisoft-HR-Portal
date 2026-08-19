using RelisoftHR.Data;
using RelisoftHR.Models;
using System.Text.Json;

namespace RelisoftHR.Services;

public interface IAuditLogService
{
    Task LogAsync(int? actorEmployeeId, string actorName, string action, string entityType, int? entityId, string? details = null, object? before = null, object? after = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;
    public AuditLogService(AppDbContext db) => _db = db;

    public async Task LogAsync(int? actorEmployeeId, string actorName, string action, string entityType, int? entityId, string? details = null, object? before = null, object? after = null)
    {
        try
        {
            _db.AuditLogEntries.Add(new AuditLogEntry
            {
                ActorEmployeeId = actorEmployeeId,
                ActorName = string.IsNullOrWhiteSpace(actorName) ? null : actorName,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                BeforeJson = Truncate(before),
                AfterJson = Truncate(after)
            });
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Audit failures must never break the underlying operation.
        }
    }

    private static string? Truncate(object? value)
    {
        if (value == null) return null;
        var json = JsonSerializer.Serialize(value);
        return json.Length <= 500 ? json : json[..500];
    }
}