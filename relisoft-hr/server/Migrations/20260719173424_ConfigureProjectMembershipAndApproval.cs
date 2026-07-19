using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureProjectMembershipAndApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_ApprovalDelegates_ApprovalDelegateId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Teams_ApprovalDelegateId",
                table: "Teams");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Teams_ApprovalDelegate",
                table: "Teams");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Teams_ApprovalRoute",
                table: "Teams");

            migrationBuilder.AddColumn<int>(
                name: "ApprovalDelegateId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalRoute",
                table: "Projects",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmployeeProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    AssignedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeProjects_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeProjects_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.Sql(
                """
                UPDATE p
                SET [ApprovalRoute] = COALESCE(route.[ApprovalRoute], 'ProjectManager'),
                    [ApprovalDelegateId] = route.[ApprovalDelegateId]
                FROM [Projects] p
                OUTER APPLY (
                    SELECT TOP (1) t.[ApprovalRoute], t.[ApprovalDelegateId]
                    FROM [Teams] t
                    WHERE t.[ProjectId] = p.[Id]
                      AND NOT EXISTS (
                          SELECT 1
                          FROM [Teams] otherTeam
                          WHERE otherTeam.[ProjectId] = p.[Id]
                            AND (otherTeam.[ApprovalRoute] <> t.[ApprovalRoute]
                              OR ISNULL(otherTeam.[ApprovalDelegateId], -1) <> ISNULL(t.[ApprovalDelegateId], -1))
                      )
                    ORDER BY t.[Id]
                ) route;

                WITH rawMemberships AS (
                    SELECT et.[EmployeeId], t.[ProjectId]
                    FROM [EmployeeTeams] et
                    INNER JOIN [Teams] t ON t.[Id] = et.[TeamId]
                    UNION
                    SELECT t.[LeadId], t.[ProjectId]
                    FROM [Teams] t
                    UNION
                    SELECT p.[ManagerId], p.[Id]
                    FROM [Projects] p
                    WHERE p.[ManagerId] IS NOT NULL
                ), rankedMemberships AS (
                    SELECT membership.[EmployeeId], membership.[ProjectId],
                           ROW_NUMBER() OVER (
                               PARTITION BY membership.[EmployeeId]
                               ORDER BY CASE WHEN primaryTeam.[ProjectId] = membership.[ProjectId] THEN 0 ELSE 1 END,
                                        membership.[ProjectId]
                           ) AS [PrimaryRank]
                    FROM rawMemberships membership
                    INNER JOIN [Employees] employee ON employee.[Id] = membership.[EmployeeId]
                    LEFT JOIN [Teams] primaryTeam ON primaryTeam.[Id] = employee.[PrimaryTeamId]
                )
                INSERT INTO [EmployeeProjects] ([EmployeeId], [ProjectId], [IsPrimary], [AssignedOn])
                SELECT [EmployeeId], [ProjectId],
                       CASE WHEN [PrimaryRank] = 1 THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END,
                       GETUTCDATE()
                FROM rankedMemberships;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ApprovalRoute",
                table: "Projects",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "ApprovalDelegateId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "ApprovalRoute",
                table: "Teams");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ApprovalDelegateId",
                table: "Projects",
                column: "ApprovalDelegateId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Projects_ApprovalDelegate",
                table: "Projects",
                sql: "([ApprovalRoute] = 'Delegate' AND [ApprovalDelegateId] IS NOT NULL) OR ([ApprovalRoute] <> 'Delegate' AND [ApprovalDelegateId] IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Projects_ApprovalRoute",
                table: "Projects",
                sql: "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate')");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProjects_EmployeeId",
                table: "EmployeeProjects",
                column: "EmployeeId",
                unique: true,
                filter: "[IsPrimary] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProjects_EmployeeId_ProjectId",
                table: "EmployeeProjects",
                columns: new[] { "EmployeeId", "ProjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProjects_ProjectId",
                table: "EmployeeProjects",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_ApprovalDelegates_ApprovalDelegateId",
                table: "Projects",
                column: "ApprovalDelegateId",
                principalTable: "ApprovalDelegates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_ApprovalDelegates_ApprovalDelegateId",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "EmployeeProjects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_ApprovalDelegateId",
                table: "Projects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Projects_ApprovalDelegate",
                table: "Projects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Projects_ApprovalRoute",
                table: "Projects");

            migrationBuilder.AddColumn<int>(
                name: "ApprovalDelegateId",
                table: "Teams",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalRoute",
                table: "Teams",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE team
                SET [ApprovalRoute] = project.[ApprovalRoute],
                    [ApprovalDelegateId] = project.[ApprovalDelegateId]
                FROM [Teams] team
                INNER JOIN [Projects] project ON project.[Id] = team.[ProjectId];
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ApprovalRoute",
                table: "Teams",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "ApprovalDelegateId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ApprovalRoute",
                table: "Projects");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_ApprovalDelegateId",
                table: "Teams",
                column: "ApprovalDelegateId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Teams_ApprovalDelegate",
                table: "Teams",
                sql: "([ApprovalRoute] = 'Delegate' AND [ApprovalDelegateId] IS NOT NULL) OR ([ApprovalRoute] <> 'Delegate' AND [ApprovalDelegateId] IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Teams_ApprovalRoute",
                table: "Teams",
                sql: "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate')");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_ApprovalDelegates_ApprovalDelegateId",
                table: "Teams",
                column: "ApprovalDelegateId",
                principalTable: "ApprovalDelegates",
                principalColumn: "Id");
        }
    }
}
