using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    public class UpdateUserStatusRequest
    {
        public string Status { get; set; } = "Active";
    }

    public class ResetUserPasswordRequest
    {
        public string? LoginId { get; set; }
        public string? Mobile { get; set; }
        public string? NewPassword { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public UsersController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.AsNoTracking().ToListAsync();
            var doctors = await _context.Doctors.AsNoTracking().ToListAsync();
            var patients = await _context.Patients.AsNoTracking().ToListAsync();
            var hospitals = await _context.Hospitals.AsNoTracking().ToListAsync();

            var result = users.Select(u =>
            {
                int? doctorId = null;
                int? refId = null;
                string status = "Active";

                var roleLower = u.Role?.ToLower() ?? "user";
                if (roleLower == "doctor")
                {
                    var doc = doctors.FirstOrDefault(d => d.UserId == u.Id)
                              ?? doctors.FirstOrDefault(d => !string.IsNullOrEmpty(d.Email) && d.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase));
                    if (doc != null)
                    {
                        doctorId = doc.Id;
                        refId = doc.Id;
                        status = doc.IsActive ? "Active" : "Inactive";
                    }
                }
                else if (roleLower == "patient")
                {
                    var p = patients.FirstOrDefault(pt => pt.UserId == u.Id)
                            ?? patients.FirstOrDefault(pt => pt.Mobile == u.Email || (!string.IsNullOrEmpty(pt.Email) && pt.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase)));
                    if (p != null)
                    {
                        refId = p.Id;
                        status = p.IsActive ? "Active" : "Inactive";
                    }
                }
                else if (roleLower == "hospital")
                {
                    var h = hospitals.FirstOrDefault(hp => (!string.IsNullOrEmpty(hp.Email) && hp.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase))
                                                          || hp.Name.Equals(u.Name, StringComparison.OrdinalIgnoreCase));
                    if (h != null)
                    {
                        refId = h.Id;
                        status = h.IsActive ? "Active" : "Inactive";
                    }
                }

                string formattedRole = char.ToUpper(roleLower[0]) + roleLower.Substring(1);

                return new
                {
                    id = u.Id,
                    name = u.Name,
                    loginId = u.Email,
                    role = formattedRole,
                    doctorId = doctorId,
                    hospitalId = (roleLower == "hospital" ? refId : (int?)null),
                    refId = refId,
                    status = status,
                    createdAt = u.CreatedAt,
                    createdDate = u.CreatedAt
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var u = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (u == null) return NotFound();

            int? doctorId = null;
            int? refId = null;
            string status = "Active";

            var roleLower = u.Role?.ToLower() ?? "user";
            if (roleLower == "doctor")
            {
                var doc = await _context.Doctors.AsNoTracking().FirstOrDefaultAsync(d => d.UserId == u.Id)
                          ?? await _context.Doctors.AsNoTracking().FirstOrDefaultAsync(d => !string.IsNullOrEmpty(d.Email) && d.Email == u.Email);
                if (doc != null)
                {
                    doctorId = doc.Id;
                    refId = doc.Id;
                    status = doc.IsActive ? "Active" : "Inactive";
                }
            }
            else if (roleLower == "patient")
            {
                var p = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(pt => pt.UserId == u.Id);
                if (p != null)
                {
                    refId = p.Id;
                    status = p.IsActive ? "Active" : "Inactive";
                }
            }
            else if (roleLower == "hospital")
            {
                var h = await _context.Hospitals.AsNoTracking().FirstOrDefaultAsync(hp => hp.Email == u.Email);
                if (h != null)
                {
                    refId = h.Id;
                    status = h.IsActive ? "Active" : "Inactive";
                }
            }

            string formattedRole = char.ToUpper(roleLower[0]) + roleLower.Substring(1);

            return Ok(new
            {
                id = u.Id,
                name = u.Name,
                loginId = u.Email,
                role = formattedRole,
                doctorId = doctorId,
                hospitalId = (roleLower == "hospital" ? refId : (int?)null),
                refId = refId,
                status = status,
                createdAt = u.CreatedAt,
                createdDate = u.CreatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id) return BadRequest();
            _context.Entry(user).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            bool isActive = request.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);

            var roleLower = user.Role?.ToLower() ?? "";
            if (roleLower == "doctor")
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id)
                             ?? await _context.Doctors.FirstOrDefaultAsync(d => d.Email == user.Email);
                if (doctor != null)
                {
                    doctor.IsActive = isActive;
                }
            }
            else if (roleLower == "patient")
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (patient != null)
                {
                    patient.IsActive = isActive;
                }
            }
            else if (roleLower == "hospital")
            {
                var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Email == user.Email);
                if (hospital != null)
                {
                    hospital.IsActive = isActive;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Account status set to {(isActive ? "Active" : "Inactive")}", status = isActive ? "Active" : "Inactive" });
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetUserPasswordRequest? request)
        {
            return await HandleResetPassword(id, request);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPasswordPublic([FromBody] ResetUserPasswordRequest? request)
        {
            return await HandleResetPassword(null, request);
        }

        private async Task<IActionResult> HandleResetPassword(int? id, ResetUserPasswordRequest? request)
        {
            User? user = null;
            if (id.HasValue && id.Value > 0)
            {
                user = await _context.Users.FindAsync(id.Value);
            }
            else
            {
                string? identifier = !string.IsNullOrWhiteSpace(request?.Mobile)
                    ? request.Mobile.Trim()
                    : request?.LoginId?.Trim();

                if (string.IsNullOrWhiteSpace(identifier))
                {
                    return BadRequest(new { message = "Mobile number or Login ID is required." });
                }

                if (!string.IsNullOrWhiteSpace(request?.Mobile) && !PhoneNumberValidator.IsValid(request.Mobile))
                {
                    return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
                }

                if (!identifier.Contains('@') && (char.IsDigit(identifier[0]) || identifier.StartsWith("+")))
                {
                    if (!PhoneNumberValidator.IsValid(identifier))
                    {
                        return BadRequest(new { message = PhoneNumberValidator.ErrorMessage });
                    }
                }

                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == identifier);
                if (user == null)
                {
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Mobile == identifier);
                    if (patient != null && patient.UserId > 0)
                    {
                        user = await _context.Users.FindAsync(patient.UserId);
                    }
                }
            }

            if (user == null) return NotFound(new { message = "User not found." });

            bool isPatient = string.Equals(user.Role, "Patient", StringComparison.OrdinalIgnoreCase);

            string targetPassword = !string.IsNullOrWhiteSpace(request?.NewPassword)
                ? request.NewPassword.Trim()
                : (string.Equals(user.Role, "Doctor", StringComparison.OrdinalIgnoreCase) ? "Doctor@123" : "MediBook@123");

            // Strong-password validation in password reset must apply ONLY when the target account is a Patient
            if (isPatient)
            {
                if (!PasswordValidator.IsValid(targetPassword, out string errorMessage))
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            user.Password = targetPassword;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password has been reset successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
