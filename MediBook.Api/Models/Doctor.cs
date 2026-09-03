namespace MediBook.Api.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int HospitalId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Specialization { get; set; } = string.Empty;

        public string? Qualification { get; set; }

        public int? Experience { get; set; }

        public string? Email { get; set; }

        public string? Mobile { get; set; }

        public decimal? ConsultationFee { get; set; }

        public string? ProfileImage { get; set; }

        public string? Location { get; set; }

        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship with User
        public User User { get; set; } = null!;

        // Relationship with Hospital
        public Hospital Hospital { get; set; } = null!;

        // Relationship with DoctorSchedules
        public ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();

        // Relationship with Appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}