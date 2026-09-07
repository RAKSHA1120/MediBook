using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediBook.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientHospitalTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PatientHospitals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    HospitalId = table.Column<int>(type: "int", nullable: false),
                    VisitorCardNumber = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IssuedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientHospitals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientHospitals_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientHospitals_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientHospitals_HospitalId",
                table: "PatientHospitals",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientHospitals_PatientId_HospitalId",
                table: "PatientHospitals",
                columns: new[] { "PatientId", "HospitalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PatientHospitals_VisitorCardNumber",
                table: "PatientHospitals",
                column: "VisitorCardNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientHospitals");
        }
    }
}
