using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public sealed class HttpPreconditionException(int statusCode, string title, string detail)
    : Exception(detail)
{
    public int StatusCode { get; } = statusCode;
    public string Title { get; } = title;
}

public static class HttpConcurrency
{
    public const string PreconditionAppliedKey = "RelisoftHR.IfMatchApplied";

    public static void RequireIfMatch<TEntity>(
        HttpRequest request,
        AppDbContext db,
        TEntity entity)
        where TEntity : class, IHasRowVersion
    {
        if (!request.Headers.TryGetValue("If-Match", out StringValues values) ||
            StringValues.IsNullOrEmpty(values))
        {
            throw new HttpPreconditionException(
                StatusCodes.Status428PreconditionRequired,
                "An If-Match header is required",
                "Reload the latest record and retry with its rowVersion value.");
        }

        var rawValue = values.ToString().Trim();
        if (rawValue.Contains(',') || rawValue == "*" ||
            rawValue.StartsWith("W/", StringComparison.OrdinalIgnoreCase) ||
            rawValue.Length < 3 || rawValue[0] != '"' || rawValue[^1] != '"')
        {
            throw InvalidIfMatch();
        }

        byte[] expectedVersion;
        try
        {
            expectedVersion = Convert.FromBase64String(rawValue[1..^1]);
        }
        catch (FormatException)
        {
            throw InvalidIfMatch();
        }

        if (expectedVersion.Length != 8)
            throw InvalidIfMatch();

        var rowVersion = db.Entry(entity).Property(model => model.RowVersion);
        if (!rowVersion.Metadata.IsConcurrencyToken)
            throw new InvalidOperationException($"{typeof(TEntity).Name} is not configured for optimistic concurrency.");

        rowVersion.OriginalValue = expectedVersion;
        request.HttpContext.Items[PreconditionAppliedKey] = true;
    }

    public static void SetETag(HttpResponse response, byte[]? rowVersion)
    {
        if (rowVersion is { Length: > 0 })
            response.Headers.ETag = $"\"{Convert.ToBase64String(rowVersion)}\"";
    }

    private static HttpPreconditionException InvalidIfMatch() => new(
        StatusCodes.Status400BadRequest,
        "The If-Match header is invalid",
        "If-Match must contain one quoted Base64 rowVersion value.");
}
