using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class AddManagerCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManagerCode",
                table: "Employees",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Employees_EmployeeCode",
                table: "Employees",
                column: "EmployeeCode");

            migrationBuilder.UpdateData(
                 table: "Employees",
                 keyColumn: "Id",
                 keyValue: 1,
                 column: "ManagerCode",
                 value: "EMP-002"); // Preeti Patil -> Rakesh Patil

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 2,
                column: "ManagerCode",
                value: null); // Rakesh Patil (CEO) -> no manager

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 3,
                column: "ManagerCode",
                value: "EMP-004"); // Aradhana Shinde -> Arif Nadeem Mirza

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 4,
                column: "ManagerCode",
                value: null); // Arif Nadeem Mirza -> no manager

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 5,
                column: "ManagerCode",
                value: "EMP-004"); // Girish Patil -> Arif Nadeem Mirza

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 6,
                column: "ManagerCode",
                value: "EMP-004"); // Shreerang Joshi -> Arif Nadeem Mirza

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 7,
                column: "ManagerCode",
                value: "EMP-004"); // Prathamesh Katikar -> Arif Nadeem Mirza

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 8,
                column: "ManagerCode",
                value: "EMP-002"); // Super HR -> Rakesh Patil

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 9,
                column: "ManagerCode",
                value: "EMP-002"); // Unnati Gawali -> Rakesh Patil

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeCode",
                table: "Employees",
                column: "EmployeeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerCode",
                table: "Employees",
                column: "ManagerCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Employees_ManagerCode",
                table: "Employees",
                column: "ManagerCode",
                principalTable: "Employees",
                principalColumn: "EmployeeCode",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Employees_ManagerCode",
                table: "Employees");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Employees_EmployeeCode",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_EmployeeCode",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_ManagerCode",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ManagerCode",
                table: "Employees");
        }
    }
}
