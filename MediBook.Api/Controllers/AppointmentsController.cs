using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
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

    public class CompleteVisitDto
    {
        public int DoctorId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string Advice { get; set; } = string.Empty;
    }

    public class ConfirmDto
    {
        public int DoctorId { get; set; }
    }

    public class RescheduleDto
    {
        public int DoctorId { get; set; }
        public DateTime NewAppointmentDate { get; set; }
        public TimeSpan NewAppointmentTime { get; set; }
        public string? Reason { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly MediBookDbContext _context;
        private readonly INotificationService _notificationService;

        public AppointmentsController(MediBookDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = _context.PatientHospitals
                        .Where(ph => ph.PatientId == a.PatientId && ph.HospitalId == a.HospitalId)
                        .Select(ph => ph.VisitorCardNumber)
                        .FirstOrDefault(),
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
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = _context.PatientHospitals
                        .Where(ph => ph.PatientId == a.PatientId && ph.HospitalId == a.HospitalId)
                        .Select(ph => ph.VisitorCardNumber)
                        .FirstOrDefault(),
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
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = _context.PatientHospitals
                        .Where(ph => ph.PatientId == a.PatientId && ph.HospitalId == a.HospitalId)
                        .Select(ph => ph.VisitorCardNumber)
                        .FirstOrDefault(),
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
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = _context.PatientHospitals
                        .Where(ph => ph.PatientId == a.PatientId && ph.HospitalId == a.HospitalId)
                        .Select(ph => ph.VisitorCardNumber)
                        .FirstOrDefault(),
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
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = _context.PatientHospitals
                        .Where(ph => ph.PatientId == a.PatientId && ph.HospitalId == a.HospitalId)
                        .Select(ph => ph.VisitorCardNumber)
                        .FirstOrDefault(),
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

            // 1. Permanent Hospital-Specific Visitor Card (Get or Create)
            var visitorCard = await _context.PatientHospitals
                .FirstOrDefaultAsync(ph => ph.PatientId == dto.PatientId && ph.HospitalId == dto.HospitalId);

            bool isFirstVisit = false;
            if (visitorCard == null)
            {
                // First visit to this hospital → generate permanent visitor card
                isFirstVisit = true;
                var code = PatientHospitalsController.GetHospitalCode(hospital.Name);
                var count = await _context.PatientHospitals.CountAsync(ph => ph.HospitalId == dto.HospitalId);
                var seq = count + 1;
                var cardNum = $"MB-{code}-{seq:D5}";

                while (await _context.PatientHospitals.AnyAsync(ph => ph.VisitorCardNumber == cardNum))
                {
                    seq++;
                    cardNum = $"MB-{code}-{seq:D5}";
                }

                visitorCard = new PatientHospital
                {
                    PatientId = dto.PatientId,
                    HospitalId = dto.HospitalId,
                    VisitorCardNumber = cardNum,
                    IssuedDate = DateTime.UtcNow,
                    Status = "Active"
                };

                _context.PatientHospitals.Add(visitorCard);
            }

            // 2. Create the Appointment
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

            // Attach pre-fetched entities so NotificationService has immediate access
            appointment.Patient = patient;
            appointment.Doctor = doctor;
            appointment.Hospital = hospital;

            // Send real-time notifications for appointment creation
            await _notificationService.NotifyAppointmentCreatedAsync(appointment);
            
            // Reload the appointment with related entities to map it correctly
            var createdAppointment = await _context.Appointments
                .Where(a => a.Id == appointment.Id)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    PatientPhone = a.Patient.Mobile,
                    a.DoctorId,
                    DoctorName = a.Doctor.Name,
                    DoctorSpecialty = a.Doctor.Specialty,
                    a.HospitalId,
                    HospitalName = a.Hospital.Name,
                    VisitorCardNumber = visitorCard.VisitorCardNumber,
                    VisitorCardIssuedDate = visitorCard.IssuedDate,
                    IsFirstVisit = isFirstVisit,
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

            var oldStatus = appointment.Status;
            appointment.Status = dto.Status;
            await _context.SaveChangesAsync();

            // Send real-time notifications for status change
            await _notificationService.NotifyAppointmentStatusChangedAsync(appointment, oldStatus, dto.Status);

            return NoContent();
        }

        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> ConfirmAppointment(int id, [FromBody] ConfirmDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound(new { message = "Appointment not found." });

            if (appointment.DoctorId != dto.DoctorId)
                return Unauthorized(new { message = "You are not authorized to confirm this appointment." });

            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                return BadRequest(new { message = "Appointment cannot be confirmed in its current state." });

            var oldStatus = appointment.Status;
            appointment.Status = "Confirmed";
            await _context.SaveChangesAsync();

            await _notificationService.NotifyAppointmentStatusChangedAsync(appointment, oldStatus, "Confirmed");

            return NoContent();
        }

        [HttpPut("{id}/reschedule")]
        public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] RescheduleDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null) return NotFound(new { message = "Appointment not found." });

                if (appointment.DoctorId != dto.DoctorId)
                    return Unauthorized(new { message = "You are not authorized to reschedule this appointment." });

                if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                    return BadRequest(new { message = "Appointment cannot be rescheduled in its current state." });

                // Check for conflict
                var hasConflict = await _context.Appointments
                    .AnyAsync(a => a.DoctorId == dto.DoctorId
                        && a.Id != appointment.Id
                        && a.AppointmentDate.Date == dto.NewAppointmentDate.Date
                        && a.AppointmentTime == dto.NewAppointmentTime
                        && a.Status != "Cancelled");

                if (hasConflict)
                    return Conflict(new { message = "The doctor already has an appointment at the selected date and time." });

                var reschedule = new AppointmentReschedule
                {
                    AppointmentId = appointment.Id,
                    OldAppointmentDate = appointment.AppointmentDate,
                    OldAppointmentTime = appointment.AppointmentTime,
                    NewAppointmentDate = dto.NewAppointmentDate.Date,
                    NewAppointmentTime = dto.NewAppointmentTime,
                    Reason = dto.Reason,
                    RescheduledByUserId = dto.DoctorId // Assuming DoctorId is a proxy for UserId for now or just logged
                };

                _context.AppointmentReschedules.Add(reschedule);

                appointment.AppointmentDate = dto.NewAppointmentDate.Date;
                appointment.AppointmentTime = dto.NewAppointmentTime;
                
                var oldStatus = appointment.Status;
                appointment.Status = "Confirmed";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _notificationService.NotifyAppointmentStatusChangedAsync(appointment, oldStatus, "Rescheduled");

                return Ok(appointment);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while rescheduling the appointment." });
            }
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteAppointment(int id, [FromBody] CompleteVisitDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound(new { message = "Appointment not found." });

            if (appointment.DoctorId != dto.DoctorId)
                return Unauthorized(new { message = "You are not authorized to complete this appointment." });

            if (appointment.Status != "Confirmed")
                return BadRequest(new { message = "Only confirmed appointments can be completed." });

            var details = new
            {
                diagnosis = dto.Diagnosis,
                prescription = dto.Prescription,
                advice = dto.Advice
            };

            var oldStatus = appointment.Status;
            appointment.Status = "Completed";
            appointment.Notes = System.Text.Json.JsonSerializer.Serialize(details);

            await _context.SaveChangesAsync();

            // Send real-time notifications for appointment completion
            await _notificationService.NotifyAppointmentStatusChangedAsync(appointment, oldStatus, "Completed");

            var updatedAppointment = await _context.Appointments
                .Where(a => a.Id == appointment.Id)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient.Name,
                    PatientPhone = a.Patient.Mobile,
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

            return Ok(updatedAppointment);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                return BadRequest(new { message = "Appointment cannot be cancelled in its current state." });

            var oldStatus = appointment.Status;
            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();

            // Send real-time notifications for appointment cancellation
            await _notificationService.NotifyAppointmentStatusChangedAsync(appointment, oldStatus, "Cancelled");

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