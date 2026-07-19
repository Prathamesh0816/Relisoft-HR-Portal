namespace RelisoftHR.Models;

public interface IHasRowVersion
{
    byte[]? RowVersion { get; set; }
}
