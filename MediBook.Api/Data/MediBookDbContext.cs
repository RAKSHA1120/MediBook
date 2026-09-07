using MediBook.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MediBook.Api.Data
{
    public class MediBookDbContext : DbContext
    {
        public MediBookDbContext(DbContextOptions<MediBookDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PatientHospital> PatientHospitals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User → Patient (One-to-One)
            modelBuilder.Entity<Patient>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Patient>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User → Doctor (One-to-One)
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.User)
                .WithOne()
                .HasForeignKey<Doctor>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Hospital → Doctors (One-to-Many)
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Hospital)
                .WithMany(h => h.Doctors)
                .HasForeignKey(d => d.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Doctor → ConsultationFee precision
            modelBuilder.Entity<Doctor>()
                .Property(d => d.ConsultationFee)
                .HasPrecision(18, 2);

            // Doctor → DoctorSchedules (One-to-Many)
            modelBuilder.Entity<DoctorSchedule>()
                .HasOne(ds => ds.Doctor)
                .WithMany(d => d.Schedules)
                .HasForeignKey(ds => ds.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Patient → Appointments (One-to-Many)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Doctor → Appointments (One-to-Many)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Hospital → Appointments (One-to-Many)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Hospital)
                .WithMany(h => h.Appointments)
                .HasForeignKey(a => a.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);

            // User → Notifications (One-to-Many)
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // PatientHospital (Hospital-Specific Patient Visitor Card)
            modelBuilder.Entity<PatientHospital>(entity =>
            {
                entity.HasKey(ph => ph.Id);

                entity.HasOne(ph => ph.Patient)
                    .WithMany(p => p.PatientHospitals)
                    .HasForeignKey(ph => ph.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ph => ph.Hospital)
                    .WithMany(h => h.PatientHospitals)
                    .HasForeignKey(ph => ph.HospitalId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Unique constraint: PatientId + HospitalId (one visitor card per patient per hospital)
                entity.HasIndex(ph => new { ph.PatientId, ph.HospitalId })
                    .IsUnique();

                // Unique constraint: VisitorCardNumber must be unique
                entity.HasIndex(ph => ph.VisitorCardNumber)
                    .IsUnique();
            });
        }
    }
}