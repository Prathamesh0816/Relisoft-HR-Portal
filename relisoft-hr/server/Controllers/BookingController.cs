using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using System.Data;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _db;
    public BookingController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("desks")]
    public async Task<ActionResult> GetDesks([FromQuery] string? building, [FromQuery] string? floor)
    {
        var query = _db.Desks.Where(d => d.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(building)) query = query.Where(d => d.Building == building);
        if (!string.IsNullOrEmpty(floor)) query = query.Where(d => d.Floor == floor);
        return Ok(await query.OrderBy(d => d.Name).ToListAsync());
    }

    [HttpPost("desks")]
    public async Task<ActionResult> CreateDesk([FromBody] DeskRequest req)
    {
        var desk = new Desk { Name = req.Name, Floor = req.Floor, Building = req.Building };
        _db.Desks.Add(desk);
        await _db.SaveChangesAsync();
        return Ok(desk);
    }

    [HttpGet("rooms")]
    public async Task<ActionResult> GetRooms([FromQuery] string? building)
    {
        var query = _db.MeetingRooms.Where(r => r.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(building)) query = query.Where(r => r.Building == building);
        return Ok(await query.OrderBy(r => r.Name).ToListAsync());
    }

    [HttpPost("rooms")]
    public async Task<ActionResult> CreateRoom([FromBody] MeetingRoomRequest req)
    {
        var room = new MeetingRoom
        {
            Name = req.Name, Capacity = req.Capacity, Floor = req.Floor, Building = req.Building,
            HasProjector = req.HasProjector, HasMonitor = req.HasMonitor
        };
        _db.MeetingRooms.Add(room);
        await _db.SaveChangesAsync();
        return Ok(room);
    }

    [HttpPost("desk-book")]
    public async Task<ActionResult> BookDesk([FromBody] DeskBookingRequest req)
    {
        var empId = GetUserId();
        if (req.EndTime <= req.StartTime)
            return BadRequest(new { message = "End time must be after start time" });
        if (!await _db.Desks.AnyAsync(d => d.Id == req.DeskId && d.IsActive))
            return NotFound(new { message = "Active desk not found" });
        await using var transaction = _db.Database.IsRelational()
            ? await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable)
            : null;
        var conflict = await _db.DeskBookings
            .AnyAsync(b => b.DeskId == req.DeskId && b.Date == req.Date
                && b.StartTime < req.EndTime && b.EndTime > req.StartTime
                && b.Status == "Confirmed");
        if (conflict)
            return Conflict(new { message = "Desk already booked for this time" });
        var booking = new DeskBooking
        {
            DeskId = req.DeskId, EmployeeId = empId, Date = req.Date,
            StartTime = req.StartTime, EndTime = req.EndTime, Status = "Confirmed"
        };
        _db.DeskBookings.Add(booking);
        await _db.SaveChangesAsync();
        if (transaction != null) await transaction.CommitAsync();
        return Ok(new { booking.Id, message = "Desk booked" });
    }

    [HttpPost("room-book")]
    public async Task<ActionResult> BookRoom([FromBody] RoomBookingRequest req)
    {
        var empId = GetUserId();
        if (req.EndTime <= req.StartTime)
            return BadRequest(new { message = "End time must be after start time" });
        if (!await _db.MeetingRooms.AnyAsync(r => r.Id == req.RoomId && r.IsActive))
            return NotFound(new { message = "Active room not found" });
        await using var transaction = _db.Database.IsRelational()
            ? await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable)
            : null;
        var conflict = await _db.RoomBookings
            .AnyAsync(b => b.RoomId == req.RoomId && b.Date == req.Date
                && b.StartTime < req.EndTime && b.EndTime > req.StartTime
                && b.Status == "Confirmed");
        if (conflict)
            return Conflict(new { message = "Room already booked for this time" });
        var booking = new RoomBooking
        {
            RoomId = req.RoomId, EmployeeId = empId, Date = req.Date,
            StartTime = req.StartTime, EndTime = req.EndTime, Title = req.Title, Status = "Confirmed"
        };
        _db.RoomBookings.Add(booking);
        await _db.SaveChangesAsync();
        if (transaction != null) await transaction.CommitAsync();
        return Ok(new { booking.Id, message = "Room booked" });
    }

    [HttpGet("my-bookings")]
    public async Task<ActionResult> GetMyBookings()
    {
        var empId = GetUserId();
        var desks = await _db.DeskBookings
            .Where(b => b.EmployeeId == empId)
            .OrderByDescending(b => b.Date)
            .ToListAsync();
        var rooms = await _db.RoomBookings
            .Where(b => b.EmployeeId == empId)
            .OrderByDescending(b => b.Date)
            .ToListAsync();
        return Ok(new { deskBookings = desks, roomBookings = rooms });
    }

    [HttpPost("desk-cancel/{id}")]
    public async Task<ActionResult> CancelDeskBooking(int id)
    {
        var booking = await _db.DeskBookings.FindAsync(id);
        if (booking == null) return NotFound();
        if (booking.EmployeeId != GetUserId()) return Forbid();
        booking.Status = "Cancelled";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cancelled" });
    }

    [HttpPost("room-cancel/{id}")]
    public async Task<ActionResult> CancelRoomBooking(int id)
    {
        var booking = await _db.RoomBookings.FindAsync(id);
        if (booking == null) return NotFound();
        if (booking.EmployeeId != GetUserId()) return Forbid();
        booking.Status = "Cancelled";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cancelled" });
    }

    [HttpGet("desk-availability")]
    public async Task<ActionResult> GetDeskAvailability([FromQuery] string date, [FromQuery] int? deskId)
    {
        if (!DateOnly.TryParse(date, out var d))
            return BadRequest(new { message = "Invalid date" });
        var dt = d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var query = _db.DeskBookings.Where(b => b.Date == dt && b.Status == "Confirmed").AsQueryable();
        if (deskId.HasValue) query = query.Where(b => b.DeskId == deskId.Value);
        var bookings = await query.ToListAsync();
        return Ok(bookings);
    }

    [HttpGet("room-availability")]
    public async Task<ActionResult> GetRoomAvailability([FromQuery] string date, [FromQuery] int? roomId)
    {
        if (!DateOnly.TryParse(date, out var d))
            return BadRequest(new { message = "Invalid date" });
        var dt = d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var query = _db.RoomBookings.Where(b => b.Date == dt && b.Status == "Confirmed").AsQueryable();
        if (roomId.HasValue) query = query.Where(b => b.RoomId == roomId.Value);
        var bookings = await query.ToListAsync();
        return Ok(bookings);
    }
}
