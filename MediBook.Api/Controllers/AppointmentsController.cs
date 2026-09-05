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
        public string? Reason { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
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
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(appointments);
        }

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
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (appointment == null) return NotFound();

            return Ok(appointment);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetPatientAppointments(int patientId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PatientId == patientId)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();
            return Ok(appointments);
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();
            return Ok(appointments);
        }

        [HttpGet("hospital/{hospitalId}")]
        public async Task<IActionResult> GetHospitalAppointments(int hospitalId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.HospitalId == hospitalId)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (dto == null) return BadRequest(new { message = "Invalid appointment data." });

            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null) return NotFound(new { message = "Patient not found." });

            var doctor = await _context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null) return NotFound(new { message = "Doctor not found." });

            var hospital = await _context.Hospitals.FindAsync(dto.HospitalId);
            if (hospital == null) return NotFound(new { message = "Hospital not found." });

            if (doctor.HospitalId != dto.HospitalId)
                return BadRequest(new { message = "Selected doctor does not belong to the selected hospital." });

            var hasConflict = await _context.Appointments
                .AnyAsync(a => a.DoctorId == dto.DoctorId
                    && a.AppointmentDate.Date == dto.AppointmentDate.Date
                    && a.AppointmentTime == dto.AppointmentTime
                    && a.Status != "Cancelled");

            if (hasConflict)
                return Conflict(new { message = "The doctor already has an appointment at the selected date and time." });

            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                HospitalId = dto.HospitalId,
                AppointmentDate = dto.AppointmentDate.Date,
                AppointmentTime = dto.AppointmentTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                Reason = dto.Reason,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            
            // Reload the appointment with related entities to map it correctly
            var createdAppointment = await _context.Appointments
                .Where(a => a.Id == appointment.Id)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Reason,
                    a.Notes,
                    a.CreatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, createdAppointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, Appointment appointment)
        {
            if (id != appointment.Id) return BadRequest();

            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            appointment.Status = dto.Status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.Id == id);
        }
    }
}