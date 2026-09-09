namespace MediBook.Api.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        public int PatientId { get; set; }

        public int DoctorId { get; set; }

        public int HospitalId { get; set; }

        public DateTime AppointmentDate { get; set; }

        public TimeSpan AppointmentTime { get; set; }

        public string Status { get; set; } = "Pending";

        public string? Reason { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationships
        public Patient Patient { get; set; } = null!;

        public Doctor Doctor { get; set; } = null!;

        public Hospital Hospital { get; set; } = null!;
    }
}