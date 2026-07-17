using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

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

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "LeaveApplications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationRequestedOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SandwichLeave",
                table: "HrPolicies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "Email",
                value: "preeti.patil@relisofttechnologies.com");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                column: "Email",
                value: "rakesh.patil@relisofttechnologies.com");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                column: "Email",
                value: "aradhana.shinde@relisofttechnologies.com");

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "CreatedOn", "Department", "Designation", "Email", "EmployeeCode", "EmploymentType", "FullName", "JobRole", "JoinDate", "Location", "PrimaryTeamId", "RoleId", "SalaryStructureId", "Status", "UpdatedOn" },
                values: new object[,]
                {
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Data Operations", "Technical Manager L2", "arif.nadeem.mirza@relisofttechnologies.com", "EMP-004", "Full-time", "Arif Nadeem Mirza", "Technical Delivery", new DateTime(2025, 6, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pune", null, 8, null, "Active", null },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Data Operations", "Technical Manager L2", "girish.patil@relisofttechnologies.com", "EMP-005", "Full-time", "Girish Patil", "Technical Delivery", new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bengaluru", null, 8, null, "Active", null },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Quality Engineering", "Technical Manager L1", "shreerang.joshi@relisofttechnologies.com", "EMP-006", "Full-time", "Shreerang Joshi", "Quality Lead (All Areas)", new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pune", null, 5, null, "Active", null },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Quality Engineering", "Quality Engineer", "prathamesh.katikar@relisofttechnologies.com", "EMP-007", "Full-time", "Prathamesh Katikar", "Quality Engineer (TLM / LQM)", new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 1, null, "Active", null },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "HR", "Super HR", "hr@relisofttechnologies.com", "EMP-008", "Full-time", "Super HR", "Super HR", new DateTime(2024, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 7, null, "Active", null },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "HR", "HR Executive", "unnati.gawali@relisofttechnologies.com", "EMP-009", "Full-time", "Unnati Gawali", "HR Executive", new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 3, null, "Active", null }
                });

            migrationBuilder.UpdateData(
                table: "HrPolicies",
                keyColumn: "Id",
                keyValue: 1,
                column: "SandwichLeave",
                value: false);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 0, 3, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 3, 15, true });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 30, 180, true });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 7, 15, true });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 0, 3, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 0, 1, false });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 7, 5, true });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 15, 30, true });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "AdvanceNoticeDays", "MaxConsecutiveDays", "RequiresAdvanceNotice" },
                values: new object[] { 0, 1, false });

            migrationBuilder.InsertData(
                table: "UserLogins",
                columns: new[] { "Id", "CreatedOn", "EmployeeId", "IsActive", "PasswordHash", "Username" },
                values: new object[,]
                {
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "arif" },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "girish" },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "shreerang" },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "prathamesh" },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "hr" },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "unnati" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DropColumn(
                name: "AdvanceNoticeDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "MaxConsecutiveDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RequiresAdvanceNotice",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "CancellationActionedById",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationActionedOn",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "CancellationRequestedOn",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "SandwichLeave",
                table: "HrPolicies");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "Email",
                value: "preeti@relisoft.com");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                column: "Email",
                value: "rakesh@relisoft.com");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                column: "Email",
                value: "aradhana@relisoft.com");
        }
    }
}
