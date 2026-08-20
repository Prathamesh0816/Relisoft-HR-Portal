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

            // Only apply manager mappings when the target employees exist. On a fresh
            // database only EMP-001..003 are seeded (see SeedDemoUsers), so referencing
            // EMP-004 here would violate the self-referencing FK. Each UPDATE is guarded
            // by a check that both the source employee row and the manager row exist.
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 1)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-002')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-002' WHERE [Id] = 1;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 2)
                    UPDATE [Employees] SET [ManagerCode] = NULL WHERE [Id] = 2;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 3)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-004')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-004' WHERE [Id] = 3;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 4)
                    UPDATE [Employees] SET [ManagerCode] = NULL WHERE [Id] = 4;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 5)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-004')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-004' WHERE [Id] = 5;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 6)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-004')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-004' WHERE [Id] = 6;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 7)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-004')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-004' WHERE [Id] = 7;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 8)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-002')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-002' WHERE [Id] = 8;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Employees] WHERE [Id] = 9)
                AND EXISTS (SELECT 1 FROM [Employees] WHERE [EmployeeCode] = N'EMP-002')
                    UPDATE [Employees] SET [ManagerCode] = N'EMP-002' WHERE [Id] = 9;
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
