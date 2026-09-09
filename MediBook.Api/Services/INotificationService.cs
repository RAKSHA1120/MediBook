using System.Threading.Tasks;
using MediBook.Api.Models;

namespace MediBook.Api.Services
{
    public interface INotificationService
    {
        Task<Notification?> SendNotificationAsync(int userId, string title, string message, string type = "appointment");
        Task NotifyAppointmentCreatedAsync(Appointment appointment);
        Task NotifyAppointmentStatusChangedAsync(Appointment appointment, string oldStatus, string newStatus);
    }
}
