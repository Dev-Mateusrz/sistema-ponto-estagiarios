using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaTotalTrabalhado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "HoraEntrada",
                table: "RegistrosPonto",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "TotalTrabalhado",
                table: "RegistrosPonto",
                type: "time",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosPonto_AcademicoId",
                table: "RegistrosPonto",
                column: "AcademicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosPonto_Academicos_AcademicoId",
                table: "RegistrosPonto",
                column: "AcademicoId",
                principalTable: "Academicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosPonto_Academicos_AcademicoId",
                table: "RegistrosPonto");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosPonto_AcademicoId",
                table: "RegistrosPonto");

            migrationBuilder.DropColumn(
                name: "TotalTrabalhado",
                table: "RegistrosPonto");

            migrationBuilder.AlterColumn<DateTime>(
                name: "HoraEntrada",
                table: "RegistrosPonto",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }
    }
}
