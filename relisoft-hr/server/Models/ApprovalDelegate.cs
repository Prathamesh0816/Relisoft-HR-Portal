using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class ApprovalDelegate : ISoftDeletable, IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    public int ManagerId { get; set; }
    public int DelegateId { get; set; }
    public int? ProjectId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public int? DeletedById { get; set; }
    public byte[]? RowVersion { get; set; }

    [ForeignKey(nameof(ManagerId))]
    public Employee? Manager { get; set; }
    [ForeignKey(nameof(DelegateId))]
    public Employee? Delegate { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }
}
