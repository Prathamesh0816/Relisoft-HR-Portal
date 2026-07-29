using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddCompOffCreditTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ConsumedByLeaveApplicationId",
                table: "LeaveApplications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsumedOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresOn",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompOffConsumed",
                table: "LeaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompOffCredit",
                table: "LeaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "WorkedDate",
                table: "LeaveApplications",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsumedByLeaveApplicationId",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "ConsumedOn",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "ExpiresOn",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "IsCompOffConsumed",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "IsCompOffCredit",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "WorkedDate",
                table: "LeaveApplications");
        }
    }
}
