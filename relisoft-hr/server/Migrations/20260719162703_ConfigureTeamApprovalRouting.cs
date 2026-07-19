using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureTeamApprovalRouting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<int>(
                name: "ManagerId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalRoute",
                table: "LeaveApplications",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProjectManagerId",
                table: "LeaveApplications",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE p
                SET [ManagerId] = COALESCE(projectManager.[EmployeeId], organizationManager.[EmployeeId], firstLead.[EmployeeId])
                FROM [Projects] p
                OUTER APPLY (
                    SELECT TOP (1) t.[LeadId] AS [EmployeeId]
                    FROM [Teams] t
                    INNER JOIN [Employees] e ON e.[Id] = t.[LeadId]
                    INNER JOIN [OrganizationRoles] r ON r.[Id] = e.[RoleId]
                    WHERE t.[ProjectId] = p.[Id]
                      AND r.[Name] IN ('Manager', 'ManagerL2', 'OrganizationHead')
                    ORDER BY t.[Id]
                ) projectManager
                OUTER APPLY (
                    SELECT TOP (1) e.[Id] AS [EmployeeId]
                    FROM [Employees] e
                    INNER JOIN [OrganizationRoles] r ON r.[Id] = e.[RoleId]
                    WHERE r.[Name] IN ('Manager', 'ManagerL2', 'OrganizationHead')
                      AND e.[Status] NOT IN ('Inactive', 'Separated')
                    ORDER BY r.[Importance] DESC, e.[Id]
                ) organizationManager
                OUTER APPLY (
                    SELECT TOP (1) t.[LeadId] AS [EmployeeId]
                    FROM [Teams] t
                    WHERE t.[ProjectId] = p.[Id]
                    ORDER BY t.[Id]
                ) firstLead;

                UPDATE [Teams]
                SET [ApprovalRoute] = 'ProjectManager';

                UPDATE la
                SET [ProjectManagerId] = p.[ManagerId]
                FROM [LeaveApplications] la
                INNER JOIN [Employees] e ON e.[Id] = la.[EmployeeId]
                INNER JOIN [Teams] t ON t.[Id] = e.[PrimaryTeamId]
                INNER JOIN [Projects] p ON p.[Id] = t.[ProjectId];

                UPDATE la
                SET [ProjectManagerId] = route.[ManagerId]
                FROM [LeaveApplications] la
                OUTER APPLY (
                    SELECT TOP (1) p.[ManagerId]
                    FROM [EmployeeTeams] et
                    INNER JOIN [Teams] t ON t.[Id] = et.[TeamId]
                    INNER JOIN [Projects] p ON p.[Id] = t.[ProjectId]
                    WHERE et.[EmployeeId] = la.[EmployeeId]
                    ORDER BY et.[Id]
                ) route
                WHERE la.[ProjectManagerId] IS NULL;

                UPDATE [LeaveApplications]
                SET [ApprovalRoute] = CASE
                    WHEN [ProjectManagerId] IS NOT NULL AND [ApproverId] = [ProjectManagerId]
                        THEN 'ProjectManager'
                    ELSE 'Legacy'
                END;
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

            migrationBuilder.AlterColumn<string>(
                name: "ApprovalRoute",
                table: "LeaveApplications",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ManagerId",
                table: "Projects",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveApplications_ProjectManagerId",
                table: "LeaveApplications",
                column: "ProjectManagerId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications",
                sql: "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate', 'Legacy')");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveApplications_Employees_ProjectManagerId",
                table: "LeaveApplications",
                column: "ProjectManagerId",
                principalTable: "Employees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Employees_ManagerId",
                table: "Projects",
                column: "ManagerId",
                principalTable: "Employees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_ApprovalDelegates_ApprovalDelegateId",
                table: "Teams",
                column: "ApprovalDelegateId",
                principalTable: "ApprovalDelegates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeaveApplications_Employees_ProjectManagerId",
                table: "LeaveApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Employees_ManagerId",
                table: "Projects");

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

            migrationBuilder.DropIndex(
                name: "IX_Projects_ManagerId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_LeaveApplications_ProjectManagerId",
                table: "LeaveApplications");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LeaveApplications_ApprovalRoute",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "ApprovalDelegateId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "ApprovalRoute",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ApprovalRoute",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "ProjectManagerId",
                table: "LeaveApplications");
        }
    }
}
