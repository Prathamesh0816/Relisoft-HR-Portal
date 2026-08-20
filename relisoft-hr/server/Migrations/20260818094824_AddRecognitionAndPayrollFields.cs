using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddRecognitionAndPayrollFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUnpaidIntern",
                table: "Employees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PanNumber",
                table: "Employees",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UanNumber",
                table: "Employees",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FunFridayCelebrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CelebrationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FunFridayCelebrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FunFridayCelebrations_Employees_CreatedByEmployeeId",
                        column: x => x.CreatedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Kudos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GiverEmployeeId = table.Column<int>(type: "int", nullable: false),
                    ReceiverEmployeeId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kudos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Kudos_Employees_GiverEmployeeId",
                        column: x => x.GiverEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Kudos_Employees_ReceiverEmployeeId",
                        column: x => x.ReceiverEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RecognitionAwards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PeriodLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AwardPoints = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecognitionAwards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecognitionAwards_Employees_CreatedByEmployeeId",
                        column: x => x.CreatedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RecognitionAwardRecipients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AwardId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    TeamName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RecognitionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AwardedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AwardedByEmployeeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecognitionAwardRecipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecognitionAwardRecipients_Employees_AwardedByEmployeeId",
                        column: x => x.AwardedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecognitionAwardRecipients_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecognitionAwardRecipients_RecognitionAwards_AwardId",
                        column: x => x.AwardId,
                        principalTable: "RecognitionAwards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "IsUnpaidIntern", "PanNumber", "UanNumber" },
                values: new object[] { false, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_FunFridayCelebrations_CreatedByEmployeeId",
                table: "FunFridayCelebrations",
                column: "CreatedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Kudos_GiverEmployeeId",
                table: "Kudos",
                column: "GiverEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Kudos_ReceiverEmployeeId",
                table: "Kudos",
                column: "ReceiverEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionAwardRecipients_AwardedByEmployeeId",
                table: "RecognitionAwardRecipients",
                column: "AwardedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionAwardRecipients_AwardId",
                table: "RecognitionAwardRecipients",
                column: "AwardId");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionAwardRecipients_EmployeeId",
                table: "RecognitionAwardRecipients",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecognitionAwards_CreatedByEmployeeId",
                table: "RecognitionAwards",
                column: "CreatedByEmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FunFridayCelebrations");

            migrationBuilder.DropTable(
                name: "Kudos");

            migrationBuilder.DropTable(
                name: "RecognitionAwardRecipients");

            migrationBuilder.DropTable(
                name: "RecognitionAwards");

            migrationBuilder.DropColumn(
                name: "IsUnpaidIntern",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "PanNumber",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "UanNumber",
                table: "Employees");
        }
    }
}
