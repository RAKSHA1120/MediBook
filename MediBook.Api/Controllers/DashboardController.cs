using MediBook.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public DashboardController(MediBookDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalPatients = await _context.Patients.CountAsync();
            var totalDoctors = await _context.Doctors.CountAsync();
            var totalHospitals = await _context.Hospitals.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();
            
            var today = DateTime.UtcNow.Date;
            var todayAppointments = await _context.Appointments
                .Where(a => a.AppointmentDate.Date == today)
                .CountAsync();

            return Ok(new
            {
                totalPatients,
                totalDoctors,
                totalHospitals,
                totalAppointments,
                todayAppointments
            });
        }
    }
}
