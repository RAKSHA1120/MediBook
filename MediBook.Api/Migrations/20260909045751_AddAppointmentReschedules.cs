using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediBook.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentReschedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentReschedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    OldAppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OldAppointmentTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    NewAppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NewAppointmentTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RescheduledByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentReschedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppointmentReschedules_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppointmentReschedules_Users_RescheduledByUserId",
                        column: x => x.RescheduledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentReschedules_AppointmentId",
                table: "AppointmentReschedules",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentReschedules_RescheduledByUserId",
                table: "AppointmentReschedules",
                column: "RescheduledByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentReschedules");
        }
    }
}
