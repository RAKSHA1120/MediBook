using Microsoft.AspNetCore.Mvc;
using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public AuthController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.LoginId) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Login ID and Password are required." });
            }

            string trimmedLoginId = request.LoginId.Trim();

            // If login identifier is a mobile number (not email, starts with digit or '+'), validate 10 digits
            if (!trimmedLoginId.Contains('@') && (char.IsDigit(trimmedLoginId[0]) || trimmedLoginId.StartsWith("+")))
            {
                if (!PhoneNumberValidator.IsValid(trimmedLoginId))
                {
                    return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
                }
            }

            // 1. Find user by LoginId (email) first — single-column lookup is faster
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == request.LoginId);

            // Check password in memory (avoids complex compound query timeouts)
            if (user != null && user.Password != request.Password)
            {
                user = null;
            }

            // 2. If not found by email, try patient mobile number lookup
            if (user == null)
            {
                var patient = await _context.Patients
                    .AsNoTracking()
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Mobile == request.LoginId);

                if (patient?.User != null && patient.User.Password == request.Password)
                {
                    user = patient.User;
                }
            }

            if (user != null)
            {
                int? refId = null;

                if (user.Role.ToLower() == "patient")
                {
                    var p = await _context.Patients.FirstOrDefaultAsync(x => x.UserId == user.Id);
                    if (p != null)
                    {
                        if (!p.IsActive)
                        {
                            return Unauthorized(new { message = "This patient account has been deactivated. Please contact your administrator." });
                        }
                        refId = p.Id;
                    }
                }
                else if (user.Role.ToLower() == "doctor")
                {
                    var d = await _context.Doctors.FirstOrDefaultAsync(x => x.UserId == user.Id)
                            ?? await _context.Doctors.FirstOrDefaultAsync(x => x.Email == user.Email);
                    if (d != null)
                    {
                        if (!d.IsActive)
                        {
                            return Unauthorized(new { message = "This doctor account has been deactivated. Please contact your administrator." });
                        }
                        refId = d.Id;
                    }
                }
                else if (user.Role.ToLower() == "hospital")
                {
                    var h = await _context.Hospitals.FirstOrDefaultAsync(x => x.Email == user.Email)
                            ?? await _context.Hospitals.FirstOrDefaultAsync(x => x.Name == user.Name);
                    if (h != null)
                    {
                        if (!h.IsActive)
                        {
                            return Unauthorized(new { message = "This hospital account has been deactivated. Please contact your administrator." });
                        }
                        refId = h.Id;
                    }
                }

                return Ok(new
                {
                    id = user.Id,
                    loginId = user.Email,
                    mobile = user.Email,
                    role = user.Role,
                    name = user.Name,
                    refId = refId,
                    profileImageUrl = user.ProfileImageUrl
                });
            }

            return Unauthorized(new { message = "Invalid login credentials." });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Mobile) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Name))
            {
                return BadRequest(new { message = "Name, Mobile, and Password are required." });
            }

            if (!PhoneNumberValidator.IsValid(request.Mobile, out string phoneError))
            {
                return BadRequest(new { message = phoneError });
            }

            if (!PasswordValidator.IsValid(request.Password, out string passwordError))
            {
                return BadRequest(new { message = passwordError });
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Mobile);
            var existingPatient = await _context.Patients.FirstOrDefaultAsync(p => p.Mobile == request.Mobile);

            if (existingUser != null || existingPatient != null)
            {
                return BadRequest(new { message = "This mobile number is already registered. Please sign in." });
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Mobile, // Using Mobile as Email/LoginId for Patients
                Password = request.Password,
                Role = "Patient"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var patient = new Patient
            {
                UserId = user.Id,
                Name = request.Name,
                Mobile = request.Mobile,
                Gender = string.IsNullOrEmpty(request.Gender) ? "Not specified" : request.Gender,
                Address = ""
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = user.Id,
                loginId = user.Email,
                mobile = user.Email,
                role = user.Role,
                name = user.Name,
                refId = patient.Id
            });
        }
    }
}
