using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RelisoftHR.Data;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <summary>
    /// Repairs databases where AddLeaveEnhancementsV2 was recorded as applied
    /// even though its empty Up method did not create SandwichLeave.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260819001000_EnsureHrPolicySandwichLeave")]
    public partial class EnsureHrPolicySandwichLeave : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.HrPolicies', N'SandwichLeave') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[HrPolicies]
                        ADD [SandwichLeave] bit NOT NULL
                            CONSTRAINT [DF_HrPolicies_SandwichLeave] DEFAULT (0) WITH VALUES;
                END;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SandwichLeave",
                table: "HrPolicies");
        }
    }
}
