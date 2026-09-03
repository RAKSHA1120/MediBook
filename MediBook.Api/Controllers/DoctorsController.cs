using MediBook.Api.Data;
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
                    specialization = d.Specialization,
                    qualification = d.Qualification,
                    experience = d.Experience,
                    email = d.Email,
                    mobile = d.Mobile,
                    consultationFee = d.ConsultationFee,
                    profileImage = d.ProfileImage,
                    location = d.Location,
                    status = d.Status,

                    hospital = new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        type = d.Hospital.Type,
                        category = d.Hospital.Category,
                        address = d.Hospital.Address,
                        location = d.Hospital.Location,
                        city = d.Hospital.City,
                        state = d.Hospital.State
                    }
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctor(int id)
        {
            var doctor = await _context.Doctors
                .Where(d => d.Id == id)
                .Select(d => new
                {
                    id = d.Id,
                    userId = d.UserId,
                    hospitalId = d.HospitalId,
                    name = d.Name,
                    specialization = d.Specialization,
                    qualification = d.Qualification,
                    experience = d.Experience,
                    email = d.Email,
                    mobile = d.Mobile,
                    consultationFee = d.ConsultationFee,
                    profileImage = d.ProfileImage,
                    location = d.Location,
                    status = d.Status,

                    hospital = d.Hospital == null ? null : new
                    {
                        id = d.Hospital.Id,
                        name = d.Hospital.Name,
                        type = d.Hospital.Type,
                        category = d.Hospital.Category,
                        address = d.Hospital.Address,
                        location = d.Hospital.Location,
                        city = d.Hospital.City,
                        state = d.Hospital.State
                    }
                })
                .FirstOrDefaultAsync();

            if (doctor == null)
            {
                return NotFound();
            }

            return Ok(doctor);
        }
    }
}