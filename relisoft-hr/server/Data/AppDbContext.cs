using Microsoft.EntityFrameworkCore;
using RelisoftHR.Models;
using System.Reflection;

namespace RelisoftHR.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public void SoftDelete<TEntity>(TEntity entity, int? deletedById)
        where TEntity : class, ISoftDeletable
    {
        if (entity.IsDeleted)
            return;

        if (Entry(entity).State == EntityState.Detached)
            Attach(entity);

        entity.IsDeleted = true;
        entity.DeletedOn = DateTime.UtcNow;
        entity.DeletedById = deletedById;
    }

    public void SoftDeleteRange<TEntity>(IEnumerable<TEntity> entities, int? deletedById)
        where TEntity : class, ISoftDeletable
    {
        foreach (var entity in entities)
            SoftDelete(entity, deletedById);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ConvertPhysicalDeletesToSoftDeletes();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ConvertPhysicalDeletesToSoftDeletes();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<UserLogin> UserLogins => Set<UserLogin>();
    public DbSet<OrganizationRole> OrganizationRoles => Set<OrganizationRole>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveApplication> LeaveApplications => Set<LeaveApplication>();
    public DbSet<EmployeeLeaveBalance> EmployeeLeaveBalances => Set<EmployeeLeaveBalance>();
    public DbSet<EmployeeProject> EmployeeProjects => Set<EmployeeProject>();
    public DbSet<EmployeeTeam> EmployeeTeams => Set<EmployeeTeam>();
    public DbSet<EmployeeOnboardingProfile> EmployeeOnboardingProfiles => Set<EmployeeOnboardingProfile>();
    public DbSet<EmployeeOnboardingExperience> EmployeeOnboardingExperiences => Set<EmployeeOnboardingExperience>();
    public DbSet<EmployeeOnboardingDocument> EmployeeOnboardingDocuments => Set<EmployeeOnboardingDocument>();
    public DbSet<EmployeeTicket> EmployeeTickets => Set<EmployeeTicket>();
    public DbSet<EmployeeTicketTimelineEvent> EmployeeTicketTimelineEvents => Set<EmployeeTicketTimelineEvent>();
    public DbSet<HrPolicy> HrPolicies => Set<HrPolicy>();
    public DbSet<SalaryStructure> SalaryStructures => Set<SalaryStructure>();
    public DbSet<ApprovalDelegate> ApprovalDelegates => Set<ApprovalDelegate>();
    public DbSet<LeaveAccrualLog> LeaveAccrualLogs => Set<LeaveAccrualLog>();
    public DbSet<CompOffTransfer> CompOffTransfers => Set<CompOffTransfer>();
    public DbSet<SalaryDiscussion> SalaryDiscussions => Set<SalaryDiscussion>();
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    public DbSet<EmployeeDocument> EmployeeDocuments => Set<EmployeeDocument>();
    public DbSet<OnboardingChecklistItem> OnboardingChecklistItems => Set<OnboardingChecklistItem>();
    public DbSet<EmployeeOnboarding> EmployeeOnboardings => Set<EmployeeOnboarding>();
    public DbSet<EmployeeOnboardingStep> EmployeeOnboardingSteps => Set<EmployeeOnboardingStep>();
    public DbSet<EmployeeOffboarding> EmployeeOffboardings => Set<EmployeeOffboarding>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<EmployeeAsset> EmployeeAssets => Set<EmployeeAsset>();
    public DbSet<EmployeeProbation> EmployeeProbations => Set<EmployeeProbation>();
    public DbSet<AppraisalCycle> AppraisalCycles => Set<AppraisalCycle>();
    public DbSet<EmployeeAppraisal> EmployeeAppraisals => Set<EmployeeAppraisal>();
    public DbSet<EmployeeAppraisalGoal> EmployeeAppraisalGoals => Set<EmployeeAppraisalGoal>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();
    public DbSet<MoodEntry> MoodEntries => Set<MoodEntry>();
    public DbSet<EmployeeSkill> EmployeeSkills => Set<EmployeeSkill>();
    public DbSet<SkillEndorsement> SkillEndorsements => Set<SkillEndorsement>();
    public DbSet<BragPost> BragPosts => Set<BragPost>();
    public DbSet<BragLike> BragLikes => Set<BragLike>();
    public DbSet<CommuteRoute> CommuteRoutes => Set<CommuteRoute>();
    public DbSet<CarpoolGroup> CarpoolGroups => Set<CarpoolGroup>();
    public DbSet<CarpoolMember> CarpoolMembers => Set<CarpoolMember>();
    public DbSet<Desk> Desks => Set<Desk>();
    public DbSet<MeetingRoom> MeetingRooms => Set<MeetingRoom>();
    public DbSet<DeskBooking> DeskBookings => Set<DeskBooking>();
    public DbSet<RoomBooking> RoomBookings => Set<RoomBooking>();
    public DbSet<MentorshipProfile> MentorshipProfiles => Set<MentorshipProfile>();
    public DbSet<MentorshipMatch> MentorshipMatches => Set<MentorshipMatch>();
    public DbSet<MentorshipSession> MentorshipSessions => Set<MentorshipSession>();
    public DbSet<RewardPointsAccount> RewardPointsAccounts => Set<RewardPointsAccount>();
    public DbSet<RewardTransaction> RewardTransactions => Set<RewardTransaction>();
    public DbSet<RewardCatalogItem> RewardCatalogItems => Set<RewardCatalogItem>();
    public DbSet<RewardRedemption> RewardRedemptions => Set<RewardRedemption>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<ExpenseClaim> ExpenseClaims => Set<ExpenseClaim>();
    public DbSet<TimesheetEntry> TimesheetEntries => Set<TimesheetEntry>();
    public DbSet<TimesheetPeriod> TimesheetPeriods => Set<TimesheetPeriod>();
    public DbSet<TrainingCourse> TrainingCourses => Set<TrainingCourse>();
    public DbSet<TrainingRegistration> TrainingRegistrations => Set<TrainingRegistration>();
    public DbSet<LoanType> LoanTypes => Set<LoanType>();
    public DbSet<EmployeeLoan> EmployeeLoans => Set<EmployeeLoan>();
    public DbSet<LoanRepayment> LoanRepayments => Set<LoanRepayment>();
    public DbSet<ShiftTemplate> ShiftTemplates => Set<ShiftTemplate>();
    public DbSet<ShiftAssignment> ShiftAssignments => Set<ShiftAssignment>();
    public DbSet<ShiftSwap> ShiftSwaps => Set<ShiftSwap>();
    public DbSet<Visitor> Visitors => Set<Visitor>();
    public DbSet<Survey> Surveys => Set<Survey>();
    public DbSet<SurveyQuestion> SurveyQuestions => Set<SurveyQuestion>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<BenefitPlan> BenefitPlans => Set<BenefitPlan>();
    public DbSet<BenefitEnrollment> BenefitEnrollments => Set<BenefitEnrollment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<InternalJobPosting> InternalJobPostings => Set<InternalJobPosting>();
    public DbSet<InternalJobApplication> InternalJobApplications => Set<InternalJobApplication>();
    public DbSet<ComplianceRequirement> ComplianceRequirements => Set<ComplianceRequirement>();
    public DbSet<ComplianceRecord> ComplianceRecords => Set<ComplianceRecord>();
    public DbSet<Contractor> Contractors => Set<Contractor>();
    public DbSet<ContractorEmployee> ContractorEmployees => Set<ContractorEmployee>();
    public DbSet<WorkforceEmployee> WorkforceEmployees => Set<WorkforceEmployee>();
    public DbSet<WorkforceProject> WorkforceProjects => Set<WorkforceProject>();
    public DbSet<WorkforceDependency> WorkforceDependencies => Set<WorkforceDependency>();
    public DbSet<WorkforceKnowledge> WorkforceKnowledges => Set<WorkforceKnowledge>();
    public DbSet<WorkforcePerformance> WorkforcePerformances => Set<WorkforcePerformance>();
    public DbSet<WorkforceWorkload> WorkforceWorkloads => Set<WorkforceWorkload>();
    public DbSet<WorkforceScenario> WorkforceScenarios => Set<WorkforceScenario>();
    public DbSet<WorkforceFeedback> WorkforceFeedbacks => Set<WorkforceFeedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureDecimalPrecision(modelBuilder);
        ConfigureCheckConstraints(modelBuilder);
        ConfigureOptimisticConcurrency(modelBuilder);
        ConfigureSoftDeletion(modelBuilder);

        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.EmployeeCode).IsUnique();
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.Email).IsUnique();
        modelBuilder.Entity<OrganizationRole>()
            .HasIndex(r => r.Name).IsUnique();
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.Name).IsUnique();
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.ManagerId);
        modelBuilder.Entity<Project>()
            .Property(p => p.ApprovalRoute)
            .HasConversion<string>()
            .HasMaxLength(30);
        modelBuilder.Entity<Team>()
            .HasIndex(t => new { t.ProjectId, t.Name }).IsUnique();

        modelBuilder.Entity<EmployeeProject>()
            .HasIndex(ep => new { ep.EmployeeId, ep.ProjectId }).IsUnique();
        modelBuilder.Entity<EmployeeProject>()
            .HasIndex(ep => ep.EmployeeId)
            .IsUnique()
            .HasFilter("[IsPrimary] = 1");
        modelBuilder.Entity<EmployeeProject>()
            .HasOne(ep => ep.Employee)
            .WithMany(e => e.EmployeeProjects)
            .HasForeignKey(ep => ep.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeProject>()
            .HasOne(ep => ep.Project)
            .WithMany(p => p.EmployeeProjects)
            .HasForeignKey(ep => ep.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeTeam>()
            .HasIndex(et => new { et.EmployeeId, et.TeamId }).IsUnique();
        modelBuilder.Entity<EmployeeTeam>()
            .HasOne(et => et.Employee)
            .WithMany(e => e.EmployeeTeams)
            .HasForeignKey(et => et.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeTeam>()
            .HasOne(et => et.Team)
            .WithMany(t => t.EmployeeTeams)
            .HasForeignKey(et => et.TeamId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Teams)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Manager)
            .WithMany()
            .HasForeignKey(p => p.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>()
            .HasOne(p => p.ApprovalDelegate)
            .WithMany()
            .HasForeignKey(p => p.ApprovalDelegateId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Role)
            .WithMany(r => r.Employees)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Lead)
            .WithMany()
            .HasForeignKey(t => t.LeadId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.PrimaryTeam)
            .WithMany()
            .HasForeignKey(e => e.PrimaryTeamId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SalaryStructure>()
            .HasOne(ss => ss.Employee)
            .WithOne(e => e.SalaryStructure)
            .HasForeignKey<SalaryStructure>(ss => ss.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasIndex(elb => new { elb.EmployeeId, elb.LeaveTypeId }).IsUnique();
        modelBuilder.Entity<LeaveType>()
            .HasIndex(lt => lt.Name).IsUnique();
        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasOne(elb => elb.Employee)
            .WithMany(e => e.LeaveBalances)
            .HasForeignKey(elb => elb.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasOne(elb => elb.LeaveType)
            .WithMany()
            .HasForeignKey(elb => elb.LeaveTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeaveApplication>()
            .HasOne(l => l.Employee)
            .WithMany(e => e.LeaveApplications)
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LeaveApplication>()
            .HasOne(l => l.LeaveType)
            .WithMany()
            .HasForeignKey(l => l.LeaveTypeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LeaveApplication>()
            .HasOne(l => l.Approver)
            .WithMany()
            .HasForeignKey(l => l.ApproverId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LeaveApplication>()
            .HasOne(l => l.ProjectManager)
            .WithMany()
            .HasForeignKey(l => l.ProjectManagerId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LeaveApplication>()
            .HasOne<Employee>()
            .WithMany()
            .HasForeignKey(l => l.CancellationActionedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeaveAccrualLog>()
            .HasOne(l => l.Employee)
            .WithMany()
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LeaveAccrualLog>()
            .HasOne(l => l.LeaveType)
            .WithMany()
            .HasForeignKey(l => l.LeaveTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CompOffTransfer>()
            .HasOne(t => t.FromEmployee)
            .WithMany()
            .HasForeignKey(t => t.FromEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<CompOffTransfer>()
            .HasOne(t => t.ToEmployee)
            .WithMany()
            .HasForeignKey(t => t.ToEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeTicket>()
            .HasOne(t => t.Employee)
            .WithMany()
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeTicket>()
            .HasOne<Employee>()
            .WithMany()
            .HasForeignKey(t => t.AssignedHrId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<UserLogin>()
            .HasIndex(ul => ul.Username).IsUnique();

        modelBuilder.Entity<SalaryStructure>()
            .HasIndex(ss => ss.EmployeeId).IsUnique();

        modelBuilder.Entity<EmployeeOnboarding>()
            .HasOne(o => o.Employee)
            .WithOne(e => e.Onboarding)
            .HasForeignKey<EmployeeOnboarding>(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOnboardingProfile>()
            .HasIndex(p => p.EmployeeId).IsUnique();
        modelBuilder.Entity<EmployeeOnboardingProfile>()
            .HasOne(p => p.Employee)
            .WithOne()
            .HasForeignKey<EmployeeOnboardingProfile>(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeOnboardingExperience>()
            .HasAlternateKey(e => new { e.OnboardingProfileId, e.Id });
        modelBuilder.Entity<EmployeeOnboardingExperience>()
            .HasOne(e => e.Profile)
            .WithMany(p => p.Experiences)
            .HasForeignKey(e => e.OnboardingProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOnboardingDocument>()
            .HasOne(d => d.Profile)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.OnboardingProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOnboardingDocument>()
            .HasOne(d => d.Experience)
            .WithMany()
            .HasForeignKey(d => new { d.OnboardingProfileId, d.ExperienceId })
            .HasPrincipalKey(e => new { e.OnboardingProfileId, e.Id })
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeOnboardingStep>()
            .HasIndex(s => new { s.OnboardingId, s.ChecklistItemId }).IsUnique();
        modelBuilder.Entity<EmployeeOnboardingStep>()
            .HasOne(s => s.Onboarding)
            .WithMany(o => o.Steps)
            .HasForeignKey(s => s.OnboardingId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOnboardingStep>()
            .HasOne(s => s.ChecklistItem)
            .WithMany()
            .HasForeignKey(s => s.ChecklistItemId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<OnboardingChecklistItem>()
            .HasIndex(i => i.Name).IsUnique();
        modelBuilder.Entity<EmployeeOffboarding>()
            .HasOne(o => o.Employee)
            .WithOne(e => e.Offboarding)
            .HasForeignKey<EmployeeOffboarding>(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeAsset>()
            .HasIndex(ea => ea.AssetId)
            .IsUnique()
            .HasFilter("[ReturnedOn] IS NULL");
        modelBuilder.Entity<EmployeeAsset>()
            .HasOne(ea => ea.Employee)
            .WithMany(e => e.Assets)
            .HasForeignKey(ea => ea.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeAsset>()
            .HasOne(ea => ea.Asset)
            .WithMany()
            .HasForeignKey(ea => ea.AssetId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Asset>()
            .HasIndex(a => a.AssetTag)
            .IsUnique()
            .HasFilter("[AssetTag] <> ''");
        modelBuilder.Entity<Asset>()
            .HasIndex(a => a.SerialNumber)
            .IsUnique()
            .HasFilter("[SerialNumber] IS NOT NULL AND [SerialNumber] <> ''");

        modelBuilder.Entity<EmployeeProbation>()
            .HasOne(p => p.Employee)
            .WithOne(e => e.Probation)
            .HasForeignKey<EmployeeProbation>(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeAppraisal>()
            .HasIndex(a => new { a.EmployeeId, a.CycleId }).IsUnique();
        modelBuilder.Entity<EmployeeAppraisal>()
            .HasOne(a => a.Employee)
            .WithMany(e => e.Appraisals)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeAppraisal>()
            .HasOne(a => a.Cycle)
            .WithMany()
            .HasForeignKey(a => a.CycleId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeAppraisal>()
            .HasOne(a => a.Reviewer)
            .WithMany()
            .HasForeignKey(a => a.ReviewerId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<AppraisalCycle>()
            .HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<EmployeeAppraisalGoal>()
            .HasOne(g => g.Appraisal)
            .WithMany(a => a.Goals)
            .HasForeignKey(g => g.AppraisalId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SalaryDiscussion>()
            .HasOne(s => s.Employee)
            .WithMany(e => e.SalaryDiscussions)
            .HasForeignKey(s => s.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SalaryDiscussion>()
            .HasOne(s => s.ProposedBy)
            .WithMany()
            .HasForeignKey(s => s.ProposedById)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SalaryDiscussion>()
            .HasOne(s => s.ApprovedBy)
            .WithMany()
            .HasForeignKey(s => s.ApprovedById)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeDocument>()
            .HasOne(d => d.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DocumentTemplate>()
            .HasIndex(t => t.Name).IsUnique();

        modelBuilder.Entity<Announcement>()
            .HasOne(a => a.CreatedBy)
            .WithMany()
            .HasForeignKey(a => a.CreatedById)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<AttendanceRecord>()
            .HasIndex(a => new { a.EmployeeId, a.Date }).IsUnique();
        modelBuilder.Entity<AttendanceRecord>()
            .HasOne(a => a.Employee)
            .WithMany()
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<KnowledgeBaseArticle>()
            .HasOne(k => k.CreatedBy)
            .WithMany()
            .HasForeignKey(k => k.CreatedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<MoodEntry>()
            .HasIndex(m => new { m.EmployeeId, m.Date }).IsUnique();
        modelBuilder.Entity<MoodEntry>()
            .HasOne(m => m.Employee)
            .WithMany()
            .HasForeignKey(m => m.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeSkill>()
            .HasIndex(es => new { es.EmployeeId, es.SkillName })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        modelBuilder.Entity<EmployeeSkill>()
            .HasOne(es => es.Employee)
            .WithMany()
            .HasForeignKey(es => es.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SkillEndorsement>()
            .HasIndex(se => new { se.EmployeeSkillId, se.EndorsedById }).IsUnique();
        modelBuilder.Entity<SkillEndorsement>()
            .HasOne(se => se.EmployeeSkill)
            .WithMany()
            .HasForeignKey(se => se.EmployeeSkillId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SkillEndorsement>()
            .HasQueryFilter(se => !se.EmployeeSkill!.IsDeleted);
        modelBuilder.Entity<SkillEndorsement>()
            .HasOne(se => se.EndorsedBy)
            .WithMany()
            .HasForeignKey(se => se.EndorsedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<BragPost>()
            .HasOne(b => b.Employee)
            .WithMany()
            .HasForeignKey(b => b.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<BragLike>()
            .HasIndex(bl => new { bl.BragPostId, bl.EmployeeId }).IsUnique();
        modelBuilder.Entity<BragLike>()
            .HasOne(bl => bl.BragPost)
            .WithMany(b => b.Likes)
            .HasForeignKey(bl => bl.BragPostId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<BragLike>()
            .HasQueryFilter(bl => !bl.BragPost!.IsDeleted);
        modelBuilder.Entity<BragLike>()
            .HasOne(bl => bl.Employee)
            .WithMany()
            .HasForeignKey(bl => bl.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CommuteRoute>()
            .HasIndex(c => c.EmployeeId)
            .IsUnique()
            .HasFilter("[IsActive] = 1 AND [IsDeleted] = 0");
        modelBuilder.Entity<CommuteRoute>()
            .HasOne(c => c.Employee)
            .WithMany()
            .HasForeignKey(c => c.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<CarpoolMember>()
            .HasIndex(cm => new { cm.GroupId, cm.EmployeeId })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        modelBuilder.Entity<CarpoolMember>()
            .HasOne(cm => cm.Group)
            .WithMany(g => g.Members)
            .HasForeignKey(cm => cm.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<CarpoolMember>()
            .HasOne(cm => cm.Employee)
            .WithMany()
            .HasForeignKey(cm => cm.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<DeskBooking>()
            .HasIndex(db => new { db.DeskId, db.Date, db.StartTime }).IsUnique();
        modelBuilder.Entity<DeskBooking>()
            .HasOne<Desk>()
            .WithMany()
            .HasForeignKey(db => db.DeskId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<DeskBooking>()
            .HasOne<Employee>()
            .WithMany()
            .HasForeignKey(db => db.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RoomBooking>()
            .HasIndex(rb => new { rb.RoomId, rb.Date, rb.StartTime }).IsUnique();
        modelBuilder.Entity<RoomBooking>()
            .HasOne<MeetingRoom>()
            .WithMany()
            .HasForeignKey(rb => rb.RoomId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RoomBooking>()
            .HasOne<Employee>()
            .WithMany()
            .HasForeignKey(rb => rb.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Desk>()
            .HasIndex(d => new { d.Building, d.Floor, d.Name }).IsUnique();
        modelBuilder.Entity<MeetingRoom>()
            .HasIndex(r => new { r.Building, r.Floor, r.Name }).IsUnique();

        modelBuilder.Entity<MentorshipProfile>()
            .HasIndex(mp => mp.EmployeeId).IsUnique();
        modelBuilder.Entity<MentorshipProfile>()
            .HasOne(mp => mp.Employee)
            .WithMany()
            .HasForeignKey(mp => mp.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<MentorshipMatch>()
            .HasIndex(mm => new { mm.MentorId, mm.MenteeId })
            .IsUnique()
            .HasFilter("[Status] IN ('Pending', 'Active')");
        modelBuilder.Entity<MentorshipMatch>()
            .HasOne(mm => mm.Mentor)
            .WithMany()
            .HasForeignKey(mm => mm.MentorId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<MentorshipMatch>()
            .HasOne(mm => mm.Mentee)
            .WithMany()
            .HasForeignKey(mm => mm.MenteeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<MentorshipSession>()
            .HasOne(ms => ms.Match)
            .WithMany()
            .HasForeignKey(ms => ms.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RewardPointsAccount>()
            .HasIndex(rpa => rpa.EmployeeId).IsUnique();
        modelBuilder.Entity<RewardPointsAccount>()
            .HasOne(rpa => rpa.Employee)
            .WithMany()
            .HasForeignKey(rpa => rpa.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RewardTransaction>()
            .HasOne(rt => rt.Employee)
            .WithMany()
            .HasForeignKey(rt => rt.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RewardRedemption>()
            .HasOne(rr => rr.Employee)
            .WithMany()
            .HasForeignKey(rr => rr.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<RewardRedemption>()
            .HasOne(rr => rr.Item)
            .WithMany()
            .HasForeignKey(rr => rr.ItemId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ExpenseClaim>()
            .HasOne(e => e.Employee).WithMany().HasForeignKey(e => e.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ExpenseClaim>()
            .HasOne(e => e.Category).WithMany().HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ExpenseClaim>()
            .HasOne(e => e.ApprovedBy).WithMany().HasForeignKey(e => e.ApprovedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ExpenseCategory>()
            .HasIndex(c => c.Name).IsUnique();

        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.Employee).WithMany().HasForeignKey(t => t.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.Project).WithMany().HasForeignKey(t => t.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.ApprovedBy).WithMany().HasForeignKey(t => t.ApprovedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetPeriod>()
            .HasIndex(t => new { t.EmployeeId, t.WeekStart }).IsUnique();
        modelBuilder.Entity<TimesheetPeriod>()
            .HasOne(t => t.Employee).WithMany().HasForeignKey(t => t.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetPeriod>()
            .HasOne(t => t.ApprovedBy).WithMany().HasForeignKey(t => t.ApprovedById).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TrainingRegistration>()
            .HasIndex(t => new { t.CourseId, t.EmployeeId }).IsUnique();
        modelBuilder.Entity<TrainingRegistration>()
            .HasOne(t => t.Course).WithMany().HasForeignKey(t => t.CourseId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TrainingRegistration>()
            .HasOne(t => t.Employee).WithMany().HasForeignKey(t => t.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeLoan>()
            .HasOne(l => l.Employee).WithMany().HasForeignKey(l => l.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeLoan>()
            .HasOne(l => l.LoanType).WithMany().HasForeignKey(l => l.LoanTypeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EmployeeLoan>()
            .HasOne(l => l.ApprovedBy).WithMany().HasForeignKey(l => l.ApprovedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<LoanType>()
            .HasIndex(t => t.Name).IsUnique();
        modelBuilder.Entity<LoanRepayment>()
            .HasIndex(r => new { r.LoanId, r.InstallmentNumber }).IsUnique();
        modelBuilder.Entity<LoanRepayment>()
            .HasOne(r => r.Loan).WithMany().HasForeignKey(r => r.LoanId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ShiftAssignment>()
            .HasOne(s => s.Employee).WithMany().HasForeignKey(s => s.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftAssignment>()
            .HasOne(s => s.ShiftTemplate).WithMany().HasForeignKey(s => s.ShiftTemplateId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftTemplate>()
            .HasIndex(s => s.Name).IsUnique();
        modelBuilder.Entity<ShiftSwap>()
            .HasOne(s => s.RequestedBy).WithMany().HasForeignKey(s => s.RequestedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftSwap>()
            .HasOne(s => s.TargetEmployee).WithMany().HasForeignKey(s => s.TargetEmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Visitor>()
            .HasOne(v => v.HostEmployee).WithMany().HasForeignKey(v => v.HostEmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SurveyQuestion>()
            .HasAlternateKey(q => new { q.SurveyId, q.Id });
        modelBuilder.Entity<SurveyQuestion>()
            .HasOne(q => q.Survey).WithMany(s => s.Questions).HasForeignKey(q => q.SurveyId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Survey>()
            .HasOne(s => s.CreatedBy).WithMany().HasForeignKey(s => s.CreatedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Survey).WithMany().HasForeignKey(r => r.SurveyId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SurveyResponse>()
            .HasIndex(r => new { r.SurveyId, r.QuestionId, r.EmployeeId }).IsUnique();
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Question)
            .WithMany()
            .HasForeignKey(r => new { r.SurveyId, r.QuestionId })
            .HasPrincipalKey(q => new { q.SurveyId, q.Id })
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Employee).WithMany().HasForeignKey(r => r.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<BenefitEnrollment>()
            .HasIndex(e => new { e.EmployeeId, e.BenefitPlanId })
            .IsUnique()
            .HasFilter("[Status] = 'Active'");
        modelBuilder.Entity<BenefitEnrollment>()
            .HasOne(e => e.Employee).WithMany().HasForeignKey(e => e.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<BenefitEnrollment>()
            .HasOne(e => e.BenefitPlan).WithMany().HasForeignKey(e => e.BenefitPlanId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<BenefitPlan>()
            .HasIndex(p => p.Name).IsUnique();

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Employee).WithMany().HasForeignKey(n => n.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<NotificationTemplate>()
            .HasIndex(t => t.EventType).IsUnique();

        modelBuilder.Entity<InternalJobApplication>()
            .HasIndex(a => new { a.JobPostingId, a.EmployeeId }).IsUnique();
        modelBuilder.Entity<InternalJobApplication>()
            .HasOne(a => a.JobPosting).WithMany().HasForeignKey(a => a.JobPostingId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<InternalJobApplication>()
            .HasOne(a => a.Employee).WithMany().HasForeignKey(a => a.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<InternalJobPosting>()
            .HasOne(p => p.CreatedBy).WithMany().HasForeignKey(p => p.CreatedById).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ComplianceRecord>()
            .HasOne(r => r.Requirement).WithMany().HasForeignKey(r => r.RequirementId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ComplianceRecord>()
            .HasOne(r => r.Employee).WithMany().HasForeignKey(r => r.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ContractorEmployee>()
            .HasOne(e => e.Contractor).WithMany().HasForeignKey(e => e.ContractorId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalDelegate>()
            .HasIndex(ad => new { ad.ManagerId, ad.ProjectId, ad.DelegateId })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        modelBuilder.Entity<ApprovalDelegate>()
            .HasOne(ad => ad.Manager)
            .WithMany()
            .HasForeignKey(ad => ad.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalDelegate>()
            .HasOne(ad => ad.Delegate)
            .WithMany()
            .HasForeignKey(ad => ad.DelegateId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalDelegate>()
            .HasOne(ad => ad.Project)
            .WithMany()
            .HasForeignKey(ad => ad.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<OrganizationRole>().HasData(
            new OrganizationRole { Id = 1, Name = "Employee", Importance = 100, IsCustom = false, BaseRoleId = 1 },
            new OrganizationRole { Id = 2, Name = "TeamLead", Label = "Team Lead", Importance = 200, IsCustom = false, BaseRoleId = 1 },
            new OrganizationRole { Id = 3, Name = "HR", Label = "HR L1", Importance = 300, IsCustom = false, BaseRoleId = 3 },
            new OrganizationRole { Id = 4, Name = "SeniorSoftwareEngineer", Label = "Senior Software Engineer", Importance = 150, IsCustom = false, BaseRoleId = 1 },
            new OrganizationRole { Id = 5, Name = "Manager", Label = "Technical Manager L1", Importance = 400, IsCustom = false, BaseRoleId = 5 },
            new OrganizationRole { Id = 6, Name = "OrganizationHead", Label = "Organization Head", Importance = 600, IsCustom = false, BaseRoleId = 5 },
            new OrganizationRole { Id = 7, Name = "HRL2", Label = "HR L2", Importance = 500, IsCustom = false, BaseRoleId = 3 },
            new OrganizationRole { Id = 8, Name = "ManagerL2", Label = "Technical Manager L2", Importance = 450, IsCustom = false, BaseRoleId = 5 },
            new OrganizationRole { Id = 9, Name = "Admin", Importance = 700, IsCustom = false, BaseRoleId = 9 },
            new OrganizationRole { Id = 10, Name = "SuperAdmin", Label = "Super Admin", Importance = 800, IsCustom = false, BaseRoleId = 9 }
        );

        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<OnboardingChecklistItem>().HasData(
            new OnboardingChecklistItem { Id = 1, Name = "ReliSoft ID Creation", Description = "Create ReliSoft email and system account", SortOrder = 1, CreatedOn = staticDate },
            new OnboardingChecklistItem { Id = 2, Name = "Client ID Creation", Description = "Create client-specific system accounts", SortOrder = 2, CreatedOn = staticDate },
            new OnboardingChecklistItem { Id = 3, Name = "Virtual ID Card", Description = "Generate virtual employee ID card", SortOrder = 3, CreatedOn = staticDate },
            new OnboardingChecklistItem { Id = 4, Name = "Gate Pass", Description = "Issue gate entry pass", SortOrder = 4, CreatedOn = staticDate },
            new OnboardingChecklistItem { Id = 5, Name = "Asset Allocation", Description = "Assign laptop, monitor and other hardware", SortOrder = 5, CreatedOn = staticDate },
            new OnboardingChecklistItem { Id = 6, Name = "Welcome Kit", Description = "Distribute welcome kit and documentation", SortOrder = 6, CreatedOn = staticDate }
        );

        modelBuilder.Entity<LeaveType>().HasData(
            new LeaveType { Id = 1, Name = "Sick/Casual Leave", SortOrder = 1, CarryForwardPct = 0, MaxConsecutiveDays = 3, RequiresAdvanceNotice = false },
            new LeaveType { Id = 2, Name = "Planned Leave", SortOrder = 2, CarryForwardPct = 50, MaxConsecutiveDays = 15, RequiresAdvanceNotice = true, AdvanceNoticeDays = 3 },
            new LeaveType { Id = 3, Name = "Maternity Leave", SortOrder = 3, MaxConsecutiveDays = 180, RequiresAdvanceNotice = true, AdvanceNoticeDays = 30 },
            new LeaveType { Id = 4, Name = "Paternity Leave", SortOrder = 4, MaxConsecutiveDays = 15, RequiresAdvanceNotice = true, AdvanceNoticeDays = 7 },
            new LeaveType { Id = 5, Name = "Bereavement Leave", SortOrder = 5, MaxConsecutiveDays = 3, RequiresAdvanceNotice = false },
            new LeaveType { Id = 6, Name = "Compensatory Off", SortOrder = 6, IsCompOff = true, CompOffValidityDays = 30, MaxConsecutiveDays = 1, RequiresAdvanceNotice = false },
            new LeaveType { Id = 7, Name = "Marriage Leave", SortOrder = 7, MaxConsecutiveDays = 5, RequiresAdvanceNotice = true, AdvanceNoticeDays = 7 },
            new LeaveType { Id = 8, Name = "Special Leave", SortOrder = 8, MaxConsecutiveDays = 30, RequiresAdvanceNotice = true, AdvanceNoticeDays = 15 },
            new LeaveType { Id = 9, Name = "Floater Holiday", SortOrder = 9, IsFloaterHoliday = true, MaxFloaterPerYear = 2, MaxConsecutiveDays = 1, RequiresAdvanceNotice = false }
        );

        modelBuilder.Entity<HrPolicy>().HasData(
            new HrPolicy { Id = 1, AllowHalfDayLeave = false, UpdatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Employee>().HasData(
            new Employee { Id = 1, EmployeeCode = "EMP-001", FullName = "Preeti Patil", Email = "preeti.patil@relisofttechnologies.com", Department = "HR", Designation = "HR Lead", JobRole = "HR Lead", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2024, 1, 15), RoleId = 7, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 2, EmployeeCode = "EMP-002", FullName = "Rakesh Patil", Email = "rakesh.patil@relisofttechnologies.com", Department = "Management", Designation = "CEO", JobRole = "CEO", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2023, 6, 1), RoleId = 6, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 3, EmployeeCode = "EMP-003", FullName = "Aradhana Shinde", Email = "aradhana.shinde@relisofttechnologies.com", Department = "Engineering", Designation = "Software Engineer", JobRole = "Software Engineer", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2025, 3, 10), RoleId = 1, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 4, EmployeeCode = "EMP-004", FullName = "Arif Nadeem Mirza", Email = "arif.nadeem.mirza@relisofttechnologies.com", Department = "Data Operations", Designation = "Technical Manager L2", JobRole = "Technical Delivery", EmploymentType = "Full-time", Location = "Pune", JoinDate = new DateTime(2025, 6, 12), RoleId = 8, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 5, EmployeeCode = "EMP-005", FullName = "Girish Patil", Email = "girish.patil@relisofttechnologies.com", Department = "Data Operations", Designation = "Technical Manager L2", JobRole = "Technical Delivery", EmploymentType = "Full-time", Location = "Bengaluru", JoinDate = new DateTime(2025, 8, 20), RoleId = 8, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 6, EmployeeCode = "EMP-006", FullName = "Shreerang Joshi", Email = "shreerang.joshi@relisofttechnologies.com", Department = "Quality Engineering", Designation = "Technical Manager L1", JobRole = "Quality Lead (All Areas)", EmploymentType = "Full-time", Location = "Pune", JoinDate = new DateTime(2024, 11, 1), RoleId = 5, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 7, EmployeeCode = "EMP-007", FullName = "Prathamesh Katikar", Email = "prathamesh.katikar@relisofttechnologies.com", Department = "Quality Engineering", Designation = "Quality Engineer", JobRole = "Quality Engineer (TLM / LQM)", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2026, 3, 1), RoleId = 1, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 8, EmployeeCode = "EMP-008", FullName = "Super HR", Email = "hr@relisofttechnologies.com", Department = "HR", Designation = "Super HR", JobRole = "Super HR", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2024, 6, 1), RoleId = 7, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 9, EmployeeCode = "EMP-009", FullName = "Unnati Gawali", Email = "unnati.gawali@relisofttechnologies.com", Department = "HR", Designation = "HR Executive", JobRole = "HR Executive", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2025, 9, 1), RoleId = 3, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<UserLogin>().HasData(
            new UserLogin { Id = 1, EmployeeId = 1, Username = "preeti", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 2, EmployeeId = 2, Username = "rakesh", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 3, EmployeeId = 3, Username = "aradhana", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 4, EmployeeId = 4, Username = "arif", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 5, EmployeeId = 5, Username = "girish", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 6, EmployeeId = 6, Username = "shreerang", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 7, EmployeeId = 7, Username = "prathamesh", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 8, EmployeeId = 8, Username = "hr", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 9, EmployeeId = 9, Username = "unnati", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }

    private void ConvertPhysicalDeletesToSoftDeletes()
    {
        var utcNow = DateTime.UtcNow;
        var deletedEntries = ChangeTracker.Entries<ISoftDeletable>()
            .Where(entry => entry.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in deletedEntries)
        {
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedOn ??= utcNow;
        }
    }

    private static void ConfigureSoftDeletion(ModelBuilder modelBuilder)
    {
        var configureMethod = typeof(AppDbContext).GetMethod(
            nameof(ConfigureSoftDeleteEntity),
            BindingFlags.NonPublic | BindingFlags.Static)!;

        var softDeletableTypes = modelBuilder.Model.GetEntityTypes()
            .Select(entityType => entityType.ClrType)
            .Where(entityType => typeof(ISoftDeletable).IsAssignableFrom(entityType))
            .Distinct()
            .ToList();

        foreach (var entityType in softDeletableTypes)
            configureMethod.MakeGenericMethod(entityType).Invoke(null, [modelBuilder]);
    }

    private static void ConfigureSoftDeleteEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ISoftDeletable
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(entity => !entity.IsDeleted);
    }

    private static void ConfigureDecimalPrecision(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var decimalProperties = entityType.ClrType.GetProperties()
                .Where(property => property.CanWrite &&
                    (property.PropertyType == typeof(decimal) || property.PropertyType == typeof(decimal?)));

            foreach (var property in decimalProperties)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(property.Name)
                    .HasPrecision(18, 2);
            }
        }
    }

    private static void ConfigureCheckConstraints(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LeaveApplication>().ToTable(table =>
        {
            table.HasCheckConstraint("CK_LeaveApplications_DateRange", "[ToDate] >= [FromDate]");
            table.HasCheckConstraint("CK_LeaveApplications_TotalDays", "[TotalDays] > 0");
            table.HasCheckConstraint("CK_LeaveApplications_ApprovalRoute", "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate', 'Legacy')");
        });
        modelBuilder.Entity<Project>().ToTable(table =>
        {
            table.HasCheckConstraint("CK_Projects_ApprovalRoute", "[ApprovalRoute] IN ('ProjectManager', 'TeamLead', 'Delegate')");
            table.HasCheckConstraint("CK_Projects_ApprovalDelegate", "([ApprovalRoute] = 'Delegate' AND [ApprovalDelegateId] IS NOT NULL) OR ([ApprovalRoute] <> 'Delegate' AND [ApprovalDelegateId] IS NULL)");
        });
        modelBuilder.Entity<EmployeeLeaveBalance>().ToTable(table =>
            table.HasCheckConstraint("CK_EmployeeLeaveBalances_NonNegative", "[AllocatedLeaves] >= 0 AND [UsedLeaves] >= 0"));
        modelBuilder.Entity<CompOffTransfer>().ToTable(table =>
        {
            table.HasCheckConstraint("CK_CompOffTransfers_Days", "[Days] > 0");
            table.HasCheckConstraint("CK_CompOffTransfers_DifferentEmployees", "[FromEmployeeId] <> [ToEmployeeId]");
        });
        modelBuilder.Entity<SalaryStructure>().ToTable(table =>
            table.HasCheckConstraint("CK_SalaryStructures_NonNegative", "[FixedPay] >= 0 AND [VariablePay] >= 0 AND [PF] >= 0 AND [Gratuity] >= 0 AND [Insurance] >= 0 AND [OtherDeductions] >= 0"));
        modelBuilder.Entity<EmployeeAppraisal>().ToTable(table =>
            table.HasCheckConstraint("CK_EmployeeAppraisals_Ratings", "([SelfRating] IS NULL OR [SelfRating] BETWEEN 1 AND 5) AND ([ManagerRating] IS NULL OR [ManagerRating] BETWEEN 1 AND 5) AND ([FinalRating] IS NULL OR [FinalRating] BETWEEN 1 AND 5)"));
        modelBuilder.Entity<MoodEntry>().ToTable(table =>
            table.HasCheckConstraint("CK_MoodEntries_Score", "[Score] BETWEEN 1 AND 5"));
        modelBuilder.Entity<DeskBooking>().ToTable(table =>
            table.HasCheckConstraint("CK_DeskBookings_TimeRange", "[EndTime] > [StartTime]"));
        modelBuilder.Entity<RoomBooking>().ToTable(table =>
            table.HasCheckConstraint("CK_RoomBookings_TimeRange", "[EndTime] > [StartTime]"));
        modelBuilder.Entity<TimesheetEntry>().ToTable(table =>
            table.HasCheckConstraint("CK_TimesheetEntries_Hours", "[Hours] > 0 AND [Hours] <= 24"));
        modelBuilder.Entity<TimesheetPeriod>().ToTable(table =>
            table.HasCheckConstraint("CK_TimesheetPeriods_DateRange", "[WeekEnd] >= [WeekStart]"));
        modelBuilder.Entity<TrainingCourse>().ToTable(table =>
            table.HasCheckConstraint("CK_TrainingCourses_DateRange", "[EndDate] IS NULL OR [EndDate] >= [StartDate]"));
        modelBuilder.Entity<LoanType>().ToTable(table =>
            table.HasCheckConstraint("CK_LoanTypes_Amounts", "[MinAmount] >= 0 AND [MaxAmount] >= [MinAmount] AND [InterestRate] >= 0 AND [MaxInstallments] > 0"));
        modelBuilder.Entity<EmployeeLoan>().ToTable(table =>
            table.HasCheckConstraint("CK_EmployeeLoans_Amounts", "[Amount] > 0 AND [Installments] > 0 AND [InterestRate] >= 0 AND [EmiAmount] >= 0 AND [OutstandingBalance] >= 0"));
        modelBuilder.Entity<ShiftAssignment>().ToTable(table =>
            table.HasCheckConstraint("CK_ShiftAssignments_DateRange", "[EndDate] IS NULL OR [EndDate] >= [StartDate]"));
        modelBuilder.Entity<ShiftSwap>().ToTable(table =>
            table.HasCheckConstraint("CK_ShiftSwaps_DifferentEmployees", "[RequestedById] <> [TargetEmployeeId]"));
        modelBuilder.Entity<Survey>().ToTable(table =>
            table.HasCheckConstraint("CK_Surveys_DateRange", "[EndDate] >= [StartDate]"));
        modelBuilder.Entity<BenefitPlan>().ToTable(table =>
            table.HasCheckConstraint("CK_BenefitPlans_NonNegativeCosts", "[EmployeeCost] >= 0 AND [EmployerCost] >= 0"));
        modelBuilder.Entity<BenefitEnrollment>().ToTable(table =>
            table.HasCheckConstraint("CK_BenefitEnrollments_DateRange", "[TerminationDate] IS NULL OR [TerminationDate] >= [EnrollmentDate]"));
        modelBuilder.Entity<InternalJobPosting>().ToTable(table =>
            table.HasCheckConstraint("CK_InternalJobPostings_DateRange", "[ClosingDate] >= [PostingDate]"));
        modelBuilder.Entity<Contractor>().ToTable(table =>
            table.HasCheckConstraint("CK_Contractors_DateRange", "[ContractEnd] >= [ContractStart]"));
    }

    private static void ConfigureOptimisticConcurrency(ModelBuilder modelBuilder)
    {
        var existingAggregateTypes = new[]
        {
            typeof(Asset),
            typeof(EmployeeAsset),
            typeof(BenefitEnrollment),
            typeof(EmployeeAppraisal),
            typeof(EmployeeLeaveBalance),
            typeof(EmployeeLoan),
            typeof(EmployeeOnboarding),
            typeof(EmployeeOffboarding),
            typeof(EmployeeTicket),
            typeof(ExpenseClaim),
            typeof(LeaveApplication),
            typeof(RewardCatalogItem),
            typeof(RewardPointsAccount),
            typeof(RewardRedemption),
            typeof(ShiftAssignment),
            typeof(ShiftSwap),
            typeof(TimesheetEntry),
            typeof(TrainingCourse),
            typeof(TrainingRegistration),
            typeof(Visitor)
        };

        var aggregateTypes = existingAggregateTypes
            .Concat(modelBuilder.Model.GetEntityTypes()
                .Select(entityType => entityType.ClrType)
                .Where(entityType => typeof(IHasRowVersion).IsAssignableFrom(entityType)))
            .Distinct();

        foreach (var aggregateType in aggregateTypes)
        {
            modelBuilder.Entity(aggregateType)
                .Property<byte[]>("RowVersion")
                .IsRowVersion();
        }
    }
}
