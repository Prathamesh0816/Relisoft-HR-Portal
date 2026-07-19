namespace RelisoftHR.Models;

public class Announcement : ISoftDeletable, IHasRowVersion
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public bool IsActive { get; set; } = true;
    public int CreatedById { get; set; }
    public Employee CreatedBy { get; set; } = null!;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public int? DeletedById { get; set; }
    public byte[]? RowVersion { get; set; }
}
