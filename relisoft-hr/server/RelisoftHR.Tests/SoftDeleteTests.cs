using Microsoft.EntityFrameworkCore;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public class SoftDeleteTests
{
    [Fact]
    public async Task Remove_is_converted_to_an_audited_soft_delete()
    {
        await using var db = TestDbContext.Create();
        var skill = new EmployeeSkill
        {
            EmployeeId = 3,
            SkillName = "Soft delete test",
            Category = "Testing",
            DeletedById = 3
        };
        db.EmployeeSkills.Add(skill);
        await db.SaveChangesAsync();

        db.EmployeeSkills.Remove(skill);
        await db.SaveChangesAsync();

        Assert.False(await db.EmployeeSkills.AnyAsync(entity => entity.Id == skill.Id));

        var historical = await db.EmployeeSkills
            .IgnoreQueryFilters()
            .SingleAsync(entity => entity.Id == skill.Id);
        Assert.True(historical.IsDeleted);
        Assert.NotNull(historical.DeletedOn);
        Assert.Equal(3, historical.DeletedById);
    }

    [Fact]
    public async Task Explicit_soft_delete_records_the_actor()
    {
        await using var db = TestDbContext.Create();
        var assignment = new ShiftAssignment
        {
            EmployeeId = 3,
            ShiftTemplateId = 1,
            StartDate = new DateTime(2030, 1, 1)
        };
        db.ShiftAssignments.Add(assignment);
        await db.SaveChangesAsync();

        db.SoftDelete(assignment, 1);
        await db.SaveChangesAsync();

        Assert.Empty(await db.ShiftAssignments.ToListAsync());
        var historical = await db.ShiftAssignments.IgnoreQueryFilters().SingleAsync();
        Assert.Equal(1, historical.DeletedById);
        Assert.True(historical.IsDeleted);
    }
}
