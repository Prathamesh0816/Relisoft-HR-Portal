using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public interface IInternCompensationService
{
    Task<bool> IsEligibleForPayAsync(int employeeId, DateTime asOf);
    Task<List<InternPayStatusDto>> EvaluateAllAsync(DateTime asOf);
}

/// <summary>
/// Intern compensation policy:
///  - Internship probation runs 6 months.
///  - First 3 months are unpaid. After 3 months the intern becomes paid based on performance.
///  - If performance is good (latest appraisal FinalRating >= 4), pay can start from the 2nd month.
/// Unpaid interns are excluded from payroll generation entirely.
/// </summary>
public sealed class InternCompensationService : IInternCompensationService
{
    private const int UnpaidMonths = 3;
    private const int EarlyPayMonths = 2;
    private const int GoodRating = 4;
    private readonly AppDbContext _db;

    public InternCompensationService(AppDbContext db) => _db = db;

    public async Task<bool> IsEligibleForPayAsync(int employeeId, DateTime asOf)
    {
        var employee = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId);
        if (employee == null) return false;
        if (employee.EmploymentType != "Intern" && employee.EmploymentType != "Probation") return true;

        var probation = await _db.EmployeeProbations.AsNoTracking()
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.Status != "Confirmed" && p.Status != "Separated");
        if (probation == null) return !employee.IsUnpaidIntern;

        var months = MonthsBetween(probation.StartDate, asOf);
        if (months >= UnpaidMonths) return true;
        if (months >= EarlyPayMonths && await HasGoodPerformanceAsync(employeeId)) return true;
        return false;
    }

    public async Task<List<InternPayStatusDto>> EvaluateAllAsync(DateTime asOf)
    {
        var interns = await _db.Employees.AsNoTracking()
            .Where(e => e.EmploymentType == "Intern" || e.EmploymentType == "Probation")
            .ToListAsync();

        var result = new List<InternPayStatusDto>();
        foreach (var emp in interns)
        {
            result.Add(new InternPayStatusDto(
                emp.Id, emp.FullName, emp.EmployeeCode, emp.EmploymentType,
                await IsEligibleForPayAsync(emp.Id, asOf)));
        }
        return result;
    }

    private async Task<bool> HasGoodPerformanceAsync(int employeeId)
    {
        var rating = await _db.EmployeeAppraisals.AsNoTracking()
            .Where(a => a.EmployeeId == employeeId && a.FinalRating.HasValue)
            .OrderByDescending(a => a.CompletedOn ?? a.CreatedOn)
            .Select(a => (int?)a.FinalRating)
            .FirstOrDefaultAsync();
        return rating.HasValue && rating.Value >= GoodRating;
    }

    private static int MonthsBetween(DateTime start, DateTime asOf)
    {
        if (asOf <= start) return 0;
        return ((asOf.Year - start.Year) * 12) + (asOf.Month - start.Month);
    }
}

public record InternPayStatusDto(int EmployeeId, string FullName, string EmployeeCode, string EmploymentType, bool IsEligibleForPay);