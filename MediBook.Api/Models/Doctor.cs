using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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

        public string? ProfileImageUrl { get; set; }

        // Transient DOB properties for creation validation (Not mapped to DB schema)
        [NotMapped]
        [JsonIgnore]
        public DateTime? DOB { get; set; }

        [NotMapped]
        [JsonIgnore]
        public bool IsDobProvided { get; set; }

        [NotMapped]
        [JsonIgnore]
        public bool HasInvalidDobFormat { get; set; }

        [NotMapped]
        [JsonPropertyName("dob")]
        public object? DobRaw
        {
            get => DOB?.ToString("yyyy-MM-dd");
            set
            {
                if (value == null)
                {
                    DOB = null;
                    IsDobProvided = false;
                    return;
                }

                string str = value.ToString()?.Trim() ?? string.Empty;
                if (string.IsNullOrEmpty(str))
                {
                    DOB = null;
                    IsDobProvided = false;
                    return;
                }

                IsDobProvided = true;
                if (DateTime.TryParse(str, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt) ||
                    DateTime.TryParse(str, out dt))
                {
                    DOB = dt;
                }
                else
                {
                    HasInvalidDobFormat = true;
                }
            }
        }

        [NotMapped]
        [JsonPropertyName("dateOfBirth")]
        public object? DateOfBirthRaw
        {
            get => DobRaw;
            set => DobRaw = value;
        }

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