using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RelisoftHR.Data;
using RelisoftHR.Services;
using System.Collections.Concurrent;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"] ?? "";
if (builder.Environment.IsProduction() &&
    (jwtKey.Length < 32 || jwtKey == "ReliSoft-HR-SecretKey-2026-Must-Be-32-Chars!"))
    throw new InvalidOperationException("Jwt__Key must be overridden with a 32+ character secret in production.");

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Relisoft HR API",
        Version = "v1",
        Description = "Relisoft HR Portal API.\n\nDemo logins (password: `password`): `preeti`, `rakesh`, `aradhana`.\n\n1. Call `POST /api/auth/login` with `{ \"username\": \"preeti\", \"password\": \"password\" }`.\n2. Copy the `token` from the response.\n3. Click **Authorize** and paste the token (the `Bearer ` prefix is added automatically)."
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT token obtained from `POST /api/auth/login`."
    });
    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", doc, null),
            new List<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "RelisoftHR",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "RelisoftHR",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "ReliSoft-HR-SecretKey-2026-Must-Be-32-Chars!"))
        };
    });

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<NotificationHelper>();
        builder.Services.AddScoped<JoinerAnnouncementService>();
builder.Services.AddScoped<ILeaveBalanceService, LeaveBalanceService>();
        builder.Services.AddScoped<ILeaveAccrualService, LeaveAccrualService>();
builder.Services.AddScoped<IInternCompensationService, InternCompensationService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IOneDriveStorageService, OneDriveStorageService>();

// Leave carry-forward
builder.Services.Configure<LeavePolicyOptions>(builder.Configuration.GetSection("LeavePolicy"));
builder.Services.AddScoped<LeaveCarryForwardService>();
builder.Services.AddHostedService<LeaveCarryForwardBackgroundJob>();

// Payroll pipeline + automatic salary disbursement on the last working day of each month
builder.Services.Configure<PayrollOptions>(builder.Configuration.GetSection("Payroll"));
builder.Services.AddScoped<PayrollRunService>();
builder.Services.AddHostedService<PayrollDisbursementBackgroundJob>();

var corsOrigins = (builder.Configuration["CorsOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50_000_000;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

var openApiEnabled = builder.Configuration.GetValue<bool>("OpenApi:Enabled", true);
if (openApiEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Relisoft HR API v1");
        options.DocumentTitle = "Relisoft HR API";
        options.RoutePrefix = "swagger";
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

var rateLimitStore = new ConcurrentDictionary<string, List<DateTime>>();
var disableRateLimit = builder.Configuration.GetValue<bool>("Security:DisableRateLimit", false);
if (!disableRateLimit)
{
    app.Use(async (context, next) =>
    {
        var path = context.Request.Path.Value ?? "";
        if (HttpMethods.IsPost(context.Request.Method) && path.EndsWith("/api/auth/login", StringComparison.OrdinalIgnoreCase))
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var now = DateTime.UtcNow;
            var attempts = rateLimitStore.GetOrAdd(ip, _ => new List<DateTime>());
            attempts.Add(now);
            attempts.RemoveAll(t => now - t > TimeSpan.FromMinutes(5));
            if (attempts.Count > 20)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.Response.WriteAsJsonAsync(new { message = "Too many login attempts. Try again in a few minutes." });
                return;
            }
        }
        await next();
    });
}

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await WorkforceSeeder.SeedAsync(db);
    await DemoDataSeeder.SeedAsync(db);
    await PayrollDefaultsSeeder.SeedAsync(db);
    await AppraisalCycleSeeder.SeedAsync(db);
    await DemoSeedService.SeedAsync(db);
}

app.Run();
