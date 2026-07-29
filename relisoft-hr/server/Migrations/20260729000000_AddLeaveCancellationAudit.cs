using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RelisoftHR.Data;

#nullable disable

namespace RelisoftHR.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260729000000_AddLeaveCancellationAudit")]
    public partial class AddLeaveCancellationAudit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationBalanceRestoredOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LeaveApplicationHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LeaveApplicationId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActorEmployeeId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OccurredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveApplicationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveApplicationHistories_LeaveApplications_LeaveApplicationId",
                        column: x => x.LeaveApplicationId,
                        principalTable: "LeaveApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveApplicationHistories_LeaveApplicationId_OccurredOn",
                table: "LeaveApplicationHistories",
                columns: new[] { "LeaveApplicationId", "OccurredOn" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LeaveApplicationHistories");
            migrationBuilder.DropColumn(name: "CancellationBalanceRestoredOn", table: "LeaveApplications");
        }
    }
}
