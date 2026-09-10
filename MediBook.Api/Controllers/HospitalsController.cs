using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HospitalsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public HospitalsController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = await _context.Hospitals.ToListAsync();
            return Ok(hospitals);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHospital(int id)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital == null) return NotFound();
            return Ok(hospital);
        }

        [HttpPost]
        public async Task<IActionResult> CreateHospital(Hospital hospital)
        {
            if (!string.IsNullOrEmpty(hospital.Phone) && !PhoneNumberValidator.IsValid(hospital.Phone))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate email unique
                if (!string.IsNullOrEmpty(hospital.Email) && await _context.Hospitals.AnyAsync(h => h.Email == hospital.Email))
                {
                    return BadRequest(new { message = "Hospital email is already registered." });
                }

                string loginId = !string.IsNullOrEmpty(hospital.Email) 
                    ? hospital.Email 
                    : $"{hospital.Name.ToLower().Replace(" ", "")}@medibook.com";

                if (await _context.Users.AnyAsync(u => u.Email == loginId))
                {
                    return BadRequest(new { message = "Login ID is already in use by another user." });
                }

                string tempPassword = $"Hospital@{new Random().Next(1000, 9999)}";

                var user = new User
                {
                    Name = hospital.Name,
                    Email = loginId,
                    Password = tempPassword,
                    Role = "Hospital"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                hospital.Email = loginId; // Ensure hospital email matches user email
                _context.Hospitals.Add(hospital);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new {
                    hospitalId = hospital.Id,
                    hospitalName = hospital.Name,
                    loginId = loginId,
                    temporaryPassword = tempPassword
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while creating the hospital." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHospital(int id, Hospital hospital)
        {
            if (id != hospital.Id) return BadRequest();

            if (!string.IsNullOrEmpty(hospital.Phone) && !PhoneNumberValidator.IsValid(hospital.Phone))
            {
                return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
            }

            _context.Entry(hospital).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HospitalExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHospital(int id)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital == null) return NotFound();

            _context.Hospitals.Remove(hospital);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool HospitalExists(int id)
        {
            return _context.Hospitals.Any(e => e.Id == id);
        }
    }
}