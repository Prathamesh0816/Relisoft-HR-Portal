using Microsoft.EntityFrameworkCore;
using RelisoftHR.Models;

namespace RelisoftHR.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<UserLogin> UserLogins => Set<UserLogin>();
    public DbSet<OrganizationRole> OrganizationRoles => Set<OrganizationRole>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveApplication> LeaveApplications => Set<LeaveApplication>();
    public DbSet<EmployeeLeaveBalance> EmployeeLeaveBalances => Set<EmployeeLeaveBalance>();
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
            .HasOne(t => t.Lead)
            .WithMany()
            .HasForeignKey(t => t.LeadId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.PrimaryTeam)
            .WithMany()
            .HasForeignKey(e => e.PrimaryTeamId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.SalaryStructure)
            .WithMany()
            .HasForeignKey(e => e.SalaryStructureId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SalaryStructure>()
            .HasOne(ss => ss.Employee)
            .WithMany()
            .HasForeignKey(ss => ss.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasIndex(elb => new { elb.EmployeeId, elb.LeaveTypeId }).IsUnique();

        modelBuilder.Entity<UserLogin>()
            .HasIndex(ul => ul.Username).IsUnique();

        modelBuilder.Entity<SalaryStructure>()
            .HasIndex(ss => ss.EmployeeId).IsUnique();

        modelBuilder.Entity<EmployeeOnboarding>()
            .HasOne(o => o.Employee)
            .WithOne(e => e.Onboarding)
            .HasForeignKey<EmployeeOnboarding>(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOnboardingStep>()
            .HasOne(s => s.Onboarding)
            .WithMany(o => o.Steps)
            .HasForeignKey(s => s.OnboardingId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<EmployeeOffboarding>()
            .HasOne(o => o.Employee)
            .WithOne(e => e.Offboarding)
            .HasForeignKey<EmployeeOffboarding>(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
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

        modelBuilder.Entity<EmployeeProbation>()
            .HasOne(p => p.Employee)
            .WithOne(e => e.Probation)
            .HasForeignKey<EmployeeProbation>(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
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

        modelBuilder.Entity<Announcement>()
            .HasOne(a => a.CreatedBy)
            .WithMany()
            .HasForeignKey(a => a.CreatedById)
            .OnDelete(DeleteBehavior.NoAction);
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
            .HasIndex(es => new { es.EmployeeId, es.SkillName }).IsUnique();
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
            .OnDelete(DeleteBehavior.Cascade);
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
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<BragLike>()
            .HasOne(bl => bl.Employee)
            .WithMany()
            .HasForeignKey(bl => bl.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CommuteRoute>()
            .HasOne(c => c.Employee)
            .WithMany()
            .HasForeignKey(c => c.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<CarpoolMember>()
            .HasIndex(cm => new { cm.GroupId, cm.EmployeeId }).IsUnique();
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

        modelBuilder.Entity<MentorshipProfile>()
            .HasIndex(mp => mp.EmployeeId).IsUnique();
        modelBuilder.Entity<MentorshipProfile>()
            .HasOne(mp => mp.Employee)
            .WithMany()
            .HasForeignKey(mp => mp.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
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

        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.Employee).WithMany().HasForeignKey(t => t.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.Project).WithMany().HasForeignKey(t => t.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TimesheetEntry>()
            .HasOne(t => t.ApprovedBy).WithMany().HasForeignKey(t => t.ApprovedById).OnDelete(DeleteBehavior.NoAction);

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
        modelBuilder.Entity<LoanRepayment>()
            .HasOne(r => r.Loan).WithMany().HasForeignKey(r => r.LoanId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ShiftAssignment>()
            .HasOne(s => s.Employee).WithMany().HasForeignKey(s => s.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftAssignment>()
            .HasOne(s => s.ShiftTemplate).WithMany().HasForeignKey(s => s.ShiftTemplateId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftSwap>()
            .HasOne(s => s.RequestedBy).WithMany().HasForeignKey(s => s.RequestedById).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ShiftSwap>()
            .HasOne(s => s.TargetEmployee).WithMany().HasForeignKey(s => s.TargetEmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Visitor>()
            .HasOne(v => v.HostEmployee).WithMany().HasForeignKey(v => v.HostEmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SurveyQuestion>()
            .HasOne(q => q.Survey).WithMany().HasForeignKey(q => q.SurveyId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Survey).WithMany().HasForeignKey(r => r.SurveyId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Question).WithMany().HasForeignKey(r => r.QuestionId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SurveyResponse>()
            .HasOne(r => r.Employee).WithMany().HasForeignKey(r => r.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<BenefitEnrollment>()
            .HasOne(e => e.Employee).WithMany().HasForeignKey(e => e.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<BenefitEnrollment>()
            .HasOne(e => e.BenefitPlan).WithMany().HasForeignKey(e => e.BenefitPlanId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Employee).WithMany().HasForeignKey(n => n.EmployeeId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InternalJobApplication>()
            .HasOne(a => a.JobPosting).WithMany().HasForeignKey(a => a.JobPostingId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<InternalJobApplication>()
            .HasOne(a => a.Employee).WithMany().HasForeignKey(a => a.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ComplianceRecord>()
            .HasOne(r => r.Requirement).WithMany().HasForeignKey(r => r.RequirementId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ComplianceRecord>()
            .HasOne(r => r.Employee).WithMany().HasForeignKey(r => r.EmployeeId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ContractorEmployee>()
            .HasOne(e => e.Contractor).WithMany().HasForeignKey(e => e.ContractorId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalDelegate>()
            .HasIndex(ad => new { ad.ManagerId, ad.ProjectId, ad.DelegateId }).IsUnique();
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
            new LeaveType { Id = 1, Name = "Sick/Casual Leave", SortOrder = 1, CarryForwardPct = 0 },
            new LeaveType { Id = 2, Name = "Planned Leave", SortOrder = 2, CarryForwardPct = 50 },
            new LeaveType { Id = 3, Name = "Maternity Leave", SortOrder = 3 },
            new LeaveType { Id = 4, Name = "Paternity Leave", SortOrder = 4 },
            new LeaveType { Id = 5, Name = "Bereavement Leave", SortOrder = 5 },
            new LeaveType { Id = 6, Name = "Compensatory Off", SortOrder = 6, IsCompOff = true, CompOffValidityDays = 30 },
            new LeaveType { Id = 7, Name = "Marriage Leave", SortOrder = 7 },
            new LeaveType { Id = 8, Name = "Special Leave", SortOrder = 8 },
            new LeaveType { Id = 9, Name = "Floater Holiday", SortOrder = 9, IsFloaterHoliday = true, MaxFloaterPerYear = 2 }
        );

        modelBuilder.Entity<HrPolicy>().HasData(
            new HrPolicy { Id = 1, AllowHalfDayLeave = false, UpdatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Employee>().HasData(
            new Employee { Id = 1, EmployeeCode = "EMP-001", FullName = "Preeti Sharma", Email = "preeti@relisoft.com", Department = "HR", Designation = "HR Lead", JobRole = "HR Lead", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2024, 1, 15), RoleId = 7, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 2, EmployeeCode = "EMP-002", FullName = "Rakesh Mehta", Email = "rakesh@relisoft.com", Department = "Management", Designation = "CEO", JobRole = "CEO", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2023, 6, 1), RoleId = 6, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Employee { Id = 3, EmployeeCode = "EMP-003", FullName = "Aradhana Singh", Email = "aradhana@relisoft.com", Department = "Engineering", Designation = "Software Engineer", JobRole = "Software Engineer", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2025, 3, 10), RoleId = 1, CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<UserLogin>().HasData(
            new UserLogin { Id = 1, EmployeeId = 1, Username = "preeti", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 2, EmployeeId = 2, Username = "rakesh", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new UserLogin { Id = 3, EmployeeId = 3, Username = "aradhana", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
