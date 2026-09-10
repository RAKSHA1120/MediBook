using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public PatientsController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            var patients = await _context.Patients.ToListAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetPatientByUserId(int userId)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient(Patient patient)
        {
            if (!string.IsNullOrEmpty(patient.Mobile) && !PhoneNumberValidator.IsValid(patient.Mobile))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }

            if (patient.DOB.HasValue)
            {
                if (!TryCalculateAge(patient.DOB.Value, out int calculatedAge, out string? dobError))
                {
                    return BadRequest(new { message = dobError });
                }
                patient.Age = calculatedAge;
            }

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, Patient patient)
        {
            if (id != patient.Id) return BadRequest();

            if (!string.IsNullOrEmpty(patient.Mobile) && !PhoneNumberValidator.IsValid(patient.Mobile))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }

            if (patient.DOB.HasValue)
            {
                if (!TryCalculateAge(patient.DOB.Value, out int calculatedAge, out string? dobError))
                {
                    return BadRequest(new { message = dobError });
                }
                patient.Age = calculatedAge;
            }

            _context.Entry(patient).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        private static bool TryCalculateAge(DateTime dob, out int age, out string? error)
        {
            var birthDate = dob.Date;
            var today = DateTime.Today;

            if (birthDate > today)
            {
                age = 0;
                error = "Date of Birth cannot be in the future.";
                return false;
            }

            int calculatedAge = today.Year - birthDate.Year;
            if (today.Month < birthDate.Month || (today.Month == birthDate.Month && today.Day < birthDate.Day))
            {
                calculatedAge--;
            }

            age = calculatedAge;
            error = null;
            return true;
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.Id == id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}