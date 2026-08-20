using RelisoftHR.DTOs;

namespace RelisoftHR.Services;

/// <summary>
/// Computes Indian statutory payroll contributions (PF / ESI / PT / EPS / EDLI)
/// for a processed pay run. Pure functions so the maths is unit-testable.
/// </summary>
public static class StatutoryCalculator
{
    public const decimal PfEmployeeRate = 0.12m;     // 12% of PF wages
    public const decimal PfEmployerRate = 0.12m;     // 12% of PF wages
    public const decimal EpsRate = 0.0833m;          // 8.33% of PF wages (capped)
    public const decimal EpsCap = 1250m;             // EPS monthly ceiling
    public const decimal EdliRate = 0.005m;          // 0.5% of PF wages
    public const decimal PfWageCeiling = 15000m;     // EPF wage ceiling per month
    public const decimal EsiEmployeeRate = 0.0075m;  // 0.75% of gross
    public const decimal EsiEmployerRate = 0.0325m;  // 3.25% of gross
    public const decimal EsiWageCeiling = 21000m;    // ESI wage threshold per month

    /// <summary>Maharashtra professional tax monthly slabs by gross salary.</summary>
    public static decimal ProfessionalTax(decimal gross) =>
        gross switch
        {
            <= 0 => 0,
            <= 10000 => 0,
            <= 15000 => 175m,
            <= 25000 => 200m,
            _ => 300m
        };

    public static decimal Round2(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

    public static StatutoryLineDto ComputeLine(
        int employeeId, string employeeName, string employeeCode,
        decimal basic, decimal gross, decimal tds = 0)
    {
        var pfWages = Math.Min(basic, PfWageCeiling);
        var employeePf = Round2(pfWages * PfEmployeeRate);
        var employerPf = Round2(pfWages * PfEmployerRate);
        var employerEps = Round2(Math.Min(pfWages * EpsRate, EpsCap));
        var employerEdli = Round2(pfWages * EdliRate);

        var esiWages = gross <= EsiWageCeiling ? gross : 0m;
        var employeeEsi = Round2(esiWages * EsiEmployeeRate);
        var employerEsi = Round2(esiWages * EsiEmployerRate);

        var pt = ProfessionalTax(gross);
        var netPay = Round2(gross - employeePf - employeeEsi - pt - tds);

        return new StatutoryLineDto(
            employeeId, employeeName, employeeCode,
            Round2(basic), Round2(gross),
            employeePf, employerPf, employerEps, employerEdli,
            employeeEsi, employerEsi, pt, Round2(tds), netPay);
    }

    public static StatutoryTotalsDto Totals(IEnumerable<StatutoryLineDto> lines)
    {
        var list = lines.ToList();
        return new StatutoryTotalsDto(
            list.Sum(l => l.Basic), list.Sum(l => l.Gross),
            list.Sum(l => l.EmployeePf), list.Sum(l => l.EmployerPf),
            list.Sum(l => l.EmployerEps), list.Sum(l => l.EmployerEdli),
            list.Sum(l => l.EmployeeEsi), list.Sum(l => l.EmployerEsi),
            list.Sum(l => l.ProfessionalTax), list.Sum(l => l.Tds));
    }
}