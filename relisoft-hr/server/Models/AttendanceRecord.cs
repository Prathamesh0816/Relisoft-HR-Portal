namespace RelisoftHR.Models;

public class AttendanceRecord
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public DateTime Date { get; set; }
    public DateTime? ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }
    public string Status { get; set; } = "Present";
    public string Notes { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
