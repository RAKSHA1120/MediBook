namespace MediBook.Api.Models
{
    public class PatientHospital
    {
        public int Id { get; set; }

        public int PatientId { get; set; }

        public int HospitalId { get; set; }

        public string VisitorCardNumber { get; set; } = string.Empty;

        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Active";

        // Navigation properties
        public Patient? Patient { get; set; }

        public Hospital? Hospital { get; set; }
    }
}
