namespace RelisoftHR.Models;

public class KnowledgeBaseArticle
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "FAQ";
    public string Tags { get; set; } = "";
    public bool IsPublished { get; set; } = true;
    public int ViewCount { get; set; }
    public int CreatedById { get; set; }
    public Employee CreatedBy { get; set; } = null!;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedOn { get; set; } = DateTime.UtcNow;
}
