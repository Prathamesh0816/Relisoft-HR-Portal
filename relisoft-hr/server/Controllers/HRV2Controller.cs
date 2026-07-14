using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/hr-v2")]
public class HRV2Controller : ControllerBase
{
    private readonly AppDbContext _db;

    public HRV2Controller(AppDbContext db) => _db = db;

    // ────── Probation ──────

    [HttpGet("probations")]
    public async Task<ActionResult<List<EmployeeProbationDto>>> GetProbations()
    {
        var list = await _db.EmployeeProbations
            .Include(p => p.Employee)
            .OrderByDescending(p => p.CreatedOn)
            .ToListAsync();
        return Ok(list.Select(MapProbation).ToList());
    }

    [HttpGet("probation/{employeeId}")]
    public async Task<ActionResult<EmployeeProbationDto>> GetProbation(int employeeId)
    {
        var p = await _db.EmployeeProbations
            .Include(pr => pr.Employee)
            .FirstOrDefaultAsync(pr => pr.EmployeeId == employeeId);
        if (p == null) return NotFound();
        return Ok(MapProbation(p));
    }

    [HttpPost("probation/start")]
    public async Task<ActionResult> StartProbation(StartProbationRequest req)
    {
        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp == null || emp.Status != "Active") return BadRequest(new { message = "Employee not active." });
        var existing = await _db.EmployeeProbations.AnyAsync(p => p.EmployeeId == req.EmployeeId);
        if (existing) return BadRequest(new { message = "Probation already exists." });

        var start = req.StartDate;
        var end = start.AddMonths(req.ProbationMonths);
        _db.EmployeeProbations.Add(new EmployeeProbation
        {
            EmployeeId = req.EmployeeId,
            StartDate = start,
            OriginalEndDate = end,
            CurrentEndDate = end,
            Status = "Probation"
        });
        emp.EmploymentType = "Probation";
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Probation started. Ends {end:yyyy-MM-dd}." });
    }

    [HttpPost("probation/extend")]
    public async Task<ActionResult> ExtendProbation(ExtendProbationRequest req)
    {
        var p = await _db.EmployeeProbations.FirstOrDefaultAsync(pr => pr.EmployeeId == req.EmployeeId);
        if (p == null || p.Status != "Probation") return BadRequest(new { message = "No active probation found." });
        p.CurrentEndDate = p.CurrentEndDate?.AddMonths(req.ExtraMonths);
        p.ExtensionCount++;
        p.Notes = req.Reason;
        p.Status = "Extended";
        p.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Probation extended by {req.ExtraMonths} month(s). New end: {p.CurrentEndDate:yyyy-MM-dd}." });
    }

    [HttpPost("probation/confirm")]
    public async Task<ActionResult> ConfirmProbation(ConfirmProbationRequest req)
    {
        var p = await _db.EmployeeProbations.FirstOrDefaultAsync(pr => pr.EmployeeId == req.EmployeeId);
        if (p == null || (p.Status != "Probation" && p.Status != "Extended"))
            return BadRequest(new { message = "Cannot confirm. No active probation." });
        p.Status = "Confirmed";
        p.ConfirmedOn = DateTime.UtcNow;
        p.UpdatedOn = DateTime.UtcNow;

        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp != null) emp.EmploymentType = "Full-time";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Employee confirmed after probation." });
    }

    // ────── Appraisal ──────

    [HttpGet("appraisal-cycles")]
    public async Task<ActionResult<List<AppraisalCycleDto>>> GetCycles()
    {
        var cycles = await _db.AppraisalCycles.OrderByDescending(c => c.StartDate).ToListAsync();
        return Ok(cycles.Select(c => new AppraisalCycleDto(c.Id, c.Name, c.StartDate, c.EndDate, c.Status)).ToList());
    }

    [HttpPost("appraisal-cycles")]
    public async Task<ActionResult> CreateCycle(AppraisalCycleDto req)
    {
        _db.AppraisalCycles.Add(new AppraisalCycle
        {
            Name = req.Name,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            Status = req.Status
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Appraisal cycle created." });
    }

    [HttpPut("appraisal-cycles/{id}")]
    public async Task<ActionResult> CloseCycle(int id)
    {
        var cycle = await _db.AppraisalCycles.FindAsync(id);
        if (cycle == null) return NotFound();
        cycle.Status = "Closed";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cycle closed." });
    }

    [HttpGet("appraisals")]
    public async Task<ActionResult<List<EmployeeAppraisalDto>>> GetAppraisals(int? cycleId)
    {
        var query = _db.EmployeeAppraisals
            .Include(a => a.Employee)
            .Include(a => a.Cycle)
            .Include(a => a.Reviewer)
            .Include(a => a.Goals)
            .AsQueryable();
        if (cycleId.HasValue) query = query.Where(a => a.CycleId == cycleId.Value);
        var list = await query.OrderByDescending(a => a.CreatedOn).ToListAsync();
        return Ok(list.Select(MapAppraisal).ToList());
    }

    [HttpPost("appraisals/{employeeId}/init")]
    public async Task<ActionResult> InitAppraisal(int employeeId, int cycleId, int? reviewerId)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        var cycle = await _db.AppraisalCycles.FindAsync(cycleId);
        if (emp == null || cycle == null) return NotFound();
        var existing = await _db.EmployeeAppraisals.AnyAsync(a => a.EmployeeId == employeeId && a.CycleId == cycleId);
        if (existing) return BadRequest(new { message = "Appraisal already exists for this cycle." });

        _db.EmployeeAppraisals.Add(new EmployeeAppraisal
        {
            EmployeeId = employeeId,
            CycleId = cycleId,
            ReviewerId = reviewerId,
            Status = "Draft"
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Appraisal initiated." });
    }

    [HttpPost("appraisals/{id}/self")]
    public async Task<ActionResult> SubmitSelfAppraisal(int id, SelfAppraisalRequest req)
    {
        var a = await _db.EmployeeAppraisals.Include(ap => ap.Goals).FirstOrDefaultAsync(ap => ap.Id == id);
        if (a == null || a.Status != "Draft") return BadRequest(new { message = "Cannot submit self appraisal." });
        a.SelfRating = req.SelfRating;
        a.SelfComments = req.SelfComments;
        a.Status = "Submitted";
        a.SubmittedOn = DateTime.UtcNow;

        if (req.Goals != null)
        {
            _db.EmployeeAppraisalGoals.RemoveRange(a.Goals);
            foreach (var g in req.Goals)
                a.Goals.Add(new EmployeeAppraisalGoal { Goal = g.Goal, TargetDate = g.TargetDate, Achieved = g.Achieved });
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Self appraisal submitted." });
    }

    [HttpPost("appraisals/{id}/manager")]
    public async Task<ActionResult> SubmitManagerReview(int id, ManagerAppraisalRequest req)
    {
        var a = await _db.EmployeeAppraisals.FindAsync(id);
        if (a == null || a.Status != "Submitted") return BadRequest(new { message = "Cannot review. Not submitted yet." });
        a.ManagerRating = req.ManagerRating;
        a.ManagerComments = req.ManagerComments;
        a.FinalRating = req.ManagerRating;
        a.Status = req.Status == "Completed" ? "Completed" : "UnderReview";
        a.CompletedOn = req.Status == "Completed" ? DateTime.UtcNow : null;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Manager review submitted." });
    }

    // ────── Salary Discussions ──────

    [HttpGet("salary-discussions")]
    public async Task<ActionResult<List<SalaryDiscussionDto>>> GetSalaryDiscussions(int? employeeId)
    {
        var query = _db.SalaryDiscussions
            .Include(s => s.Employee)
            .Include(s => s.ProposedBy)
            .Include(s => s.ApprovedBy)
            .AsQueryable();
        if (employeeId.HasValue) query = query.Where(s => s.EmployeeId == employeeId.Value);
        var list = await query.OrderByDescending(s => s.DiscussionDate).ToListAsync();
        return Ok(list.Select(s => new SalaryDiscussionDto(
            s.Id, s.EmployeeId, s.Employee?.FullName ?? "", s.ProposedSalary, s.ApprovedSalary,
            s.Status, s.ProposedBy?.FullName, s.ApprovedBy?.FullName, s.DiscussionDate, s.Notes
        )).ToList());
    }

    [HttpPost("salary-discussions")]
    public async Task<ActionResult> CreateSalaryDiscussion(SalaryDiscussionRequest req)
    {
        _db.SalaryDiscussions.Add(new SalaryDiscussion
        {
            EmployeeId = req.EmployeeId,
            ProposedSalary = req.ProposedSalary,
            ProposedById = req.ProposedById,
            Notes = req.Notes
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Salary discussion created." });
    }

    [HttpPut("salary-discussions/{id}/approve")]
    public async Task<ActionResult> ApproveSalary(int id, ApproveSalaryRequest req)
    {
        var sd = await _db.SalaryDiscussions.FindAsync(id);
        if (sd == null) return NotFound();
        sd.ApprovedSalary = req.ApprovedSalary;
        sd.Status = "Approved";
        sd.ApprovedById = req.ApprovedById;
        sd.UpdatedOn = DateTime.UtcNow;

        var emp = await _db.Employees.FindAsync(sd.EmployeeId);
        if (emp != null && emp.SalaryStructureId.HasValue)
        {
            var ss = await _db.SalaryStructures.FindAsync(emp.SalaryStructureId);
            if (ss != null)
            {
                var totalNew = req.ApprovedSalary;
                ss.FixedPay = totalNew * 0.6m;
                ss.VariablePay = totalNew * 0.2m;
                ss.PF = totalNew * 0.12m;
                ss.Gratuity = totalNew * 0.05m;
                ss.Insurance = 5000;
                ss.OtherDeductions = totalNew * 0.03m;
            }
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Salary approved and structure updated." });
    }

    [HttpPut("salary-discussions/{id}/reject")]
    public async Task<ActionResult> RejectSalary(int id)
    {
        var sd = await _db.SalaryDiscussions.FindAsync(id);
        if (sd == null) return NotFound();
        sd.Status = "Rejected";
        sd.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Salary proposal rejected." });
    }

    // ────── Intern → Permanent ──────

    [HttpPost("intern-convert")]
    public async Task<ActionResult> ConvertInternToPermanent(InternConversionRequest req)
    {
        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp == null) return NotFound();
        if (emp.EmploymentType != "Intern" && emp.EmploymentType != "Full-time")
            return BadRequest(new { message = "Only interns or current employees can be converted." });

        emp.EmploymentType = req.NewEmploymentType;
        emp.Designation = req.NewDesignation;
        emp.RoleId = req.NewRoleId;
        emp.UpdatedOn = DateTime.UtcNow;

        var existingOnboarding = await _db.EmployeeOnboardings
            .FirstOrDefaultAsync(o => o.EmployeeId == req.EmployeeId);
        if (existingOnboarding == null || existingOnboarding.Status != "Completed")
        {
            var onboarding = new EmployeeOnboarding
            {
                EmployeeId = req.EmployeeId,
                Status = "Completed",
                CompletedSteps = 1,
                TotalSteps = 1,
                CompletedOn = DateTime.UtcNow,
                ReliSoftIdCreatedOn = DateTime.UtcNow,
                ClientIdCreatedOn = DateTime.UtcNow,
                VirtualIdCardIssuedOn = DateTime.UtcNow,
                GatePassIssuedOn = DateTime.UtcNow
            };
            _db.EmployeeOnboardings.Add(onboarding);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Intern converted to permanent." });
    }

    // ────── Mappers ──────

    private static EmployeeProbationDto MapProbation(EmployeeProbation p) => new(
        p.Id, p.EmployeeId, p.Employee?.FullName ?? "", p.Employee?.EmployeeCode ?? "",
        p.StartDate, p.OriginalEndDate, p.CurrentEndDate, p.ExtensionCount,
        p.Status, p.Notes, p.ConfirmedOn
    );

    private static EmployeeAppraisalDto MapAppraisal(EmployeeAppraisal a) => new(
        a.Id, a.EmployeeId, a.Employee?.FullName ?? "", a.CycleId, a.Cycle?.Name ?? "",
        a.ReviewerId, a.Reviewer?.FullName ?? "",
        a.SelfRating, a.ManagerRating, a.FinalRating,
        a.SelfComments, a.ManagerComments, a.Status, a.SubmittedOn, a.CompletedOn,
        a.Goals.Select(g => new AppraisalGoalDto(g.Id, g.Goal, g.TargetDate, g.Achieved)).ToList()
    );
}
