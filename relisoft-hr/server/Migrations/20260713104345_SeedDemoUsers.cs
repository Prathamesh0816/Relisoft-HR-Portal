using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class SeedDemoUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "CreatedOn", "Department", "Designation", "Email", "EmployeeCode", "EmploymentType", "FullName", "JobRole", "JoinDate", "Location", "PrimaryTeamId", "RoleId", "SalaryStructureDetails", "UpdatedOn" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "HR", "HR Lead", "preeti@relisoft.com", "EMP-001", "Full-time", "Preeti Sharma", "HR Lead", new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 7, null, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Management", "CEO", "rakesh@relisoft.com", "EMP-002", "Full-time", "Rakesh Mehta", "CEO", new DateTime(2023, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 6, null, null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "Software Engineer", "aradhana@relisoft.com", "EMP-003", "Full-time", "Aradhana Singh", "Software Engineer", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null, 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "UserLogins",
                columns: new[] { "Id", "CreatedOn", "EmployeeId", "PasswordHash", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "preeti" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "rakesh" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", "aradhana" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "UserLogins",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
