using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MediBook.Api.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly MediBookDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProfileController(MediBookDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private async Task<(Models.User? user, int userId, string userRole)> GetAuthenticatedUserAsync()
        {
            if (!Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) || 
                !Request.Headers.TryGetValue("X-User-Role", out var userRoleHeader))
            {
                return (null, 0, string.Empty);
            }

            if (!int.TryParse(userIdHeader.ToString(), out int userId))
            {
                return (null, 0, string.Empty);
            }

            var user = await _context.Users.FindAsync(userId);
            return (user, userId, userRoleHeader.ToString().ToLower());
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var (user, userId, role) = await GetAuthenticatedUserAsync();
            if (user == null)
            {
                return Unauthorized(new { message = "Unauthorized access." });
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds the 5MB limit." });
            }

            // Validate file extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed." });
            }

            // Validate MIME type
            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return BadRequest(new { message = "Invalid MIME type." });
            }

            // Ensure directory exists
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "profile-images");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate safe filename
            var safeFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, safeFileName);
            var fileUrl = $"/uploads/profile-images/{safeFileName}";

            // Delete existing image if it exists
            await DeleteOldImageAsync(user.ProfileImageUrl, uploadsFolder);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update database
            user.ProfileImageUrl = fileUrl;
            _context.Entry(user).State = EntityState.Modified;

            // Sync with specific role table
            if (role == "patient")
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patient != null)
                {
                    patient.ProfileImageUrl = fileUrl;
                    _context.Entry(patient).State = EntityState.Modified;
                }
            }
            else if (role == "doctor")
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor != null)
                {
                    doctor.ProfileImageUrl = fileUrl;
                    _context.Entry(doctor).State = EntityState.Modified;
                }
            }
            else if (role == "hospital")
            {
                var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Email == user.Email);
                if (hospital != null)
                {
                    hospital.ProfileImageUrl = fileUrl;
                    _context.Entry(hospital).State = EntityState.Modified;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, profileImageUrl = fileUrl });
        }

        [HttpDelete("remove-image")]
        public async Task<IActionResult> RemoveImage()
        {
            var (user, userId, role) = await GetAuthenticatedUserAsync();
            if (user == null)
            {
                return Unauthorized(new { message = "Unauthorized access." });
            }

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "profile-images");
            
            // Delete existing image if it exists
            await DeleteOldImageAsync(user.ProfileImageUrl, uploadsFolder);

            // Update database
            user.ProfileImageUrl = null;
            _context.Entry(user).State = EntityState.Modified;

            // Sync with specific role table
            if (role == "patient")
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patient != null)
                {
                    patient.ProfileImageUrl = null;
                    _context.Entry(patient).State = EntityState.Modified;
                }
            }
            else if (role == "doctor")
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor != null)
                {
                    doctor.ProfileImageUrl = null;
                    _context.Entry(doctor).State = EntityState.Modified;
                }
            }
            else if (role == "hospital")
            {
                var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Email == user.Email);
                if (hospital != null)
                {
                    hospital.ProfileImageUrl = null;
                    _context.Entry(hospital).State = EntityState.Modified;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Profile image removed successfully." });
        }

        private async Task DeleteOldImageAsync(string? oldImageUrl, string uploadsFolder)
        {
            if (string.IsNullOrEmpty(oldImageUrl)) return;

            try
            {
                var oldFileName = Path.GetFileName(oldImageUrl);
                if (!string.IsNullOrEmpty(oldFileName))
                {
                    var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting old image: {ex.Message}");
            }
            
            await Task.CompletedTask;
        }
    }
}
