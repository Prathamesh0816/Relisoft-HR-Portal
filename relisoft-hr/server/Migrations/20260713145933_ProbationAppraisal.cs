using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class ProbationAppraisal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppraisalCycles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppraisalCycles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeProbations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OriginalEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExtensionCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ConfirmedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeProbations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeProbations_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAppraisals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    CycleId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: true),
                    SelfRating = table.Column<int>(type: "int", nullable: true),
                    ManagerRating = table.Column<int>(type: "int", nullable: true),
                    FinalRating = table.Column<int>(type: "int", nullable: true),
                    SelfComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ManagerComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeAppraisals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeAppraisals_AppraisalCycles_CycleId",
                        column: x => x.CycleId,
                        principalTable: "AppraisalCycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeAppraisals_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeAppraisals_Employees_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAppraisalGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppraisalId = table.Column<int>(type: "int", nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Achieved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeAppraisalGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeAppraisalGoals_EmployeeAppraisals_AppraisalId",
                        column: x => x.AppraisalId,
                        principalTable: "EmployeeAppraisals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisalGoals_AppraisalId",
                table: "EmployeeAppraisalGoals",
                column: "AppraisalId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisals_CycleId",
                table: "EmployeeAppraisals",
                column: "CycleId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisals_EmployeeId",
                table: "EmployeeAppraisals",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisals_ReviewerId",
                table: "EmployeeAppraisals",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProbations_EmployeeId",
                table: "EmployeeProbations",
                column: "EmployeeId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeAppraisalGoals");

            migrationBuilder.DropTable(
                name: "EmployeeProbations");

            migrationBuilder.DropTable(
                name: "EmployeeAppraisals");

            migrationBuilder.DropTable(
                name: "AppraisalCycles");
        }
    }
}
