using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class StatutoryCalculatorTests
{
    [Fact]
    public void ComputeLine_BelowPfCeiling_ChargesFullRates()
    {
        var line = StatutoryCalculator.ComputeLine(1, "Test Employee", "EMP001", 12000, 15000);

        Assert.Equal(1440, line.EmployeePf);      // 12% of 12000
        Assert.Equal(1440, line.EmployerPf);      // 12% of 12000
        Assert.Equal(999.60m, line.EmployerEps);  // 8.33% of 12000
        Assert.Equal(60, line.EmployerEdli);      // 0.5% of 12000
        Assert.Equal(112.5m, line.EmployeeEsi);   // 0.75% of 15000
        Assert.Equal(487.5m, line.EmployerEsi);   // 3.25% of 15000
        Assert.Equal(175, line.ProfessionalTax);  // 10001-15000 slab
    }

    [Fact]
    public void ComputeLine_AbovePfCeiling_CapsPfAt15000()
    {
        var line = StatutoryCalculator.ComputeLine(2, "Test Employee 2", "EMP002", 40000, 60000);

        Assert.Equal(1800, line.EmployeePf);      // 12% of 15000 ceiling
        Assert.Equal(1249.50m, line.EmployerEps); // 8.33% of 15000 (below 1250 cap)
        Assert.Equal(75, line.EmployerEdli);
        Assert.Equal(0, line.EmployeeEsi);        // gross above ESI ceiling
        Assert.Equal(0, line.EmployerEsi);
        Assert.Equal(300, line.ProfessionalTax);  // >25000 slab
    }

    [Fact]
    public void ComputeLine_IncludesTdsAndNetPay()
    {
        var line = StatutoryCalculator.ComputeLine(3, "Test Employee 3", "EMP003", 15000, 22000, tds: 500);

        Assert.Equal(500, line.Tds);
        var expectedNet = 22000 - line.EmployeePf - line.EmployeeEsi - line.ProfessionalTax - 500;
        Assert.Equal(expectedNet, line.NetPay);
        Assert.True(line.NetPay < 22000);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(8000, 0)]
    [InlineData(10000, 0)]
    [InlineData(12000, 175)]
    [InlineData(18000, 200)]
    [InlineData(30000, 300)]
    public void ProfessionalTax_AppliesMaharashtraSlabs(decimal gross, decimal expected)
    {
        Assert.Equal(expected, StatutoryCalculator.ProfessionalTax(gross));
    }

    [Fact]
    public void Totals_SumsAllContributions()
    {
        var lines = new[]
        {
            StatutoryCalculator.ComputeLine(1, "A", "E1", 12000, 15000),
            StatutoryCalculator.ComputeLine(2, "B", "E2", 40000, 60000),
        };

        var totals = StatutoryCalculator.Totals(lines);

        Assert.Equal(52000, totals.Basic);
        Assert.Equal(75000, totals.Gross);
        Assert.Equal(3240, totals.EmployeePf);
        Assert.Equal(3240, totals.EmployerPf);
        Assert.Equal(2249.10m, totals.EmployerEps); // 999.60 + 1249.50
        Assert.Equal(135, totals.EmployerEdli);
        Assert.Equal(112.5m, totals.EmployeeEsi);
        Assert.Equal(487.5m, totals.EmployerEsi);
        Assert.Equal(475, totals.ProfessionalTax);
    }
}