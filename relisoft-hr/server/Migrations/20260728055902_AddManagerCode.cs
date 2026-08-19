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
            // Some existing installations received ManagerCode before this migration
            // was recorded. Keep this migration safe to run against both schemas.
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.Employees', N'ManagerCode') IS NULL
                    ALTER TABLE [Employees] ADD [ManagerCode] nvarchar(50) NULL;
                """);

            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE [name] = N'AK_Employees_EmployeeCode')
                    ALTER TABLE [Employees] ADD CONSTRAINT [AK_Employees_EmployeeCode] UNIQUE ([EmployeeCode]);
                """);

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

            // Older databases only contain the first three demo employees at this
            // point. Do not let references to employees added by the runtime demo
            // seeder prevent the self-referencing foreign key from being created.
            migrationBuilder.Sql("""
                UPDATE employee
                SET [ManagerCode] = NULL
                FROM [Employees] AS employee
                LEFT JOIN [Employees] AS manager
                    ON manager.[EmployeeCode] = employee.[ManagerCode]
                WHERE employee.[ManagerCode] IS NOT NULL
                    AND manager.[Id] IS NULL;
                """);

            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Employees') AND [name] = N'IX_Employees_EmployeeCode')
                    CREATE UNIQUE INDEX [IX_Employees_EmployeeCode] ON [Employees] ([EmployeeCode]);

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Employees') AND [name] = N'IX_Employees_ManagerCode')
                    CREATE INDEX [IX_Employees_ManagerCode] ON [Employees] ([ManagerCode]);

                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = N'FK_Employees_Employees_ManagerCode')
                    ALTER TABLE [Employees] ADD CONSTRAINT [FK_Employees_Employees_ManagerCode]
                        FOREIGN KEY ([ManagerCode]) REFERENCES [Employees] ([EmployeeCode]) ON DELETE NO ACTION;
                """);
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
