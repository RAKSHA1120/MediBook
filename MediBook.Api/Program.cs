using MediBook.Api.Data;
using MediBook.Api.Hubs;
using MediBook.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with JSON options
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Add SignalR support
builder.Services.AddSignalR();

// Register Notification Service
builder.Services.AddScoped<INotificationService, NotificationService>();

// Register Doctor Account Sync Service
builder.Services.AddScoped<IDoctorAccountSyncService, DoctorAccountSyncService>();

// Add Swagger / OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Connect Entity Framework Core to SQL Server
builder.Services.AddDbContext<MediBookDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("MediBookConnection")
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5173",
                "https://localhost:5174"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
var app = builder.Build();




// Enable Swagger UI and JSON endpoint
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediBook API v1");
    c.RoutePrefix = "swagger";
});

app.UseStaticFiles();

app.UseCors("AllowReactApp");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

// Run conservative Doctor Account Sync on startup
using (var scope = app.Services.CreateScope())
{
    var syncService = scope.ServiceProvider.GetRequiredService<IDoctorAccountSyncService>();
    await syncService.SyncDoctorAccountsAsync();
}

// Ensure the Admin user exists with the correct credentials
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MediBookDbContext>();
    var adminEmail = "admin@medibook.com";
    var adminPassword = "Admin@123";
    var existingAdmin = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
    if (existingAdmin == null)
    {
        db.Users.Add(new MediBook.Api.Models.User
        {
            Name = "Admin",
            Email = adminEmail,
            Password = adminPassword,
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
    else if (existingAdmin.Password != adminPassword)
    {
        existingAdmin.Password = adminPassword;
        await db.SaveChangesAsync();
    }
}

app.Run();