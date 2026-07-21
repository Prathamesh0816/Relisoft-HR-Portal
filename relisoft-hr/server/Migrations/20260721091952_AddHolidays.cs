using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddHolidays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Holidays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Holidays", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Holidays",
                columns: new[] { "Id", "Date", "Name", "Type" },
                values: new object[,]
                {
                    { 1, new DateOnly(2026, 1, 1), "New Year", "Fixed" },
                    { 2, new DateOnly(2026, 1, 15), "Makra Sankrati / Pongal", "Optional" },
                    { 3, new DateOnly(2026, 1, 26), "Republic Day", "Fixed" },
                    { 4, new DateOnly(2026, 3, 3), "Holi", "Fixed" },
                    { 5, new DateOnly(2026, 3, 19), "Gudhi Padwa", "Optional" },
                    { 6, new DateOnly(2026, 4, 3), "Good Friday", "Optional" },
                    { 7, new DateOnly(2026, 4, 14), "Ambedkar Jayanti / Baisakhi", "Optional" },
                    { 8, new DateOnly(2026, 5, 1), "Labour Day / Maharashtra Day", "Fixed" },
                    { 9, new DateOnly(2026, 5, 28), "Bakri Id", "Optional" },
                    { 10, new DateOnly(2026, 6, 26), "Moharum", "Fixed" },
                    { 11, new DateOnly(2026, 8, 26), "Eid E Milad", "Optional" },
                    { 12, new DateOnly(2026, 8, 28), "Raksha Bandhan", "Optional" },
                    { 13, new DateOnly(2026, 9, 4), "Janmashtami", "Optional" },
                    { 14, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", "Fixed" },
                    { 15, new DateOnly(2026, 10, 2), "Gandhi Jayanthi", "Fixed" },
                    { 16, new DateOnly(2026, 10, 20), "Dussera", "Fixed" },
                    { 17, new DateOnly(2026, 11, 11), "Bhai Dooj", "Optional" },
                    { 18, new DateOnly(2026, 11, 10), "Diwali (Bali Pratipada)", "Fixed" },
                    { 19, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", "Optional" },
                    { 20, new DateOnly(2026, 12, 25), "Christmas", "Fixed" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Holidays");
        }
    }
}
