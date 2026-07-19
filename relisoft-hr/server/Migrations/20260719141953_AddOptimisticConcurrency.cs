using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddOptimisticConcurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Visitors",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TrainingRegistrations",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TrainingCourses",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TimesheetEntries",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ShiftSwaps",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ShiftAssignments",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "RewardRedemptions",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "RewardPointsAccounts",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "RewardCatalogItems",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "LeaveApplications",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ExpenseClaims",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeTickets",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeOnboardings",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeOffboardings",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeLoans",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeLeaveBalances",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeAssets",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeAppraisals",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "BenefitEnrollments",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Assets",
                type: "rowversion",
                rowVersion: true,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Visitors");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TrainingRegistrations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TrainingCourses");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TimesheetEntries");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ShiftSwaps");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ShiftAssignments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "RewardRedemptions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "RewardPointsAccounts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "RewardCatalogItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ExpenseClaims");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeTickets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeOnboardings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeOffboardings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeLoans");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeLeaveBalances");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeAssets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeAppraisals");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "BenefitEnrollments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Assets");
        }
    }
}
