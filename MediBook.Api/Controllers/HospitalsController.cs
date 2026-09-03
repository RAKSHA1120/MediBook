using MediBook.Api.Data;
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
            var hospitals = await _context.Hospitals
                .ToListAsync();

            return Ok(hospitals);
        }
    }
}