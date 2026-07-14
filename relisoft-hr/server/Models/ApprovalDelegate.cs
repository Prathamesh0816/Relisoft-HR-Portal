using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class ApprovalDelegate
{
    [Key]
    public int Id { get; set; }
    public int ManagerId { get; set; }
    public int DelegateId { get; set; }
    public int? ProjectId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ManagerId))]
    public Employee? Manager { get; set; }
    [ForeignKey(nameof(DelegateId))]
    public Employee? Delegate { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }
}
