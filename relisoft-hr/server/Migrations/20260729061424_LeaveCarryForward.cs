using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class LeaveCarryForward : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CarryForwardDays",
                table: "EmployeeLeaveBalances",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "FinancialYear",
                table: "EmployeeLeaveBalances",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "LeaveCarryForwardLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeId = table.Column<int>(type: "int", nullable: false),
                    FromFinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ToFinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PreviousYearRemaining = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CarryForwardPct = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CarryForwardDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LapsedDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TriggerType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ProcessedById = table.Column<int>(type: "int", nullable: true),
                    ProcessedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveCarryForwardLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveCarryForwardLogs_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveCarryForwardLogs_LeaveTypes_LeaveTypeId",
                        column: x => x.LeaveTypeId,
                        principalTable: "LeaveTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CarryForwardPct",
                value: 50m);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCarryForwardLogs_EmployeeId",
                table: "LeaveCarryForwardLogs",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCarryForwardLogs_LeaveTypeId",
                table: "LeaveCarryForwardLogs",
                column: "LeaveTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaveCarryForwardLogs");

            migrationBuilder.DropColumn(
                name: "CarryForwardDays",
                table: "EmployeeLeaveBalances");

            migrationBuilder.DropColumn(
                name: "FinancialYear",
                table: "EmployeeLeaveBalances");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CarryForwardPct",
                value: 0m);
        }
    }
}
