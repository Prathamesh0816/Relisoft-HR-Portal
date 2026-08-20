using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

/// <summary>
/// Ensures the standard April-to-March financial-year appraisal cycle exists.
/// Cycles run from 01-Apr of the current financial year to 31-Mar of the next.
/// </summary>
public static class AppraisalCycleSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.AppraisalCycles.AnyAsync())
            return;

        var now = DateTime.Today;
        var fyStart = now.Month >= 4
            ? new DateTime(now.Year, 4, 1)
            : new DateTime(now.Year - 1, 4, 1);
        var fyEnd = fyStart.AddYears(1).AddDays(-1);

        db.AppraisalCycles.Add(new AppraisalCycle
        {
            Name = $"FY {fyStart.Year}-{fyEnd.Year % 100:00} Appraisal & Promotion Cycle",
            StartDate = fyStart,
            EndDate = fyEnd,
            Status = "Active"
        });
        await db.SaveChangesAsync();
    }
}