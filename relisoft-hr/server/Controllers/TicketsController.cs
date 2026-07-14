using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TicketsController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult> CreateTicket(CreateTicketRequest req)
    {
        var ticket = new EmployeeTicket
        {
            EmployeeId = req.EmployeeId,
            Category = req.Category,
            RequestType = req.RequestType,
            ItemDetail = req.ItemDetail,
            Subject = req.Subject,
            Description = req.Description,
            Status = "Submitted"
        };

        _db.EmployeeTickets.Add(ticket);
        await _db.SaveChangesAsync();

        _db.EmployeeTicketTimelineEvents.Add(new EmployeeTicketTimelineEvent
        {
            TicketId = ticket.Id,
            Status = "Submitted",
            Notes = "Ticket generated."
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Ticket generated.", ticketId = ticket.Id });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult> GetEmployeeTickets(int employeeId)
    {
        var tickets = await _db.EmployeeTickets
            .Include(t => t.Timeline)
            .Where(t => t.EmployeeId == employeeId)
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();

        return Ok(new { tickets = tickets.Select(MapTicket).ToList() });
    }

    [HttpGet("hr")]
    public async Task<ActionResult> GetHrTickets()
    {
        var tickets = await _db.EmployeeTickets
            .Include(t => t.Timeline)
            .Where(t => t.Status != "Cancelled" && t.Status != "Closed")
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();

        return Ok(new { tickets = tickets.Select(MapTicket).ToList() });
    }

    [HttpPost("{id}/timeline")]
    public async Task<ActionResult> AddTimeline(int id, AddTimelineRequest req)
    {
        var ticket = await _db.EmployeeTickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found." });

        ticket.Status = req.Status;
        ticket.AssignedHrId = req.AssignedHrId;
        ticket.UpdatedOn = DateTime.UtcNow;

        if (req.AssignedHrId.HasValue)
        {
            var hr = await _db.Employees.FindAsync(req.AssignedHrId.Value);
            ticket.AssignedHrName = hr?.FullName;
        }

        _db.EmployeeTicketTimelineEvents.Add(new EmployeeTicketTimelineEvent
        {
            TicketId = id,
            Status = req.Status,
            Notes = req.Notes
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Timeline updated." });
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelTicket(int id, CancelTicketRequest req)
    {
        var ticket = await _db.EmployeeTickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found." });

        ticket.Status = "Cancelled";
        ticket.UpdatedOn = DateTime.UtcNow;

        _db.EmployeeTicketTimelineEvents.Add(new EmployeeTicketTimelineEvent
        {
            TicketId = id,
            Status = "Cancelled",
            Notes = req.Reason
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Ticket cancelled." });
    }

    private static TicketDto MapTicket(EmployeeTicket t)
    {
        return new TicketDto(
            t.Id, t.EmployeeId, t.Employee?.FullName ?? "", t.Employee?.EmployeeCode ?? "",
            t.Category, t.RequestType, t.ItemDetail, t.Subject, t.Description,
            t.Status, t.AssignedHrId, t.AssignedHrName,
            t.CreatedOn,
            t.Timeline.Select(e => new TimelineEventDto(e.Id, e.Status, e.Notes, e.CreatedOn)).ToList()
        );
    }
}
