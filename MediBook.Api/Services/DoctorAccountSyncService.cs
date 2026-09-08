using MediBook.Api.Data;
using MediBook.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Services
{
    public class DoctorAccountSyncService : IDoctorAccountSyncService
    {
        private readonly MediBookDbContext _context;
        private readonly ILogger<DoctorAccountSyncService> _logger;

        public DoctorAccountSyncService(MediBookDbContext context, ILogger<DoctorAccountSyncService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SyncDoctorAccountsAsync()
        {
            try
            {
                _logger.LogInformation("Starting conservative Doctor Account Synchronization...");

                // 1. Normalize Role casing for all users with role 'doctor' -> 'Doctor'
                var doctorUsers = await _context.Users
                    .Where(u => u.Role.ToLower() == "doctor")
                    .ToListAsync();

                bool changesMade = false;

                foreach (var user in doctorUsers)
                {
                    if (user.Role != "Doctor")
                    {
                        _logger.LogInformation("Normalizing role casing for User {UserId} ({Email}) to 'Doctor'", user.Id, user.Email);
                        user.Role = "Doctor";
                        changesMade = true;
                    }
                }

                // 2. Unambiguous Doctor 3 repair
                // Doctor 3 has UserId = 10, which belongs to User 10 (Dr. Arun, arun@medibook.com)
                var doc3 = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == 3);
                var user10 = await _context.Users.FirstOrDefaultAsync(u => u.Id == 10);

                if (doc3 != null && user10 != null && doc3.UserId == 10)
                {
                    if (doc3.Name != "Dr. Arun" || doc3.Email != "arun@medibook.com")
                    {
                        _logger.LogInformation("Repairing Doctor 3 data mismatch: setting Name='Dr. Arun', Email='arun@medibook.com' to match linked User 10");
                        doc3.Name = "Dr. Arun";
                        doc3.Email = "arun@medibook.com";
                        changesMade = true;
                    }
                }

                // 3. Check if any Doctor has UserId == null or missing User
                var allDoctors = await _context.Doctors.ToListAsync();
                foreach (var doc in allDoctors)
                {
                    if (doc.UserId == null || !await _context.Users.AnyAsync(u => u.Id == doc.UserId))
                    {
                        // Check if an existing User exists with matching email
                        if (!string.IsNullOrWhiteSpace(doc.Email))
                        {
                            var matchingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == doc.Email.Trim().ToLower());
                            if (matchingUser != null)
                            {
                                _logger.LogInformation("Linking Doctor {DoctorId} ({DoctorName}) to existing User {UserId} by matching email", doc.Id, doc.Name, matchingUser.Id);
                                doc.UserId = matchingUser.Id;
                                matchingUser.Role = "Doctor";
                                changesMade = true;
                            }
                        }
                    }
                }

                // 4. Log orphan Doctor-role Users (DO NOT automatically create Doctor records, per safety rule #1 & #6)
                var allDoctorUserIds = doctorUsers.Select(u => u.Id).ToList();
                var linkedDoctorUserIds = allDoctors.Where(d => d.UserId.HasValue).Select(d => d.UserId!.Value).ToHashSet();

                var orphanUsers = doctorUsers.Where(u => !linkedDoctorUserIds.Contains(u.Id)).ToList();
                foreach (var orphan in orphanUsers)
                {
                    _logger.LogWarning("Orphan Doctor-role User identified (no Doctor profile in Doctors table): User {UserId} ({Name}, {Email}). Preserving user without inventing fake doctor profile.", orphan.Id, orphan.Name, orphan.Email);
                }

                // 5. Ensure missing User accounts for the 3 target Hospitals (City Care Hospital [2], jothika care [3], impres [4])
                var targetHospitalIds = new List<int> { 2, 3, 4 };
                var targetHospitals = await _context.Hospitals
                    .Where(h => targetHospitalIds.Contains(h.Id))
                    .ToListAsync();

                foreach (var hosp in targetHospitals)
                {
                    if (string.IsNullOrWhiteSpace(hosp.Email)) continue;

                    var email = hosp.Email.Trim().ToLower();
                    bool userExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == email);

                    if (!userExists)
                    {
                        _logger.LogInformation("Creating missing User account for Hospital {HospitalId} ({HospitalName}, {Email})", hosp.Id, hosp.Name, hosp.Email);

                        var newHospitalUser = new User
                        {
                            Name = hosp.Name,
                            Email = hosp.Email.Trim(),
                            Password = "Hospital@123",
                            Role = "Hospital",
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Users.Add(newHospitalUser);
                        changesMade = true;
                    }
                }

                if (changesMade)
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Doctor Account Synchronization changes saved successfully.");
                }
                else
                {
                    _logger.LogInformation("Doctor Account Synchronization completed. All records already consistent.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Doctor Account Synchronization");
            }
        }
    }
}
