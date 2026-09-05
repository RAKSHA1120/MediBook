using MediBook.Api.Data;
using MediBook.Api.Models;
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
                    specialization = d.Specialty, // frontend might expect specialization
                    experience = d.Experience,
                    email = d.Email,
                    mobile = d.Phone, // frontend might expect mobile
                    status = d.IsActive ? "Active" : "Inactive",

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        address = d.Hospital.Address
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
                    specialization = d.Specialty,
                    experience = d.Experience,
                    email = d.Email,
                    mobile = d.Phone,
                    status = d.IsActive ? "Active" : "Inactive",

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        address = d.Hospital.Address
                    }
                })
                .FirstOrDefaultAsync();

            if (doctor == null) return NotFound();

            return Ok(doctor);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetDoctorByUserId(int userId)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctor(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, Doctor doctor)
        {
            if (id != doctor.Id) return BadRequest();
            _context.Entry(doctor).State = EntityState.Modified;
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