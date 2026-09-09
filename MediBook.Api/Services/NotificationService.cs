using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Hubs;
using MediBook.Api.Models;

namespace MediBook.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly MediBookDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(MediBookDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<Notification?> SendNotificationAsync(int userId, string title, string message, string type = "appointment")
        {
            if (userId <= 0) return null;

            try
            {
                // 1. Persist notification in SQL Server database first
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                // 2. Deliver real-time notification via SignalR to user-specific group
                var payload = new
                {
                    id = notification.Id,
                    userId = notification.UserId,
                    title = notification.Title,
                    message = notification.Message,
                    type = type,
                    isRead = notification.IsRead,
                    createdAt = notification.CreatedAt
                };

                await _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", payload);

                return notification;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[NotificationService] Error sending notification to user {userId}: {ex.Message}");
                return null;
            }
        }

        public async Task NotifyAppointmentCreatedAsync(Appointment appointment)
        {
            if (appointment == null) return;

            try
            {
                var patient = appointment.Patient ?? await _context.Patients.FindAsync(appointment.PatientId);
                var doctor = appointment.Doctor ?? await _context.Doctors.FindAsync(appointment.DoctorId);
                var hospital = appointment.Hospital ?? await _context.Hospitals.FindAsync(appointment.HospitalId);

                string patientName = patient?.Name ?? "Patient";
                string doctorName = doctor?.Name ?? "Doctor";
                string hospitalName = hospital?.Name ?? "Hospital";
                string dateStr = appointment.AppointmentDate.ToString("MMM dd, yyyy");

                // 1. Notify Patient
                if (patient != null && patient.UserId > 0)
                {
                    await SendNotificationAsync(
                        patient.UserId,
                        "Appointment Booked",
                        $"Your appointment with Dr. {doctorName} at {hospitalName} on {dateStr} has been booked successfully.",
                        "appointment"
                    );
                }

                // 2. Notify Doctor
                int doctorUserId = doctor?.UserId ?? 0;
                if (doctorUserId == 0 && doctor != null && !string.IsNullOrEmpty(doctor.Email))
                {
                    var docUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == doctor.Email);
                    if (docUser != null) doctorUserId = docUser.Id;
                }
                if (doctorUserId > 0)
                {
                    await SendNotificationAsync(
                        doctorUserId,
                        "New Appointment",
                        $"You have received a new appointment from {patientName} scheduled for {dateStr}.",
                        "appointment"
                    );
                }

                // 3. Notify Hospital
                var hospitalUser = await GetHospitalUserAsync(appointment.HospitalId, hospital);
                if (hospitalUser != null)
                {
                    Console.WriteLine($"[NotificationService] Appointment {appointment.Id}: HospitalId={appointment.HospitalId}, HospitalUserId={hospitalUser.Id}");
                    Console.WriteLine($"[NotificationService] Sending hospital notification to user-{hospitalUser.Id}");

                    await SendNotificationAsync(
                        hospitalUser.Id,
                        "New Appointment",
                        $"A new appointment has been booked at {hospitalName}.",
                        "appointment"
                    );
                }

                // 4. Notify System Admins
                var adminUsers = await _context.Users
                    .Where(u => u.Role == "Admin")
                    .ToListAsync();

                foreach (var admin in adminUsers)
                {
                    await SendNotificationAsync(
                        admin.Id,
                        "New Appointment",
                        $"A new appointment (#{appointment.Id}) has been booked for {patientName} with Dr. {doctorName} at {hospitalName}.",
                        "appointment"
                    );
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[NotificationService] Error notifying appointment creation: {ex.Message}");
            }
        }

        public async Task NotifyAppointmentStatusChangedAsync(Appointment appointment, string oldStatus, string newStatus)
        {
            if (appointment == null || string.Equals(oldStatus, newStatus, StringComparison.OrdinalIgnoreCase))
                return;

            try
            {
                var patient = appointment.Patient ?? await _context.Patients.FindAsync(appointment.PatientId);
                var doctor = appointment.Doctor ?? await _context.Doctors.FindAsync(appointment.DoctorId);
                var hospital = appointment.Hospital ?? await _context.Hospitals.FindAsync(appointment.HospitalId);

                string patientName = patient?.Name ?? "Patient";
                string doctorName = doctor?.Name ?? "Doctor";
                string hospitalName = hospital?.Name ?? "Hospital";

                // 1. Notify Patient
                if (patient != null && patient.UserId > 0)
                {
                    string patientTitle = $"Appointment {newStatus}";
                    string patientMessage = $"Your appointment with Dr. {doctorName} at {hospitalName} has been {newStatus.ToLower()}.";

                    if (string.Equals(newStatus, "Confirmed", StringComparison.OrdinalIgnoreCase))
                    {
                        patientTitle = "Appointment Confirmed";
                        patientMessage = $"Your appointment with Dr. {doctorName} at {hospitalName} has been confirmed.";
                    }
                    else if (string.Equals(newStatus, "Completed", StringComparison.OrdinalIgnoreCase))
                    {
                        patientTitle = "Appointment Completed";
                        patientMessage = $"Your consultation with Dr. {doctorName} at {hospitalName} has been marked as completed.";
                    }
                    else if (string.Equals(newStatus, "Cancelled", StringComparison.OrdinalIgnoreCase))
                    {
                        patientTitle = "Appointment Cancelled";
                        patientMessage = $"Your appointment with Dr. {doctorName} at {hospitalName} has been cancelled.";
                    }

                    await SendNotificationAsync(patient.UserId, patientTitle, patientMessage, "appointment");
                }

                // 2. Notify Doctor
                int doctorUserId = doctor?.UserId ?? 0;
                if (doctorUserId == 0 && doctor != null && !string.IsNullOrEmpty(doctor.Email))
                {
                    var docUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == doctor.Email);
                    if (docUser != null) doctorUserId = docUser.Id;
                }
                if (doctorUserId > 0)
                {
                    await SendNotificationAsync(
                        doctorUserId,
                        "Appointment Status Updated",
                        $"Appointment #{appointment.Id} for {patientName} has been updated to {newStatus}.",
                        "appointment"
                    );
                }

                // 3. Notify Hospital
                var hospitalUser = await GetHospitalUserAsync(appointment.HospitalId, hospital);
                if (hospitalUser != null)
                {
                    Console.WriteLine($"[NotificationService] Appointment {appointment.Id} Status Update: HospitalId={appointment.HospitalId}, HospitalUserId={hospitalUser.Id}");
                    Console.WriteLine($"[NotificationService] Sending hospital status notification to user-{hospitalUser.Id}");

                    await SendNotificationAsync(
                        hospitalUser.Id,
                        "Appointment Status Updated",
                        $"Appointment #{appointment.Id} status has been updated to {newStatus}.",
                        "appointment"
                    );
                }

                // 4. Notify System Admins
                var adminUsers = await _context.Users
                    .Where(u => u.Role == "Admin")
                    .ToListAsync();

                foreach (var admin in adminUsers)
                {
                    await SendNotificationAsync(
                        admin.Id,
                        "Appointment Status Updated",
                        $"Appointment #{appointment.Id} status has been updated to {newStatus}.",
                        "appointment"
                    );
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[NotificationService] Error notifying appointment status change: {ex.Message}");
            }
        }

        private async Task<User?> GetHospitalUserAsync(int hospitalId, Hospital? hospital = null)
        {
            try
            {
                if (hospital == null && hospitalId > 0)
                {
                    hospital = await _context.Hospitals.FindAsync(hospitalId);
                }

                if (hospital == null)
                {
                    Console.WriteLine($"[NotificationService] Hospital notification skipped: no Hospital record found for HospitalId {hospitalId}");
                    return null;
                }

                // Resolve Hospital's User account using the SAME mapping logic used by AuthController / UsersController:
                // 1. Check by Hospital Email first (case-insensitive)
                User? hospitalUser = null;
                if (!string.IsNullOrWhiteSpace(hospital.Email))
                {
                    var emailTrimmed = hospital.Email.Trim();
                    hospitalUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Role.ToLower() == "hospital" && u.Email.ToLower() == emailTrimmed.ToLower());
                }

                // 2. Check by Hospital Name if not found by email (case-insensitive)
                if (hospitalUser == null && !string.IsNullOrWhiteSpace(hospital.Name))
                {
                    var nameTrimmed = hospital.Name.Trim();
                    hospitalUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Role.ToLower() == "hospital" && u.Name.ToLower() == nameTrimmed.ToLower());
                }

                // 3. Fallback: check convention loginId e.g. hospitalname@medibook.com
                if (hospitalUser == null && !string.IsNullOrWhiteSpace(hospital.Name))
                {
                    string generatedEmail = $"{hospital.Name.ToLower().Replace(" ", "")}@medibook.com";
                    hospitalUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Role.ToLower() == "hospital" && u.Email.ToLower() == generatedEmail.ToLower());
                }

                // 4. Verify user exists and Role is Hospital
                if (hospitalUser == null || !string.Equals(hospitalUser.Role, "Hospital", StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine($"[NotificationService] Hospital notification skipped: no User account found for HospitalId {hospitalId}");
                    return null;
                }

                return hospitalUser;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[NotificationService] Error resolving Hospital User for HospitalId {hospitalId}: {ex.Message}");
                return null;
            }
        }
    }
}
