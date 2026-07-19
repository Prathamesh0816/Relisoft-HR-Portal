using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class StandardizeSoftDeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BragLikes_BragPosts_BragPostId",
                table: "BragLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_SkillEndorsements_EmployeeSkills_EmployeeSkillId",
                table: "SkillEndorsements");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeSkills_EmployeeId_SkillName",
                table: "EmployeeSkills");

            migrationBuilder.DropIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes");

            migrationBuilder.DropIndex(
                name: "IX_CarpoolMembers_GroupId_EmployeeId",
                table: "CarpoolMembers");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates");

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "TimesheetEntries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "TimesheetEntries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TimesheetEntries",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "ShiftAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "ShiftAssignments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ShiftAssignments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "EmployeeSkills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "EmployeeSkills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "EmployeeSkills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "EmployeeAppraisalGoals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "EmployeeAppraisalGoals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "EmployeeAppraisalGoals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "CommuteRoutes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "CommuteRoutes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CommuteRoutes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "CarpoolMembers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "CarpoolMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CarpoolMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "BragPosts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "BragPosts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "BragPosts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "ApprovalDelegates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "ApprovalDelegates",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ApprovalDelegates",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Announcements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "Announcements",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Announcements",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE [Announcements]
                SET [IsDeleted] = 1, [DeletedOn] = SYSUTCDATETIME()
                WHERE [IsActive] = 0;

                UPDATE [BragPosts]
                SET [IsDeleted] = 1, [DeletedOn] = SYSUTCDATETIME()
                WHERE [IsActive] = 0;

                UPDATE [CommuteRoutes]
                SET [IsDeleted] = 1, [DeletedOn] = SYSUTCDATETIME()
                WHERE [IsActive] = 0;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSkills_EmployeeId_SkillName",
                table: "EmployeeSkills",
                columns: new[] { "EmployeeId", "SkillName" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes",
                column: "EmployeeId",
                unique: true,
                filter: "[IsActive] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolMembers_GroupId_EmployeeId",
                table: "CarpoolMembers",
                columns: new[] { "GroupId", "EmployeeId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates",
                columns: new[] { "ManagerId", "ProjectId", "DelegateId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_BragLikes_BragPosts_BragPostId",
                table: "BragLikes",
                column: "BragPostId",
                principalTable: "BragPosts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SkillEndorsements_EmployeeSkills_EmployeeSkillId",
                table: "SkillEndorsements",
                column: "EmployeeSkillId",
                principalTable: "EmployeeSkills",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BragLikes_BragPosts_BragPostId",
                table: "BragLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_SkillEndorsements_EmployeeSkills_EmployeeSkillId",
                table: "SkillEndorsements");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeSkills_EmployeeId_SkillName",
                table: "EmployeeSkills");

            migrationBuilder.DropIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes");

            migrationBuilder.DropIndex(
                name: "IX_CarpoolMembers_GroupId_EmployeeId",
                table: "CarpoolMembers");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "TimesheetEntries");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "TimesheetEntries");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TimesheetEntries");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "ShiftAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "ShiftAssignments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ShiftAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "EmployeeAppraisalGoals");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "EmployeeAppraisalGoals");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "EmployeeAppraisalGoals");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "CommuteRoutes");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "CommuteRoutes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CommuteRoutes");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "CarpoolMembers");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "CarpoolMembers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CarpoolMembers");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "BragPosts");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "BragPosts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "BragPosts");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "ApprovalDelegates");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "ApprovalDelegates");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ApprovalDelegates");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Announcements");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSkills_EmployeeId_SkillName",
                table: "EmployeeSkills",
                columns: new[] { "EmployeeId", "SkillName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes",
                column: "EmployeeId",
                unique: true,
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolMembers_GroupId_EmployeeId",
                table: "CarpoolMembers",
                columns: new[] { "GroupId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates",
                columns: new[] { "ManagerId", "ProjectId", "DelegateId" },
                unique: true,
                filter: "[ProjectId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_BragLikes_BragPosts_BragPostId",
                table: "BragLikes",
                column: "BragPostId",
                principalTable: "BragPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SkillEndorsements_EmployeeSkills_EmployeeSkillId",
                table: "SkillEndorsements",
                column: "EmployeeSkillId",
                principalTable: "EmployeeSkills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
