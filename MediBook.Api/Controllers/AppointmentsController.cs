using MediBook.Api.Data;
using MediBook.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int HospitalId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string? Status { get; set; } = "Pending";
        public string? AppointmentType { get; set; }
        public string? Reason { get; set; }
        public decimal? ConsultationFee { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public AppointmentsController(MediBookDbContext context)
        {
            _context = context;
        }

        // GET: api/Appointments
        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.AppointmentType,
                    a.Reason,
                    a.ConsultationFee,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/Appointments/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.AppointmentType,
                    a.Reason,
                    a.ConsultationFee,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return NotFound(new
                {
                    message = "Appointment not found."
                });
            }

            return Ok(appointment);
        }

        // POST: api/Appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid appointment data." });
            }

            // 1. Verify Patient exists
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found." });
            }

            // 2. Verify Doctor exists
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null)
            {
                return NotFound(new { message = "Doctor not found." });
            }

            // 3. Verify Hospital exists
            var hospital = await _context.Hospitals
                .FirstOrDefaultAsync(h => h.Id == dto.HospitalId);
            if (hospital == null)
            {
                return NotFound(new { message = "Hospital not found." });
            }

            // 4. Verify selected Doctor belongs to selected Hospital
            if (doctor.HospitalId != dto.HospitalId)
            {
                return BadRequest(new { message = "Selected doctor does not belong to the selected hospital." });
            }

            // 5. Check slot conflict for same doctor at same date and time (ignoring Cancelled appointments)
            var targetDate = dto.AppointmentDate.Date;
            var hasConflict = await _context.Appointments
                .AnyAsync(a => a.DoctorId == dto.DoctorId
                    && a.AppointmentDate.Date == targetDate
                    && a.AppointmentTime == dto.AppointmentTime
                    && a.Status != "Cancelled");

            if (hasConflict)
            {
                return Conflict(new { message = "The doctor already has an appointment at the selected date and time." });
            }

            // Create new Appointment record
            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                HospitalId = dto.HospitalId,
                AppointmentDate = targetDate,
                AppointmentTime = dto.AppointmentTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                AppointmentType = dto.AppointmentType,
                Reason = dto.Reason,
                ConsultationFee = dto.ConsultationFee ?? doctor.ConsultationFee,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var response = new
            {
                id = appointment.Id,
                patientId = appointment.PatientId,
                patientName = patient.Name,
                doctorId = appointment.DoctorId,
                doctorName = doctor.Name,
                hospitalId = appointment.HospitalId,
                hospitalName = hospital.Name,
                appointmentDate = appointment.AppointmentDate,
                appointmentTime = appointment.AppointmentTime,
                status = appointment.Status,
                appointmentType = appointment.AppointmentType,
                reason = appointment.Reason,
                consultationFee = appointment.ConsultationFee,
                createdAt = appointment.CreatedAt,
                updatedAt = appointment.UpdatedAt
            };

            return CreatedAtAction(
                nameof(GetAppointment),
                new { id = appointment.Id },
                response
            );
        }
    }
}