using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MediBook.Api.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task JoinUserGroup(int userId)
        {
            if (userId > 0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            }
        }

        public async Task LeaveUserGroup(int userId)
        {
            if (userId > 0)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            }
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
