using MediBook.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with JSON options
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

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
            .AllowAnyMethod();
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

app.UseCors("AllowReactApp");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

app.Run();