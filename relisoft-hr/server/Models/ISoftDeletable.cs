namespace RelisoftHR.Models;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedOn { get; set; }
    int? DeletedById { get; set; }
}
