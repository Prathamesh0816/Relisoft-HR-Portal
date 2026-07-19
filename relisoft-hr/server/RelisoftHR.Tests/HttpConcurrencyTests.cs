using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class HttpConcurrencyTests
{
    [Fact]
    public void If_match_sets_the_expected_ef_original_value()
    {
        using var db = TestDbContext.Create();
        var employee = db.Employees.Find(3)!;
        var expectedVersion = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers.IfMatch = $"\"{Convert.ToBase64String(expectedVersion)}\"";

        HttpConcurrency.RequireIfMatch(httpContext.Request, db, employee);

        Assert.Equal(
            expectedVersion,
            db.Entry(employee).Property(model => model.RowVersion).OriginalValue);
        Assert.True(httpContext.Items.ContainsKey(HttpConcurrency.PreconditionAppliedKey));
    }

    [Fact]
    public void Missing_if_match_returns_precondition_required()
    {
        using var db = TestDbContext.Create();
        var employee = db.Employees.Find(3)!;
        var httpContext = new DefaultHttpContext();

        var exception = Assert.Throws<HttpPreconditionException>(() =>
            HttpConcurrency.RequireIfMatch(httpContext.Request, db, employee));

        Assert.Equal(StatusCodes.Status428PreconditionRequired, exception.StatusCode);
    }

    [Theory]
    [InlineData("*")]
    [InlineData("W/\"AQIDBAUGBwg=\"")]
    [InlineData("not-an-etag")]
    [InlineData("\"invalid-base64\"")]
    public void Invalid_if_match_returns_bad_request(string value)
    {
        using var db = TestDbContext.Create();
        var employee = db.Employees.Find(3)!;
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers.IfMatch = value;

        var exception = Assert.Throws<HttpPreconditionException>(() =>
            HttpConcurrency.RequireIfMatch(httpContext.Request, db, employee));

        Assert.Equal(StatusCodes.Status400BadRequest, exception.StatusCode);
    }

    [Fact]
    public async Task Stale_http_precondition_is_reported_as_precondition_failed()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();
        httpContext.Items[HttpConcurrency.PreconditionAppliedKey] = true;
        var handler = new DatabaseExceptionHandler();

        var handled = await handler.TryHandleAsync(
            httpContext,
            new DbUpdateConcurrencyException(),
            CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status412PreconditionFailed, httpContext.Response.StatusCode);
    }
}
