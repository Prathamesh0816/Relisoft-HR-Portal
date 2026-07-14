using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkforceResilience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SurveyId1",
                table: "SurveyQuestions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WorkforceDependencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    OwnerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DependentId = table.Column<int>(type: "int", nullable: false),
                    DependentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DependencyType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Criticality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceDependencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceEmployees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Criticality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BackupAvailable = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ExperienceYears = table.Column<int>(type: "int", nullable: false),
                    AnnualSalaryUsd = table.Column<double>(type: "float", nullable: false),
                    TenureYears = table.Column<double>(type: "float", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceEmployees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ActionTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Decision = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceFeedbacks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceKnowledges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    KnowledgeArea = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DocumentationLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Proficiency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceKnowledges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforcePerformances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PerformanceRating = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GoalsCompleted = table.Column<int>(type: "int", nullable: false),
                    GoalsTotal = table.Column<int>(type: "int", nullable: false),
                    LastReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EngagementScore = table.Column<int>(type: "int", nullable: false),
                    TenureAtCompany = table.Column<double>(type: "float", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforcePerformances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Criticality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DeadlineDays = table.Column<int>(type: "int", nullable: false),
                    Client = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AnnualContractValueUsd = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceScenarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Configuration = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    BaselineScore = table.Column<double>(type: "float", nullable: false),
                    ProjectedScore = table.Column<double>(type: "float", nullable: false),
                    Impact = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedById = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceScenarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceWorkloads",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WeeklyHours = table.Column<int>(type: "int", nullable: false),
                    TaskDifficulty = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ActiveProjects = table.Column<int>(type: "int", nullable: false),
                    OverdueTasks = table.Column<int>(type: "int", nullable: false),
                    PtoPlannedDays = table.Column<int>(type: "int", nullable: false),
                    LastPtoDays = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforceWorkloads", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyQuestions_SurveyId1",
                table: "SurveyQuestions",
                column: "SurveyId1");

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyQuestions_Surveys_SurveyId1",
                table: "SurveyQuestions",
                column: "SurveyId1",
                principalTable: "Surveys",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SurveyQuestions_Surveys_SurveyId1",
                table: "SurveyQuestions");

            migrationBuilder.DropTable(
                name: "WorkforceDependencies");

            migrationBuilder.DropTable(
                name: "WorkforceEmployees");

            migrationBuilder.DropTable(
                name: "WorkforceFeedbacks");

            migrationBuilder.DropTable(
                name: "WorkforceKnowledges");

            migrationBuilder.DropTable(
                name: "WorkforcePerformances");

            migrationBuilder.DropTable(
                name: "WorkforceProjects");

            migrationBuilder.DropTable(
                name: "WorkforceScenarios");

            migrationBuilder.DropTable(
                name: "WorkforceWorkloads");

            migrationBuilder.DropIndex(
                name: "IX_SurveyQuestions_SurveyId1",
                table: "SurveyQuestions");

            migrationBuilder.DropColumn(
                name: "SurveyId1",
                table: "SurveyQuestions");
        }
    }
}
