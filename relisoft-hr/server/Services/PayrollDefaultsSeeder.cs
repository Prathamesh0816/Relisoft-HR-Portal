using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public static class PayrollDefaultsSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.PayComponents.AnyAsync())
            return;

        db.PayComponents.AddRange(
            new PayComponent { Name = "Basic Salary", Type = PayComponentType.Earning, Description = "Monthly fixed basic pay" },
            new PayComponent { Name = "House Rent Allowance", Type = PayComponentType.Earning, Description = "HRA component" },
            new PayComponent { Name = "Special Allowance", Type = PayComponentType.Earning, Description = "Remaining fixed allowance" },
            new PayComponent { Name = "Performance Bonus", Type = PayComponentType.Earning, Description = "One-off performance incentive" },
            new PayComponent { Name = "Referral Reward", Type = PayComponentType.Earning, Description = "Employee referral incentive" },
            new PayComponent { Name = "Provident Fund (PF)", Type = PayComponentType.Deduction, Description = "Employee PF contribution (auto 12% of basic)", IsAuto = true, Rate = 12 },
            new PayComponent { Name = "Employee State Insurance (ESI)", Type = PayComponentType.Deduction, Description = "Employee ESI contribution (auto 1.75% of basic)", IsAuto = true, Rate = 1.75m },
            new PayComponent { Name = "TDS", Type = PayComponentType.Deduction, Description = "Tax deducted at source" },
            new PayComponent { Name = "Professional Tax", Type = PayComponentType.Deduction, Description = "State professional tax" }
        );
        await db.SaveChangesAsync();
    }
}