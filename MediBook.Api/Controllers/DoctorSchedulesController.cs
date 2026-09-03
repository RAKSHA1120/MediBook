using MediBook.Api.Data;
using MediBook.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Controllers
{
    public class CreateDoctorScheduleDto
    {
        public int DoctorId { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class UpdateDoctorScheduleDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DoctorSchedulesController : ControllerBase
    {
        private readonly MediBookDbContext _context;

        public DoctorSchedulesController(MediBookDbContext context)
        {
            _context = context;
        }

        // GET: api/DoctorSchedules
        [HttpGet]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _context.DoctorSchedules
                .Select(ds => new
                {
                    id = ds.Id,
                    doctorId = ds.DoctorId,
                    doctorName = ds.Doctor != null ? ds.Doctor.Name : null,
                    dayOfWeek = ds.DayOfWeek,
                    startTime = ds.StartTime,
                    endTime = ds.EndTime,
                    isAvailable = ds.IsAvailable
                })
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/DoctorSchedules/doctor/1
        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetDoctorSchedules(int doctorId)
        {
            var schedules = await _context.DoctorSchedules
                .Where(ds => ds.DoctorId == doctorId)
                .Select(ds => new
                {
                    id = ds.Id,
                    doctorId = ds.DoctorId,
                    dayOfWeek = ds.DayOfWeek,
                    startTime = ds.StartTime,
                    endTime = ds.EndTime,
                    isAvailable = ds.IsAvailable
                })
                .ToListAsync();

            return Ok(schedules);
        }

        // POST: api/DoctorSchedules
        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateDoctorScheduleDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid schedule data." });
            }

            if (string.IsNullOrWhiteSpace(dto.DayOfWeek))
            {
                return BadRequest(new { message = "DayOfWeek is required." });
            }

            // 1. Verify Doctor exists
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null)
            {
                return BadRequest(new { message = "Doctor not found." });
            }

            // 2. Validate StartTime < EndTime
            if (dto.StartTime >= dto.EndTime)
            {
                return BadRequest(new { message = "StartTime must be earlier than EndTime." });
            }

            var dayNormalized = dto.DayOfWeek.Trim();

            // 3. Prevent duplicate schedule records for same DoctorId + DayOfWeek + StartTime + EndTime
            var isDuplicate = await _context.DoctorSchedules
                .AnyAsync(ds => ds.DoctorId == dto.DoctorId
                    && ds.DayOfWeek.ToLower() == dayNormalized.ToLower()
                    && ds.StartTime == dto.StartTime
                    && ds.EndTime == dto.EndTime);

            if (isDuplicate)
            {
                return BadRequest(new { message = "A schedule with the same day and time slot already exists for this doctor." });
            }

            var schedule = new DoctorSchedule
            {
                DoctorId = dto.DoctorId,
                DayOfWeek = dayNormalized,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsAvailable = dto.IsAvailable
            };

            _context.DoctorSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            var response = new
            {
                id = schedule.Id,
                doctorId = schedule.DoctorId,
                doctorName = doctor.Name,
                dayOfWeek = schedule.DayOfWeek,
                startTime = schedule.StartTime,
                endTime = schedule.EndTime,
                isAvailable = schedule.IsAvailable
            };

            return CreatedAtAction(
                nameof(GetDoctorSchedules),
                new { doctorId = schedule.DoctorId },
                response
            );
        }

        // PUT: api/DoctorSchedules/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateDoctorScheduleDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid schedule data." });
            }

            var schedule = await _context.DoctorSchedules.FirstOrDefaultAsync(ds => ds.Id == id);
            if (schedule == null)
            {
                return NotFound(new { message = "Schedule not found." });
            }

            if (string.IsNullOrWhiteSpace(dto.DayOfWeek))
            {
                return BadRequest(new { message = "DayOfWeek is required." });
            }

            if (dto.StartTime >= dto.EndTime)
            {
                return BadRequest(new { message = "StartTime must be earlier than EndTime." });
            }

            var dayNormalized = dto.DayOfWeek.Trim();

            var isDuplicate = await _context.DoctorSchedules
                .AnyAsync(ds => ds.Id != id
                    && ds.DoctorId == schedule.DoctorId
                    && ds.DayOfWeek.ToLower() == dayNormalized.ToLower()
                    && ds.StartTime == dto.StartTime
                    && ds.EndTime == dto.EndTime);

            if (isDuplicate)
            {
                return BadRequest(new { message = "A schedule with the same day and time slot already exists for this doctor." });
            }

            schedule.DayOfWeek = dayNormalized;
            schedule.StartTime = dto.StartTime;
            schedule.EndTime = dto.EndTime;
            schedule.IsAvailable = dto.IsAvailable;

            await _context.SaveChangesAsync();

            var response = new
            {
                id = schedule.Id,
                doctorId = schedule.DoctorId,
                dayOfWeek = schedule.DayOfWeek,
                startTime = schedule.StartTime,
                endTime = schedule.EndTime,
                isAvailable = schedule.IsAvailable
            };

            return Ok(response);
        }

        // DELETE: api/DoctorSchedules/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.DoctorSchedules.FirstOrDefaultAsync(ds => ds.Id == id);
            if (schedule == null)
            {
                return NotFound(new { message = "Schedule not found." });
            }

            _context.DoctorSchedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}