using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddCompOffTransfersAndDelegateUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalDelegates_Projects_ProjectId",
                table: "ApprovalDelegates");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "ApprovalDelegates",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "CompOffTransfers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromEmployeeId = table.Column<int>(type: "int", nullable: false),
                    ToEmployeeId = table.Column<int>(type: "int", nullable: false),
                    Days = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompOffTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompOffTransfers_Employees_FromEmployeeId",
                        column: x => x.FromEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_CompOffTransfers_Employees_ToEmployeeId",
                        column: x => x.ToEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates",
                columns: new[] { "ManagerId", "ProjectId", "DelegateId" },
                unique: true,
                filter: "[ProjectId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompOffTransfers_FromEmployeeId",
                table: "CompOffTransfers",
                column: "FromEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_CompOffTransfers_ToEmployeeId",
                table: "CompOffTransfers",
                column: "ToEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalDelegates_Projects_ProjectId",
                table: "ApprovalDelegates",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalDelegates_Projects_ProjectId",
                table: "ApprovalDelegates");

            migrationBuilder.DropTable(
                name: "CompOffTransfers");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "ApprovalDelegates",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalDelegates_ManagerId_ProjectId_DelegateId",
                table: "ApprovalDelegates",
                columns: new[] { "ManagerId", "ProjectId", "DelegateId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalDelegates_Projects_ProjectId",
                table: "ApprovalDelegates",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
