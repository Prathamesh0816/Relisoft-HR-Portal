using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollAndReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmployeeSalaryStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSalaryStructures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeSalaryStructures_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayComponents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayComponents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PayRuns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PeriodMonth = table.Column<int>(type: "int", nullable: false),
                    PeriodYear = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProcessedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: false),
                    ReviewType = table.Column<int>(type: "int", nullable: false),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    KeyStrengths = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    AreasOfImprovement = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    TrainingSupportRequired = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Recommendation = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    EligibleForRoleEnhancement = table.Column<bool>(type: "bit", nullable: false),
                    OverallRating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OverallAssessment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerformanceReviews_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PerformanceReviews_Employees_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmployeeSalaryStructureLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalaryStructureId = table.Column<int>(type: "int", nullable: false),
                    PayComponentId = table.Column<int>(type: "int", nullable: false),
                    MonthlyAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSalaryStructureLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeSalaryStructureLines_EmployeeSalaryStructures_SalaryStructureId",
                        column: x => x.SalaryStructureId,
                        principalTable: "EmployeeSalaryStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeSalaryStructureLines_PayComponents_PayComponentId",
                        column: x => x.PayComponentId,
                        principalTable: "PayComponents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payslips",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayRunId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    GrossEarnings = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetPay = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payslips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payslips_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payslips_PayRuns_PayRunId",
                        column: x => x.PayRunId,
                        principalTable: "PayRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewCriterionScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerformanceReviewId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WeightPercent = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewCriterionScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReviewCriterionScores_PerformanceReviews_PerformanceReviewId",
                        column: x => x.PerformanceReviewId,
                        principalTable: "PerformanceReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayslipLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayslipId = table.Column<int>(type: "int", nullable: false),
                    PayComponentId = table.Column<int>(type: "int", nullable: false),
                    ComponentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayslipLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayslipLines_Payslips_PayslipId",
                        column: x => x.PayslipId,
                        principalTable: "Payslips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "HR", "HR Lead", "preeti.patil@relisofttechnologies.com", "HR Lead", new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

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
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Engineering", "Software Engineer", "aradhana.shinde@relisofttechnologies.com", "Software Engineer", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

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
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Data Operations", "Technical Manager L2", "girish.patil@relisofttechnologies.com", "Technical Delivery", new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bengaluru" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Quality Engineering", "Technical Manager L1", "shreerang.joshi@relisofttechnologies.com", "Quality Lead (All Areas)", new DateTime(2024, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pune" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "Quality Engineering", "Quality Engineer", "prathamesh.katikar@relisofttechnologies.com", "Quality Engineer (TLM / LQM)", new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "HR", "Super HR", "hr@relisofttechnologies.com", "Super HR", new DateTime(2024, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "HR", "HR Executive", "unnati.gawali@relisofttechnologies.com", "HR Executive", new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mumbai" });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 6,
                column: "CompOffValidityDays",
                value: 60);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSalaryStructureLines_PayComponentId",
                table: "EmployeeSalaryStructureLines",
                column: "PayComponentId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSalaryStructureLines_SalaryStructureId",
                table: "EmployeeSalaryStructureLines",
                column: "SalaryStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSalaryStructures_EmployeeId",
                table: "EmployeeSalaryStructures",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayComponents_Name",
                table: "PayComponents",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayRuns_PeriodYear_PeriodMonth",
                table: "PayRuns",
                columns: new[] { "PeriodYear", "PeriodMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayslipLines_PayslipId",
                table: "PayslipLines",
                column: "PayslipId");

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_EmployeeId",
                table: "Payslips",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Payslips_PayRunId",
                table: "Payslips",
                column: "PayRunId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceReviews_EmployeeId",
                table: "PerformanceReviews",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceReviews_ReviewerId",
                table: "PerformanceReviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewCriterionScores_PerformanceReviewId",
                table: "ReviewCriterionScores",
                column: "PerformanceReviewId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeSalaryStructureLines");

            migrationBuilder.DropTable(
                name: "PayslipLines");

            migrationBuilder.DropTable(
                name: "ReviewCriterionScores");

            migrationBuilder.DropTable(
                name: "EmployeeSalaryStructures");

            migrationBuilder.DropTable(
                name: "PayComponents");

            migrationBuilder.DropTable(
                name: "Payslips");

            migrationBuilder.DropTable(
                name: "PerformanceReviews");

            migrationBuilder.DropTable(
                name: "PayRuns");

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Department", "Designation", "Email", "JobRole", "JoinDate", "Location" },
                values: new object[] { "", "", "", "", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "" });

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "Id",
                keyValue: 6,
                column: "CompOffValidityDays",
                value: 30);
        }
    }
}
