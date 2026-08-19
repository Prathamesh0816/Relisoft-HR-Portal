using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RelisoftHR.Data;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <summary>
    /// Repairs databases where AddLeaveEnhancementsV2 was recorded as applied
    /// even though its empty Up method did not create the leave-policy columns.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260819000000_EnsureLeavePolicyColumns")]
    public partial class EnsureLeavePolicyColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.LeaveTypes', N'MaxConsecutiveDays') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[LeaveTypes]
                        ADD [MaxConsecutiveDays] int NOT NULL
                            CONSTRAINT [DF_LeaveTypes_MaxConsecutiveDays] DEFAULT (0) WITH VALUES;
                END;

                IF COL_LENGTH(N'dbo.LeaveTypes', N'RequiresAdvanceNotice') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[LeaveTypes]
                        ADD [RequiresAdvanceNotice] bit NOT NULL
                            CONSTRAINT [DF_LeaveTypes_RequiresAdvanceNotice] DEFAULT (0) WITH VALUES;
                END;

                IF COL_LENGTH(N'dbo.LeaveTypes', N'AdvanceNoticeDays') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[LeaveTypes]
                        ADD [AdvanceNoticeDays] int NOT NULL
                            CONSTRAINT [DF_LeaveTypes_AdvanceNoticeDays] DEFAULT (0) WITH VALUES;
                END;
                """);

            migrationBuilder.Sql("""
                UPDATE [dbo].[LeaveTypes]
                SET [MaxConsecutiveDays] = CASE [Id]
                        WHEN 1 THEN 3
                        WHEN 2 THEN 15
                        WHEN 3 THEN 180
                        WHEN 4 THEN 15
                        WHEN 5 THEN 3
                        WHEN 6 THEN 1
                        WHEN 7 THEN 5
                        WHEN 8 THEN 30
                        WHEN 9 THEN 1
                        ELSE [MaxConsecutiveDays]
                    END,
                    [RequiresAdvanceNotice] = CASE WHEN [Id] IN (2, 3, 4, 7, 8) THEN 1 ELSE 0 END,
                    [AdvanceNoticeDays] = CASE [Id]
                        WHEN 2 THEN 3
                        WHEN 3 THEN 30
                        WHEN 4 THEN 7
                        WHEN 7 THEN 7
                        WHEN 8 THEN 15
                        ELSE 0
                    END
                WHERE [Id] BETWEEN 1 AND 9;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RequiresAdvanceNotice",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "MaxConsecutiveDays",
                table: "LeaveTypes");
        }
    }
}
