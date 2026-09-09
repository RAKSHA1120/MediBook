using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public ReportsController(MediBookDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin()
        {
            if (Request.Headers.TryGetValue("X-User-Role", out var roleValues))
            {
                var role = roleValues.FirstOrDefault();
                return string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }

        private IQueryable<Models.Appointment> GetFilteredAppointments(string period)
        {
            var query = _context.Appointments.AsNoTracking();

            var today = DateTime.UtcNow.Date;

            switch (period?.ToLower())
            {
                case "today":
                    query = query.Where(a => a.AppointmentDate.Date == today);
                    break;
                case "weekly":
                    // From start of current week (assuming Monday) to end of week
                    int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                    var startOfWeek = today.AddDays(-1 * diff).Date;
                    var endOfWeek = startOfWeek.AddDays(7);
                    query = query.Where(a => a.AppointmentDate >= startOfWeek && a.AppointmentDate < endOfWeek);
                    break;
                case "monthly":
                    var startOfMonth = new DateTime(today.Year, today.Month, 1);
                    var endOfMonth = startOfMonth.AddMonths(1);
                    query = query.Where(a => a.AppointmentDate >= startOfMonth && a.AppointmentDate < endOfMonth);
                    break;
                case "yearly":
                    var startOfYear = new DateTime(today.Year, 1, 1);
                    var endOfYear = startOfYear.AddYears(1);
                    query = query.Where(a => a.AppointmentDate >= startOfYear && a.AppointmentDate < endOfYear);
                    break;
            }

            return query;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] string period = "all")
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Only admins can access reports." });

            var query = GetFilteredAppointments(period);

            var total = await query.CountAsync();
            var completed = await query.CountAsync(a => a.Status == "Completed");
            var upcoming = await query.CountAsync(a => a.Status == "Confirmed" || a.Status == "Scheduled" || a.Status == "Upcoming");
            var pending = await query.CountAsync(a => a.Status == "Pending");
            var cancelled = await query.CountAsync(a => a.Status == "Cancelled");

            return Ok(new { Total = total, Completed = completed, Upcoming = upcoming, Pending = pending, Cancelled = cancelled });
        }

        [HttpGet("trend")]
        public async Task<IActionResult> GetTrend([FromQuery] string period = "weekly")
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Only admins can access reports." });

            var query = GetFilteredAppointments(period);

            var data = await query
                .GroupBy(a => a.AppointmentDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Visits = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(data.Select(x => new { Date = x.Date.ToString("yyyy-MM-dd"), Visits = x.Visits }));
        }

        [HttpGet("patient-wise")]
        public async Task<IActionResult> GetPatientWise([FromQuery] string period = "all")
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Only admins can access reports." });

            var query = GetFilteredAppointments(period);

            var data = await query
                .Include(a => a.Patient)
                .GroupBy(a => new { a.PatientId, a.Patient.Name })
                .Select(g => new
                {
                    PatientId = g.Key.PatientId,
                    PatientName = g.Key.Name,
                    TotalVisits = g.Count(),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Upcoming = g.Count(a => a.Status == "Confirmed" || a.Status == "Scheduled" || a.Status == "Upcoming"),
                    Pending = g.Count(a => a.Status == "Pending"),
                    Cancelled = g.Count(a => a.Status == "Cancelled")
                })
                .OrderByDescending(x => x.TotalVisits)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("doctor-wise")]
        public async Task<IActionResult> GetDoctorWise([FromQuery] string period = "all")
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Only admins can access reports." });

            var query = GetFilteredAppointments(period);

            var data = await query
                .Include(a => a.Doctor)
                .ThenInclude(d => d.Hospital)
                .GroupBy(a => new { a.DoctorId, a.Doctor.Name, HospitalName = a.Doctor.Hospital != null ? a.Doctor.Hospital.Name : "Unknown" })
                .Select(g => new
                {
                    DoctorId = g.Key.DoctorId,
                    DoctorName = g.Key.Name,
                    HospitalName = g.Key.HospitalName,
                    TotalVisits = g.Count(),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Upcoming = g.Count(a => a.Status == "Confirmed" || a.Status == "Scheduled" || a.Status == "Upcoming"),
                    Pending = g.Count(a => a.Status == "Pending"),
                    Cancelled = g.Count(a => a.Status == "Cancelled")
                })
                .OrderByDescending(x => x.TotalVisits)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("hospital-wise")]
        public async Task<IActionResult> GetHospitalWise([FromQuery] string period = "all")
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Only admins can access reports." });

            var query = GetFilteredAppointments(period);

            var data = await query
                .Include(a => a.Hospital)
                .GroupBy(a => new { a.HospitalId, a.Hospital.Name })
                .Select(g => new
                {
                    HospitalId = g.Key.HospitalId,
                    HospitalName = g.Key.Name,
                    TotalVisits = g.Count(),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Upcoming = g.Count(a => a.Status == "Confirmed" || a.Status == "Scheduled" || a.Status == "Upcoming"),
                    Pending = g.Count(a => a.Status == "Pending"),
                    Cancelled = g.Count(a => a.Status == "Cancelled")
                })
                .OrderByDescending(x => x.TotalVisits)
                .ToListAsync();

            return Ok(data);
        }
    }
}
