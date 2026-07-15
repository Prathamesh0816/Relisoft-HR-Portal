using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using RelisoftHR.Controllers;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class TicketsControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly TicketsController _controller;

    public TicketsControllerTests()
    {
        _db = TestDbContext.Create();
        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var logger = new NullLogger<NotificationHelper>();
        var email = new EmailService(new NullLogger<EmailService>(), config);
        var notifSvc = new NotificationService(_db, new NullLogger<NotificationService>());
        var notif = new NotificationHelper(email, notifSvc, _db, logger);
        _controller = new TicketsController(_db, notif);
    }

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task CreateTicket_ReturnsSuccess()
    {
        var ok = Assert.IsType<OkObjectResult>(await _controller.CreateTicket(new CreateTicketRequest(
            EmployeeId: 3, Category: "HR Related", RequestType: "Document Request",
            ItemDetail: null, Subject: "Need experience letter",
            Description: "Please provide a copy"
        )));

        var ticket = await _db.EmployeeTickets.FindAsync(1);
        Assert.NotNull(ticket);
        Assert.Equal("Submitted", ticket.Status);
        Assert.Equal("Need experience letter", ticket.Subject);
    }

    [Fact]
    public async Task GetEmployeeTickets_ReturnsCorrectTickets()
    {
        await _controller.CreateTicket(new CreateTicketRequest(3, "HR Related", "Document Request", null, "Letter", "Need copy"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetEmployeeTickets(3));
        dynamic? response = ok.Value;
        Assert.NotNull(response);
    }

    [Fact]
    public async Task GetHrTickets_ReturnsAllTickets()
    {
        await _controller.CreateTicket(new CreateTicketRequest(3, "HR Related", "Document Request", null, "Letter", "Need copy"));
        await _controller.CreateTicket(new CreateTicketRequest(1, "General", "Other Inquiry", null, "Query", "Test"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetHrTickets());
        dynamic? response = ok.Value;
        Assert.NotNull(response);
    }

    [Fact]
    public async Task AddTimeline_ReturnsSuccess()
    {
        await _controller.CreateTicket(new CreateTicketRequest(3, "HR Related", "Document Request", null, "Letter", "Need copy"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.AddTimeline(1, new AddTimelineRequest("In Progress", "Working on it", null)));

        var events = await _db.EmployeeTicketTimelineEvents.Where(e => e.TicketId == 1).ToListAsync();
        Assert.NotEmpty(events);
        Assert.Contains(events, e => e.Status == "In Progress");
    }

    [Fact]
    public async Task CancelTicket_ReturnsSuccess()
    {
        await _controller.CreateTicket(new CreateTicketRequest(3, "HR Related", "Document Request", null, "Letter", "Need copy"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.CancelTicket(1, new CancelTicketRequest(3, "No longer needed")));

        var ticket = await _db.EmployeeTickets.FindAsync(1);
        Assert.NotNull(ticket);
        Assert.Equal("Cancelled", ticket.Status);
    }
}
