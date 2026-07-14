using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class CompOffTransfer
{
    [Key]
    public int Id { get; set; }
    public int FromEmployeeId { get; set; }
    public int ToEmployeeId { get; set; }
    public decimal Days { get; set; }
    [MaxLength(500)]
    public string Reason { get; set; } = "";
    [Required, MaxLength(50)]
    public string Status { get; set; } = "Pending";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ActionedOn { get; set; }

    [ForeignKey(nameof(FromEmployeeId))]
    public Employee? FromEmployee { get; set; }
    [ForeignKey(nameof(ToEmployeeId))]
    public Employee? ToEmployee { get; set; }
}
