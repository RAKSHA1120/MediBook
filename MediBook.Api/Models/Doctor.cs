namespace MediBook.Api.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public int HospitalId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Specialty { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public int? Experience { get; set; }

        public string? Qualification { get; set; }

        public decimal? ConsultationFee { get; set; }

        public string? RegistrationNumber { get; set; }

        public bool IsActive { get; set; } = true;

        // Relationship with User
        public User? User { get; set; }

        // Relationship with Hospital
        public Hospital? Hospital { get; set; }

        // Relationship with DoctorSchedules
        public ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();

        // Relationship with Appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}