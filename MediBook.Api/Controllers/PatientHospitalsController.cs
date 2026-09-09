using System.Text.RegularExpressions;
using MediBook.Api.Data;
using MediBook.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    public class CreatePatientHospitalDto
    {
        public int PatientId { get; set; }
        public int HospitalId { get; set; }
    }

    [ApiController]
    [Route("api/patient-hospitals")]
    [Route("api/[controller]")]
    public class PatientHospitalsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public PatientHospitalsController(MediBookDbContext context)
        {
            _context = context;
        }

        // GET: /api/patient-hospitals/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetPatientVisitorCards(int patientId)
        {
            var cards = await _context.PatientHospitals
                .AsNoTracking()
                .Where(ph => ph.PatientId == patientId)
                .Select(ph => new
                {
                    ph.Id,
                    ph.PatientId,
                    PatientName = ph.Patient != null ? ph.Patient.Name : "Patient",
                    PatientMobile = ph.Patient != null ? ph.Patient.Mobile : null,
                    PatientEmail = ph.Patient != null ? ph.Patient.Email : null,
                    ph.HospitalId,
                    HospitalName = ph.Hospital != null ? ph.Hospital.Name : "Hospital",
                    HospitalCity = ph.Hospital != null ? ph.Hospital.City : null,
                    HospitalPhone = ph.Hospital != null ? ph.Hospital.Phone : null,
                    ph.VisitorCardNumber,
                    ph.IssuedDate,
                    ph.Status
                })
                .OrderByDescending(ph => ph.IssuedDate)
                .ToListAsync();

            return Ok(cards);
        }

        // GET: /api/patient-hospitals/patient/{patientId}/hospital/{hospitalId}
        [HttpGet("patient/{patientId}/hospital/{hospitalId}")]
        public async Task<IActionResult> GetVisitorCard(int patientId, int hospitalId)
        {
            var card = await _context.PatientHospitals
                .AsNoTracking()
                .Where(ph => ph.PatientId == patientId && ph.HospitalId == hospitalId)
                .Select(ph => new
                {
                    ph.Id,
                    ph.PatientId,
                    PatientName = ph.Patient != null ? ph.Patient.Name : "Patient",
                    PatientMobile = ph.Patient != null ? ph.Patient.Mobile : null,
                    PatientEmail = ph.Patient != null ? ph.Patient.Email : null,
                    ph.HospitalId,
                    HospitalName = ph.Hospital != null ? ph.Hospital.Name : "Hospital",
                    HospitalCity = ph.Hospital != null ? ph.Hospital.City : null,
                    HospitalPhone = ph.Hospital != null ? ph.Hospital.Phone : null,
                    ph.VisitorCardNumber,
                    ph.IssuedDate,
                    ph.Status
                })
                .FirstOrDefaultAsync();

            if (card == null)
            {
                return NotFound(new { message = "No visitor card found for this patient at the specified hospital." });
            }

            return Ok(card);
        }

        // GET: /api/patient-hospitals/hospital/{hospitalId}
        [HttpGet("hospital/{hospitalId}")]
        public async Task<IActionResult> GetHospitalVisitorCards(int hospitalId)
        {
            var cards = await _context.PatientHospitals
                .AsNoTracking()
                .Where(ph => ph.HospitalId == hospitalId)
                .Select(ph => new
                {
                    ph.Id,
                    ph.PatientId,
                    PatientName = ph.Patient != null ? ph.Patient.Name : "Patient",
                    PatientMobile = ph.Patient != null ? ph.Patient.Mobile : null,
                    PatientEmail = ph.Patient != null ? ph.Patient.Email : null,
                    ph.HospitalId,
                    HospitalName = ph.Hospital != null ? ph.Hospital.Name : "Hospital",
                    ph.VisitorCardNumber,
                    ph.IssuedDate,
                    ph.Status
                })
                .OrderByDescending(ph => ph.IssuedDate)
                .ToListAsync();

            return Ok(cards);
        }

        // GET: /api/patient-hospitals/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVisitorCardById(int id)
        {
            var card = await _context.PatientHospitals
                .AsNoTracking()
                .Where(ph => ph.Id == id)
                .Select(ph => new
                {
                    ph.Id,
                    ph.PatientId,
                    PatientName = ph.Patient != null ? ph.Patient.Name : "Patient",
                    PatientMobile = ph.Patient != null ? ph.Patient.Mobile : null,
                    PatientEmail = ph.Patient != null ? ph.Patient.Email : null,
                    ph.HospitalId,
                    HospitalName = ph.Hospital != null ? ph.Hospital.Name : "Hospital",
                    HospitalCity = ph.Hospital != null ? ph.Hospital.City : null,
                    HospitalPhone = ph.Hospital != null ? ph.Hospital.Phone : null,
                    ph.VisitorCardNumber,
                    ph.IssuedDate,
                    ph.Status
                })
                .FirstOrDefaultAsync();

            if (card == null)
            {
                return NotFound(new { message = "Visitor card not found." });
            }

            return Ok(card);
        }

        // POST: /api/patient-hospitals
        // Safe "Get or Create" implementation
        [HttpPost]
        public async Task<IActionResult> GetOrCreateVisitorCard([FromBody] CreatePatientHospitalDto dto)
        {
            if (dto == null || dto.PatientId <= 0 || dto.HospitalId <= 0)
            {
                return BadRequest(new { message = "Valid PatientId and HospitalId are required." });
            }

            // 1. Search if relationship already exists
            var existing = await _context.PatientHospitals
                .Include(ph => ph.Patient)
                .Include(ph => ph.Hospital)
                .FirstOrDefaultAsync(ph => ph.PatientId == dto.PatientId && ph.HospitalId == dto.HospitalId);

            if (existing != null)
            {
                // Returning patient: return existing visitor card
                return Ok(new
                {
                    existing.Id,
                    existing.PatientId,
                    PatientName = existing.Patient?.Name ?? "Patient",
                    PatientMobile = existing.Patient?.Mobile,
                    existing.HospitalId,
                    HospitalName = existing.Hospital?.Name ?? "Hospital",
                    HospitalCity = existing.Hospital?.City,
                    existing.VisitorCardNumber,
                    existing.IssuedDate,
                    existing.Status,
                    isNew = false,
                    message = "Existing visitor card retrieved."
                });
            }

            // 2. Validate patient and hospital existence
            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found." });
            }

            var hospital = await _context.Hospitals.FindAsync(dto.HospitalId);
            if (hospital == null)
            {
                return NotFound(new { message = "Hospital not found." });
            }

            // 3. Generate unique hospital-specific visitor card number
            var cardNumber = await GenerateUniqueVisitorCardNumberAsync(hospital.Id, hospital.Name);

            // 4. Create new PatientHospital record
            var newCard = new PatientHospital
            {
                PatientId = dto.PatientId,
                HospitalId = dto.HospitalId,
                VisitorCardNumber = cardNumber,
                IssuedDate = DateTime.UtcNow,
                Status = "Active"
            };

            try
            {
                _context.PatientHospitals.Add(newCard);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Concurrency safety: if another thread created it concurrently, retrieve the existing one
                var concurrentExisting = await _context.PatientHospitals
                    .Include(ph => ph.Patient)
                    .Include(ph => ph.Hospital)
                    .FirstOrDefaultAsync(ph => ph.PatientId == dto.PatientId && ph.HospitalId == dto.HospitalId);

                if (concurrentExisting != null)
                {
                    return Ok(new
                    {
                        concurrentExisting.Id,
                        concurrentExisting.PatientId,
                        PatientName = concurrentExisting.Patient?.Name ?? "Patient",
                        PatientMobile = concurrentExisting.Patient?.Mobile,
                        concurrentExisting.HospitalId,
                        HospitalName = concurrentExisting.Hospital?.Name ?? "Hospital",
                        HospitalCity = concurrentExisting.Hospital?.City,
                        concurrentExisting.VisitorCardNumber,
                        concurrentExisting.IssuedDate,
                        concurrentExisting.Status,
                        isNew = false,
                        message = "Existing visitor card retrieved."
                    });
                }
                throw;
            }

            return CreatedAtAction(nameof(GetVisitorCardById), new { id = newCard.Id }, new
            {
                newCard.Id,
                newCard.PatientId,
                PatientName = patient.Name,
                PatientMobile = patient.Mobile,
                newCard.HospitalId,
                HospitalName = hospital.Name,
                HospitalCity = hospital.City,
                newCard.VisitorCardNumber,
                newCard.IssuedDate,
                newCard.Status,
                isNew = true,
                message = "Visitor card generated successfully."
            });
        }

        // Helper: Generate hospital abbreviation (e.g. MediCare Hospital -> MCH, Apollo Care Hospital -> ACH)
        public static string GetHospitalCode(string hospitalName)
        {
            if (string.IsNullOrWhiteSpace(hospitalName))
            {
                return "HOS";
            }

            // Split into words, ignoring special characters and splitting camelCase (e.g. MediCare -> Medi Care)
            var cleanName = Regex.Replace(hospitalName.Trim(), @"[^\w\s]", "");
            cleanName = Regex.Replace(cleanName, @"([a-z])([A-Z])", "$1 $2");
            var words = cleanName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            if (words.Length >= 2)
            {
                // Take first letter of each word (up to 4 letters)
                var code = string.Concat(words.Select(w => char.ToUpperInvariant(w[0])));
                if (code.Length >= 2 && code.Length <= 4)
                {
                    return code;
                }
                if (code.Length > 4)
                {
                    return code.Substring(0, 4);
                }
            }

            // Single word name: take first 3 alphanumeric characters
            var lettersOnly = Regex.Replace(cleanName, @"[^a-zA-Z0-9]", "").ToUpperInvariant();
            if (lettersOnly.Length >= 3)
            {
                return lettersOnly.Substring(0, 3);
            }
            if (lettersOnly.Length > 0)
            {
                return lettersOnly.PadRight(3, 'X');
            }

            return "HOS";
        }

        private async Task<string> GenerateUniqueVisitorCardNumberAsync(int hospitalId, string hospitalName)
        {
            var code = GetHospitalCode(hospitalName);

            // Find count of existing visitor cards for this hospital
            var existingCount = await _context.PatientHospitals
                .CountAsync(ph => ph.HospitalId == hospitalId);

            var sequence = existingCount + 1;
            var candidate = $"MB-{code}-{sequence:D5}";

            // Ensure candidate is truly unique
            while (await _context.PatientHospitals.AnyAsync(ph => ph.VisitorCardNumber == candidate))
            {
                sequence++;
                candidate = $"MB-{code}-{sequence:D5}";
            }

            return candidate;
        }
    }
}
