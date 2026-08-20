using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollVerificationWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoDisbursed",
                table: "PayRuns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PaidBy",
                table: "PayRuns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidOn",
                table: "PayRuns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadyOn",
                table: "PayRuns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VerifiedBy",
                table: "PayRuns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedOn",
                table: "PayRuns",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoDisbursed",
                table: "PayRuns");

            migrationBuilder.DropColumn(
                name: "PaidBy",
                table: "PayRuns");

            migrationBuilder.DropColumn(
                name: "PaidOn",
                table: "PayRuns");

            migrationBuilder.DropColumn(
                name: "ReadyOn",
                table: "PayRuns");

            migrationBuilder.DropColumn(
                name: "VerifiedBy",
                table: "PayRuns");

            migrationBuilder.DropColumn(
                name: "VerifiedOn",
                table: "PayRuns");
        }
    }
}
