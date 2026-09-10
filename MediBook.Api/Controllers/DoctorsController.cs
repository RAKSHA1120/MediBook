using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public DoctorsController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDoctors()
        {
            var doctors = await _context.Doctors
                .Include(d => d.Hospital)
                .Select(d => new
                {
                    id = d.Id,
                    userId = d.UserId,
                    hospitalId = d.HospitalId,
                    name = d.Name,
                    specialty = d.Specialty,
                    specialization = d.Specialty,
                    experience = d.Experience,
                    email = d.Email,
                    phone = d.Phone,
                    mobile = d.Phone,
                    qualification = d.Qualification,
                    consultationFee = d.ConsultationFee,
                    registrationNumber = d.RegistrationNumber,
                    profileImageUrl = d.ProfileImageUrl,
                    status = d.IsActive ? "Active" : "Inactive",

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        address = d.Hospital.Address,
                        type = d.Hospital.Type,
                        city = d.Hospital.City,
                        phone = d.Hospital.Phone,
                        email = d.Hospital.Email
                    }
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctor(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Hospital)
                .Where(d => d.Id == id)
                .Select(d => new
                {
                    id = d.Id,
                    userId = d.UserId,
                    hospitalId = d.HospitalId,
                    name = d.Name,
                    specialty = d.Specialty,
                    specialization = d.Specialty,
                    experience = d.Experience,
                    email = d.Email,
                    phone = d.Phone,
                    mobile = d.Phone,
                    qualification = d.Qualification,
                    consultationFee = d.ConsultationFee,
                    registrationNumber = d.RegistrationNumber,
                    profileImageUrl = d.ProfileImageUrl,
                    status = d.IsActive ? "Active" : "Inactive",

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        address = d.Hospital.Address,
                        type = d.Hospital.Type,
                        city = d.Hospital.City,
                        phone = d.Hospital.Phone,
                        email = d.Hospital.Email
                    }
                })
                .FirstOrDefaultAsync();

            if (doctor == null) return NotFound();

            return Ok(doctor);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetDoctorByUserId(int userId)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Hospital)
                .Where(d => d.UserId == userId)
                .Select(d => new
                {
                    id = d.Id,
                    userId = d.UserId,
                    hospitalId = d.HospitalId,
                    name = d.Name,
                    specialty = d.Specialty,
                    specialization = d.Specialty,
                    experience = d.Experience,
                    email = d.Email,
                    phone = d.Phone,
                    mobile = d.Phone,
                    qualification = d.Qualification,
                    consultationFee = d.ConsultationFee,
                    registrationNumber = d.RegistrationNumber,
                    profileImageUrl = d.ProfileImageUrl,
                    status = d.IsActive ? "Active" : "Inactive",

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        address = d.Hospital.Address,
                        type = d.Hospital.Type,
                        city = d.Hospital.City,
                        phone = d.Hospital.Phone,
                        email = d.Hospital.Email
                    }
                })
                .FirstOrDefaultAsync();

            if (doctor == null)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    doctor = await _context.Doctors
                        .Include(d => d.Hospital)
                        .Where(d => d.Email == user.Email)
                        .Select(d => new
                        {
                            id = d.Id,
                            userId = d.UserId,
                            hospitalId = d.HospitalId,
                            name = d.Name,
                            specialty = d.Specialty,
                            specialization = d.Specialty,
                            experience = d.Experience,
                            email = d.Email,
                            phone = d.Phone,
                            mobile = d.Phone,
                            qualification = d.Qualification,
                            consultationFee = d.ConsultationFee,
                            registrationNumber = d.RegistrationNumber,
                            profileImageUrl = d.ProfileImageUrl,
                            status = d.IsActive ? "Active" : "Inactive",

                            hospital = d.Hospital == null ? null : new
                            {
                                id = d.Hospital.Id,
                                name = d.Hospital.Name,
                                address = d.Hospital.Address,
                                type = d.Hospital.Type,
                                city = d.Hospital.City,
                                phone = d.Hospital.Phone,
                                email = d.Hospital.Email
                            }
                        })
                        .FirstOrDefaultAsync();
                }
            }

            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctor(Doctor doctor)
        {
            if (doctor.HasInvalidDobFormat)
            {
                return BadRequest(new { message = "Invalid Date of Birth format." });
            }

            if (!doctor.IsDobProvided || !doctor.DOB.HasValue)
            {
                return BadRequest(new { message = "Date of Birth is required." });
            }

            if (!TryCalculateDoctorAge(doctor.DOB.Value, out int calculatedAge, out string? dobError))
            {
                return BadRequest(new { message = dobError });
            }

            if (calculatedAge < 23)
            {
                return BadRequest(new { message = "Doctor must be at least 23 years old." });
            }

            if (!string.IsNullOrEmpty(doctor.Phone) && !PhoneNumberValidator.IsValid(doctor.Phone))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctor);
        }

        private static bool TryCalculateDoctorAge(DateTime dob, out int age, out string? error)
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, Doctor doctor)
        {
            if (id != doctor.Id) return BadRequest();

            if (!string.IsNullOrEmpty(doctor.Phone) && !PhoneNumberValidator.IsValid(doctor.Phone))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }
            
            var existingDoctor = await _context.Doctors.FindAsync(id);
            if (existingDoctor == null) return NotFound();

            existingDoctor.Name = doctor.Name;
            existingDoctor.Specialty = doctor.Specialty;
            existingDoctor.Experience = doctor.Experience;
            existingDoctor.Email = doctor.Email;
            existingDoctor.Phone = doctor.Phone;
            if (doctor.HospitalId > 0)
                existingDoctor.HospitalId = doctor.HospitalId;
            existingDoctor.IsActive = doctor.IsActive;
            
            if (doctor.Qualification != null)
                existingDoctor.Qualification = doctor.Qualification;
            if (doctor.ConsultationFee.HasValue)
                existingDoctor.ConsultationFee = doctor.ConsultationFee;
            if (doctor.RegistrationNumber != null)
                existingDoctor.RegistrationNumber = doctor.RegistrationNumber;
            if (!string.IsNullOrEmpty(doctor.ProfileImageUrl))
                existingDoctor.ProfileImageUrl = doctor.ProfileImageUrl;

            if (existingDoctor.UserId.HasValue)
            {
                var linkedUser = await _context.Users.FindAsync(existingDoctor.UserId.Value);
                if (linkedUser != null)
                {
                    if (!string.IsNullOrEmpty(doctor.Name)) linkedUser.Name = doctor.Name;
                    if (!string.IsNullOrEmpty(doctor.Email)) linkedUser.Email = doctor.Email;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.Id == id);
        }
    }
}