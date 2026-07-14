using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class Desk
{
    [Key]
    public int Id { get; set; }
    [MaxLength(50)]
    public string Name { get; set; } = "";
    [MaxLength(50)]
    public string Floor { get; set; } = "";
    [MaxLength(100)]
    public string Building { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class MeetingRoom
{
    [Key]
    public int Id { get; set; }
    [MaxLength(100)]
    public string Name { get; set; } = "";
    public int Capacity { get; set; }
    [MaxLength(50)]
    public string Floor { get; set; } = "";
    [MaxLength(100)]
    public string Building { get; set; } = "";
    public bool HasProjector { get; set; }
    public bool HasMonitor { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class DeskBooking
{
    [Key]
    public int Id { get; set; }
    public int DeskId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Confirmed";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class RoomBooking
{
    [Key]
    public int Id { get; set; }
    public int RoomId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    [MaxLength(200)]
    public string Title { get; set; } = "";
    [MaxLength(50)]
    public string Status { get; set; } = "Confirmed";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
