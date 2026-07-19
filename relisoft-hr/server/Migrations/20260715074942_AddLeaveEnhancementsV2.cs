using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RelisoftHR.Data;

#nullable disable

namespace RelisoftHR.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260715074942_AddLeaveEnhancementsV2")]
    public partial class AddLeaveEnhancementsV2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxConsecutiveDays",
                table: "LeaveTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresAdvanceNotice",
                table: "LeaveTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "LeaveApplications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationRequestedOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CancellationActionedById",
                table: "LeaveApplications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationActionedOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [LeaveTypes]
                SET [MaxConsecutiveDays] = CASE [Id]
                        WHEN 1 THEN 3 WHEN 2 THEN 15 WHEN 3 THEN 180
                        WHEN 4 THEN 15 WHEN 5 THEN 3 WHEN 6 THEN 1
                        WHEN 7 THEN 5 WHEN 8 THEN 30 WHEN 9 THEN 1
                        ELSE [MaxConsecutiveDays]
                    END,
                    [RequiresAdvanceNotice] = CASE WHEN [Id] IN (2, 3, 4, 7, 8) THEN 1 ELSE 0 END,
                    [AdvanceNoticeDays] = CASE [Id]
                        WHEN 2 THEN 3 WHEN 3 THEN 30 WHEN 4 THEN 7
                        WHEN 7 THEN 7 WHEN 8 THEN 15 ELSE 0
                    END
                WHERE [Id] BETWEEN 1 AND 9;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxConsecutiveDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RequiresAdvanceNotice",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationRequestedOn",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationActionedById",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationActionedOn",
                table: "LeaveApplications");
        }
    }
}
