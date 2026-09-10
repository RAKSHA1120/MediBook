namespace MediBook.Api.Models
{
    public class AppointmentReschedule
    {
        public int Id { get; set; }

        public int AppointmentId { get; set; }

        public DateTime OldAppointmentDate { get; set; }

        public TimeSpan OldAppointmentTime { get; set; }

        public DateTime NewAppointmentDate { get; set; }

        public TimeSpan NewAppointmentTime { get; set; }

        public string? Reason { get; set; }

        public int RescheduledByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationships
        public Appointment Appointment { get; set; } = null!;
        
        public User RescheduledByUser { get; set; } = null!;
    }
}
