namespace MediBook.Api.Models
{
    public class Patient
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Mobile { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? BloodGroup { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Pincode { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship with User
        public User User { get; set; } = null!;
    }
}