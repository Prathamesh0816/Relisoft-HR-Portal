using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureEmployeeBackupApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications");

            migrationBuilder.AddColumn<bool>(
                name: "AllowSelfApproval",
                table: "Employees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "BackupApproverId",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "AllowSelfApproval", "BackupApproverId" },
                values: new object[] { false, null });

            migrationBuilder.AddCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications",
                sql: "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate', 'BackupApprover', 'SelfApproval', 'Legacy')");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_BackupApproverId",
                table: "Employees",
                column: "BackupApproverId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Employees_BackupApproval",
                table: "Employees",
                sql: "[BackupApproverId] IS NULL OR [AllowSelfApproval] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Employees_BackupApproverId",
                table: "Employees",
                column: "BackupApproverId",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Employees_BackupApproverId",
                table: "Employees");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications");

            migrationBuilder.DropIndex(
                name: "IX_Employees_BackupApproverId",
                table: "Employees");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Employees_BackupApproval",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "AllowSelfApproval",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "BackupApproverId",
                table: "Employees");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications",
                sql: "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate', 'Legacy')");
        }
    }
}
