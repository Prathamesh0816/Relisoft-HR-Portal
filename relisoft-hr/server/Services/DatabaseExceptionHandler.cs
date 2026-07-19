using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace RelisoftHR.Services;

public sealed class DatabaseExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problem = exception switch
        {
            HttpPreconditionException precondition => new ProblemDetails
            {
                Status = precondition.StatusCode,
                Title = precondition.Title,
                Detail = precondition.Message
            },
            DbUpdateConcurrencyException when
                httpContext.Items.ContainsKey(HttpConcurrency.PreconditionAppliedKey) => new ProblemDetails
            {
                Status = StatusCodes.Status412PreconditionFailed,
                Title = "The supplied version is stale",
                Detail = "Reload the latest data, review the changes, and retry with its rowVersion value."
            },
            DbUpdateConcurrencyException => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "The record was changed by another request",
                Detail = "Reload the latest data and try the operation again."
            },
            DbUpdateException { InnerException: SqlException sqlException }
                when sqlException.Number is 2601 or 2627 => new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "The operation conflicts with existing data",
                    Detail = "A record with the same unique values already exists."
                },
            DbUpdateException { InnerException: SqlException sqlException }
                when sqlException.Number == 547 => new ProblemDetails
                {
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Title = "The data violates a database rule",
                    Detail = "Check referenced records, date ranges, and numeric values."
                },
            _ => null
        };

        if (problem == null)
            return false;

        httpContext.Response.StatusCode = problem.Status!.Value;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
