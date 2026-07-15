using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
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

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 3, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice", "AdvanceNoticeDays" },
                values: new object[] { 15, true, 3 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice", "AdvanceNoticeDays" },
                values: new object[] { 180, true, 30 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice", "AdvanceNoticeDays" },
                values: new object[] { 15, true, 7 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 3, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 1, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice", "AdvanceNoticeDays" },
                values: new object[] { 5, true, 7 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice", "AdvanceNoticeDays" },
                values: new object[] { 30, true, 15 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 1, false });
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
