using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveEnhancementsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "MaxConsecutiveDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RequiresAdvanceNotice",
                table: "LeaveTypes");
        }
    }
}
