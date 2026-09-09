using MediBook.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace MediBook.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(MediBookDbContext context)
        {
            if (context.Users.Any())
            {
                return;
            }

            // Create Patient
            var patientUser = new User { Name = "Test Patient", Email = "2222222222", Password = "123456", Role = "Patient" };
            context.Users.Add(patientUser);

            // Create Admin
            var adminUser = new User { Name = "Admin User", Email = "admin", Password = "123456", Role = "Admin" };
            context.Users.Add(adminUser);

            // Create Doctor
            var doctorUser = new User { Name = "Test Doctor", Email = "doctor@medibook.com", Password = "123456", Role = "Doctor" };
            context.Users.Add(doctorUser);

            // Create Hospital
            var hospitalUser = new User { Name = "Test Hospital", Email = "hospital@medibook.com", Password = "123456", Role = "Hospital" };
            context.Users.Add(hospitalUser);

            context.SaveChanges();

            // Create Patient Profile
            var patient = new Patient { UserId = patientUser.Id, Name = "Test Patient", Mobile = "2222222222", Gender = "Male" };
            context.Patients.Add(patient);

            // Create Hospital Profile
            var hospital = new Hospital { Name = "Test Hospital", Email = "hospital@medibook.com", Address = "City Center", IsActive = true };
            context.Hospitals.Add(hospital);
            context.SaveChanges();

            // Create Doctor Profile
            var doctor = new Doctor { UserId = doctorUser.Id, HospitalId = hospital.Id, Name = "Dr. Test Doctor", Specialty = "General Physician", Email = "doctor@medibook.com", ConsultationFee = 500, IsActive = true };
            context.Doctors.Add(doctor);
            
            context.SaveChanges();
        }
    }
}
