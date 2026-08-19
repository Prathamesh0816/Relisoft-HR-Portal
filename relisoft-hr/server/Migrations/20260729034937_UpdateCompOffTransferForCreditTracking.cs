using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompOffTransferForCreditTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Manager assignments are refreshed below. Temporarily remove the
            // constraint so a fresh database can pass through the state where
            // EMP-004 has not yet been added by the runtime demo seeder.
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = N'FK_Employees_Employees_ManagerCode')
                    ALTER TABLE [Employees] DROP CONSTRAINT [FK_Employees_Employees_ManagerCode];
                """);

            migrationBuilder.DropColumn(
                name: "Days",
                table: "CompOffTransfers");

            migrationBuilder.AddColumn<int>(
                name: "CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresOn",
                table: "CompOffTransfers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "WorkedDate",
                table: "CompOffTransfers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "HR Lead", "preeti.patil@relisofttechnologies.com", "HR Lead", new DateTime(2024, 1, 15), "Mumbai", "EMP-002" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Management", "CEO", "rakesh.patil@relisofttechnologies.com", "CEO", new DateTime(2023, 6, 1), "Mumbai" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Engineering", "Software Engineer", "aradhana.shinde@relisofttechnologies.com", "Software Engineer", new DateTime(2025, 3, 10), "Mumbai", "EMP-004" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Data Operations", "Technical Manager L2", "arif.nadeem.mirza@relisofttechnologies.com", "Technical Delivery", new DateTime(2025, 6, 12), "Pune" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Data Operations", "Technical Manager L2", "girish.patil@relisofttechnologies.com", "Technical Delivery", new DateTime(2025, 8, 20), "Bengaluru", "EMP-004" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Quality Engineering", "Technical Manager L1", "shreerang.joshi@relisofttechnologies.com", "Quality Lead (All Areas)", new DateTime(2024, 11, 1), "Pune", "EMP-004" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Quality Engineering", "Quality Engineer", "prathamesh.katikar@relisofttechnologies.com", "Quality Engineer (TLM / LQM)", new DateTime(2026, 3, 1), "Mumbai", "EMP-004" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "Super HR", "hr@relisofttechnologies.com", "Super HR", new DateTime(2024, 6, 1), "Mumbai", "EMP-002" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "HR Executive", "unnati.gawali@relisofttechnologies.com", "HR Executive", new DateTime(2025, 9, 1), "Mumbai", "EMP-002" });

            migrationBuilder.Sql("""
                UPDATE employee
                SET [ManagerCode] = NULL
                FROM [Employees] AS employee
                LEFT JOIN [Employees] AS manager
                    ON manager.[EmployeeCode] = employee.[ManagerCode]
                WHERE employee.[ManagerCode] IS NOT NULL
                    AND manager.[Id] IS NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = N'FK_Employees_Employees_ManagerCode')
                    ALTER TABLE [Employees] ADD CONSTRAINT [FK_Employees_Employees_ManagerCode]
                        FOREIGN KEY ([ManagerCode]) REFERENCES [Employees] ([EmployeeCode]) ON DELETE NO ACTION;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_CompOffTransfers_CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers",
                column: "CompOffCreditLeaveApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_CompOffTransfers_LeaveApplications_CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers",
                column: "CompOffCreditLeaveApplicationId",
                principalTable: "LeaveApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompOffTransfers_LeaveApplications_CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers");

            migrationBuilder.DropIndex(
                name: "IX_CompOffTransfers_CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers");

            migrationBuilder.DropColumn(
                name: "CompOffCreditLeaveApplicationId",
                table: "CompOffTransfers");

            migrationBuilder.DropColumn(
                name: "ExpiresOn",
                table: "CompOffTransfers");

            migrationBuilder.DropColumn(
                name: "WorkedDate",
                table: "CompOffTransfers");

            migrationBuilder.AddColumn<decimal>(
                name: "Days",
                table: "CompOffTransfers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "HR Lead", "preeti.patil@relisofttechnologies.com", "HR Lead", new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Management", "CEO", "rakesh.patil@relisofttechnologies.com", "CEO", new DateTime(2023, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Engineering", "Software Engineer", "aradhana.shinde@relisofttechnologies.com", "Software Engineer", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Data Operations", "Technical Manager L2", "arif.nadeem.mirza@relisofttechnologies.com", "Technical Delivery", new DateTime(2025, 6, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pune" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Data Operations", "Technical Manager L2", "girish.patil@relisofttechnologies.com", "Technical Delivery", new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bengaluru", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Quality Engineering", "Technical Manager L1", "shreerang.joshi@relisofttechnologies.com", "Quality Lead (All Areas)", new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pune", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "Quality Engineering", "Quality Engineer", "prathamesh.katikar@relisofttechnologies.com", "Quality Engineer (TLM / LQM)", new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "Super HR", "hr@relisofttechnologies.com", "Super HR", new DateTime(2024, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location", "ManagerCode" },
                values: new object[] { "HR", "HR Executive", "unnati.gawali@relisofttechnologies.com", "HR Executive", new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai", null });
        }
    }
}
