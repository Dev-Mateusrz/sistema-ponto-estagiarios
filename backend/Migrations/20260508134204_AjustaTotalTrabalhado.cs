using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AjustaTotalTrabalhado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TotalTrabalhado",
                table: "RegistrosPonto",
                type: "nvarchar(max)",
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
        }
    }
}
