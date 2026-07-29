using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RelisoftHR.Data;

namespace RelisoftHR.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260729020000_AddLeaveLopAmounts")]
public partial class AddLeaveLopAmounts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>("LopDays", "LeaveApplications", "decimal(18,2)", nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>("PaidLeaveDays", "LeaveApplications", "decimal(18,2)", nullable: true);
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("LopDays", "LeaveApplications");
        migrationBuilder.DropColumn("PaidLeaveDays", "LeaveApplications");
    }
}
