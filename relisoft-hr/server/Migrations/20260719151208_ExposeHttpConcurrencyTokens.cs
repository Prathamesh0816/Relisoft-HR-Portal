using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class ExposeHttpConcurrencyTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Teams",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ShiftTemplates",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "SalaryDiscussions",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Projects",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "InternalJobPostings",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "HrPolicies",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EmployeeSkills",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Employees",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Contractors",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ContractorEmployees",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ComplianceRequirements",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "CommuteRoutes",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "BragPosts",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "BenefitPlans",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ApprovalDelegates",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AppraisalCycles",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Announcements",
                type: "rowversion",
                rowVersion: true,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ShiftTemplates");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "SalaryDiscussions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "InternalJobPostings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "HrPolicies");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Contractors");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ContractorEmployees");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ComplianceRequirements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "CommuteRoutes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "BragPosts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "BenefitPlans");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ApprovalDelegates");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AppraisalCycles");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Announcements");
        }
    }
}
