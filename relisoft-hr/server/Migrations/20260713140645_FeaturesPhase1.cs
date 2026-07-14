using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class FeaturesPhase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalaryStructureDetails",
                table: "Employees");

            migrationBuilder.AddColumn<decimal>(
                name: "CarryForwardPct",
                table: "LeaveTypes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "CompOffValidityDays",
                table: "LeaveTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompOff",
                table: "LeaveTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFloaterHoliday",
                table: "LeaveTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxFloaterPerYear",
                table: "LeaveTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsMedicalLeave",
                table: "LeaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LossOfPay",
                table: "LeaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MedicalCertificatePath",
                table: "LeaveApplications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SalaryStructureId",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ApprovalDelegates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ManagerId = table.Column<int>(type: "int", nullable: false),
                    DelegateId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalDelegates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalDelegates_Employees_DelegateId",
                        column: x => x.DelegateId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalDelegates_Employees_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalDelegates_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveAccrualLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeId = table.Column<int>(type: "int", nullable: false),
                    AccruedDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AccrualDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Period = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveAccrualLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveAccrualLogs_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveAccrualLogs_LeaveTypes_LeaveTypeId",
                        column: x => x.LeaveTypeId,
                        principalTable: "LeaveTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalaryStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FixedPay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    VariablePay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PF = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Gratuity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Insurance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalaryStructures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalaryStructures_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "SalaryStructureId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                column: "SalaryStructureId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                column: "SalaryStructureId",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 50m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 30, true, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CarryForwardPct", "CompOffValidityDays", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear" },
                values: new object[] { 0m, 0, false, false, 0 });

            migrationBuilder.InsertData(
                table: "LeaveTypes",
                columns: new[] { "Id", "CarryForwardPct", "CompOffValidityDays", "IsActive", "IsCompOff", "IsFloaterHoliday", "MaxFloaterPerYear", "Name", "SortOrder" },
                values: new object[] { 9, 0m, 0, true, false, true, 2, "Floater Holiday", 9 });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SalaryStructureId",
                table: "Employees",
                column: "SalaryStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_DelegateId",
                table: "ApprovalDelegates",
                column: "DelegateId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates",
                columns: new[] { "ManagerId", "ProjectId", "DelegateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ProjectId",
                table: "ApprovalDelegates",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveAccrualLogs_EmployeeId",
                table: "LeaveAccrualLogs",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveAccrualLogs_LeaveTypeId",
                table: "LeaveAccrualLogs",
                column: "LeaveTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryStructures_EmployeeId",
                table: "SalaryStructures",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_SalaryStructures_SalaryStructureId",
                table: "Employees",
                column: "SalaryStructureId",
                principalTable: "SalaryStructures",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_SalaryStructures_SalaryStructureId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "ApprovalDelegates");

            migrationBuilder.DropTable(
                name: "LeaveAccrualLogs");

            migrationBuilder.DropTable(
                name: "SalaryStructures");

            migrationBuilder.DropIndex(
                name: "IX_Employees_SalaryStructureId",
                table: "Employees");

            migrationBuilder.DeleteData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DropColumn(
                name: "CarryForwardPct",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "CompOffValidityDays",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "IsCompOff",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "IsFloaterHoliday",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "MaxFloaterPerYear",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "IsMedicalLeave",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "LossOfPay",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "MedicalCertificatePath",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "SalaryStructureId",
                table: "Employees");

            migrationBuilder.AddColumn<string>(
                name: "SalaryStructureDetails",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "SalaryStructureDetails",
                value: null);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                column: "SalaryStructureDetails",
                value: null);

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                column: "SalaryStructureDetails",
                value: null);
        }
    }
}
