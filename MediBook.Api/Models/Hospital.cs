using System.Numerics;

namespace MediBook.Api.Models
{
    public class Hospital
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Type { get; set; }

        public string? Category { get; set; }

        public string? Address { get; set; }

        public string? Location { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship with Doctors
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();

        // Relationship with Appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}