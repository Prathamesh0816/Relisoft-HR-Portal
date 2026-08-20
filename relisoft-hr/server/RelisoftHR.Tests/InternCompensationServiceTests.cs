using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class InternCompensationServiceTests : IDisposable
{
    private readonly AppDbContext _db = TestDbContext.Create();
    private readonly InternCompensationService _service;

    public InternCompensationServiceTests() => _service = new InternCompensationService(_db);

    public void Dispose() => _db.Dispose();

    private async Task<Employee> AddIntern(int id, string employmentType, DateTime joinDate, bool unpaid)
    {
        var emp = new Employee
        {
            Id = id,
            EmployeeCode = $"EMP-{id:000}",
            FullName = $"Intern {id}",
            Email = $"intern{id}@relisofttechnologies.com",
            EmploymentType = employmentType,
            JoinDate = joinDate,
            RoleId = 1,
            IsUnpaidIntern = unpaid
        };
        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();
        return emp;
    }

    [Fact]
    public async Task Intern_EligibleAfterThreeMonths()
    {
        await AddIntern(50, "Intern", new DateTime(2026, 1, 10), true);
        _db.EmployeeProbations.Add(new EmployeeProbation
        {
            EmployeeId = 50, StartDate = new DateTime(2026, 1, 10),
            OriginalEndDate = new DateTime(2026, 7, 10), CurrentEndDate = new DateTime(2026, 7, 10),
            Status = "Probation"
        });
        await _db.SaveChangesAsync();

        Assert.False(await _service.IsEligibleForPayAsync(50, new DateTime(2026, 3, 1)));
        Assert.True(await _service.IsEligibleForPayAsync(50, new DateTime(2026, 4, 10)));
    }

    [Fact]
    public async Task Intern_GoodPerformance_PaidFromSecondMonth()
    {
        await AddIntern(51, "Intern", new DateTime(2026, 1, 10), true);
        _db.EmployeeProbations.Add(new EmployeeProbation
        {
            EmployeeId = 51, StartDate = new DateTime(2026, 1, 10),
            OriginalEndDate = new DateTime(2026, 7, 10), CurrentEndDate = new DateTime(2026, 7, 10),
            Status = "Probation"
        });
        _db.EmployeeAppraisals.Add(new EmployeeAppraisal
        {
            EmployeeId = 51, CycleId = 1, FinalRating = 4, Status = "Completed"
        });
        await _db.SaveChangesAsync();

        Assert.True(await _service.IsEligibleForPayAsync(51, new DateTime(2026, 3, 10)));
    }

    [Fact]
    public async Task Intern_PoorPerformance_NotPaidEarly()
    {
        await AddIntern(52, "Intern", new DateTime(2026, 1, 10), true);
        _db.EmployeeProbations.Add(new EmployeeProbation
        {
            EmployeeId = 52, StartDate = new DateTime(2026, 1, 10),
            OriginalEndDate = new DateTime(2026, 7, 10), CurrentEndDate = new DateTime(2026, 7, 10),
            Status = "Probation"
        });
        _db.EmployeeAppraisals.Add(new EmployeeAppraisal
        {
            EmployeeId = 52, CycleId = 1, FinalRating = 2, Status = "Completed"
        });
        await _db.SaveChangesAsync();

        Assert.False(await _service.IsEligibleForPayAsync(52, new DateTime(2026, 3, 10)));
    }

    [Fact]
    public async Task FullTimeEmployee_AlwaysEligible()
    {
        var emp = await AddIntern(53, "Full-time", new DateTime(2025, 1, 1), false);
        Assert.True(await _service.IsEligibleForPayAsync(emp.Id, DateTime.UtcNow));
    }
}