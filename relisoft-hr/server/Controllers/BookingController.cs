using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

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
    public async Task<ActionResult> CreateDesk([FromBody] Desk req)
    {
        _db.Desks.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("rooms")]
    public async Task<ActionResult> GetRooms([FromQuery] string? building)
    {
        var query = _db.MeetingRooms.Where(r => r.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(building)) query = query.Where(r => r.Building == building);
        return Ok(await query.OrderBy(r => r.Name).ToListAsync());
    }

    [HttpPost("rooms")]
    public async Task<ActionResult> CreateRoom([FromBody] MeetingRoom req)
    {
        _db.MeetingRooms.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPost("desk-book")]
    public async Task<ActionResult> BookDesk([FromBody] DeskBooking req)
    {
        var empId = GetUserId();
        var conflict = await _db.DeskBookings
            .AnyAsync(b => b.DeskId == req.DeskId && b.Date == req.Date
                && b.StartTime < req.EndTime && b.EndTime > req.StartTime
                && b.Status == "Confirmed");
        if (conflict)
            return Conflict(new { message = "Desk already booked for this time" });
        req.EmployeeId = empId;
        _db.DeskBookings.Add(req);
        await _db.SaveChangesAsync();
        return Ok(new { req.Id, message = "Desk booked" });
    }

    [HttpPost("room-book")]
    public async Task<ActionResult> BookRoom([FromBody] RoomBooking req)
    {
        var empId = GetUserId();
        var conflict = await _db.RoomBookings
            .AnyAsync(b => b.RoomId == req.RoomId && b.Date == req.Date
                && b.StartTime < req.EndTime && b.EndTime > req.StartTime
                && b.Status == "Confirmed");
        if (conflict)
            return Conflict(new { message = "Room already booked for this time" });
        req.EmployeeId = empId;
        _db.RoomBookings.Add(req);
        await _db.SaveChangesAsync();
        return Ok(new { req.Id, message = "Room booked" });
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
        booking.Status = "Cancelled";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cancelled" });
    }

    [HttpPost("room-cancel/{id}")]
    public async Task<ActionResult> CancelRoomBooking(int id)
    {
        var booking = await _db.RoomBookings.FindAsync(id);
        if (booking == null) return NotFound();
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
