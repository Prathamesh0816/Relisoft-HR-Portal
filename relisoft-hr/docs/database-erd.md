# ReliSoft HR Database ERD Review

Source of truth reviewed: `server/Migrations/AppDbContextModelSnapshot.cs` and `server/Data/AppDbContext.cs`.

The implemented backend is EF Core with SQL Server tables. `specs/database/schema.md` still describes a MongoDB/Mongoose schema, so that spec is currently stale compared with the code.

## Summary

- Tables in implemented EF model: 88
- Relationships in implemented EF model: 98
- Main design center: `Employee`, with organization, leave, lifecycle, workplace, engagement, and operations modules around it.
- Overall EF relationship wiring is mostly coherent, but there are several missing uniqueness and referential constraints that can allow duplicate or orphaned business data.

## Relationship Review

### High priority

- `Employee.EmployeeCode` and `Employee.Email` are required but not unique in the EF model. HR systems normally require both to be unique. Add unique indexes for `EmployeeCode` and, if business rules require it, `Email`.
- `LeaveApplication.ApproverId`, `LeaveApplication.CancellationActionedById`, and `EmployeeTicket.AssignedHrId` are stored as IDs but are not foreign keys. If these should point to employees or users, add navigation properties and FK configuration.
- Workforce resilience tables contain ID-looking fields (`EmployeeId`, `OwnerId`, `DependentId`, `CreatedById`) but have no real FKs. That makes the workforce module a denormalized reporting area rather than a relational module.
- `ApprovalDelegate` has a unique index on `(ManagerId, ProjectId, DelegateId)`, but SQL Server filters nullable unique indexes to rows where `ProjectId IS NOT NULL`. This means duplicate global delegates with `ProjectId = null` are still possible.
- The implemented schema and documented schema are for different databases: SQL Server/EF Core in code versus MongoDB/Mongoose in `specs/database/schema.md`.

### Medium priority

- `AttendanceRecord` only has an index on `EmployeeId`; it does not enforce one record per employee per date. Consider a unique `(EmployeeId, Date)` index.
- `SurveyResponse` stores both `SurveyId` and `QuestionId`, but there is no database constraint that the question belongs to the same survey as the response. A wrong pair can be inserted unless guarded in application logic.
- `InternalJobApplication` and `TrainingRegistration` do not prevent duplicate applications/registrations for the same employee and posting/course. Consider unique indexes on `(JobPostingId, EmployeeId)` and `(CourseId, EmployeeId)`.
- `DeskBooking` and `RoomBooking` prevent duplicate bookings with the same start time, but not overlapping time ranges. This needs application validation or stronger persisted constraints.
- `Employee.PrimaryTeamId` and `EmployeeTeam` can disagree. If primary team must be one of the employee's memberships, enforce that in service logic or with a stricter model.
- Several employee-owned records cascade on employee delete. That may be fine for hard-delete cleanup, but HR systems often prefer soft delete or `NoAction` for audit history.

## Core Organization

```mermaid
erDiagram
    OrganizationRole ||--o{ Employee : RoleId
    Team ||--o{ Employee : PrimaryTeamId_nullable
    Project ||--o{ Team : ProjectId
    Employee ||--o{ Team : LeadId
    Employee ||--o{ EmployeeTeam : EmployeeId
    Team ||--o{ EmployeeTeam : TeamId
    Employee ||--|| UserLogin : EmployeeId
    Employee ||--|| SalaryStructure : EmployeeId
    Employee ||--o{ ApprovalDelegate : ManagerId
    Employee ||--o{ ApprovalDelegate : DelegateId
    Project ||--o{ ApprovalDelegate : ProjectId_nullable

    Employee {
        int Id PK
        string EmployeeCode
        string FullName
        string Email
        int RoleId FK
        int PrimaryTeamId FK
    }
    OrganizationRole {
        int Id PK
        string Name
        int BaseRoleId
    }
    Project {
        int Id PK
        string Name
    }
    Team {
        int Id PK
        int ProjectId FK
        int LeadId FK
    }
    EmployeeTeam {
        int Id PK
        int EmployeeId FK
        int TeamId FK
    }
    UserLogin {
        int Id PK
        int EmployeeId FK
        string Username UK
    }
    SalaryStructure {
        int Id PK
        int EmployeeId FK
    }
    ApprovalDelegate {
        int Id PK
        int ManagerId FK
        int DelegateId FK
        int ProjectId FK
    }
```

## Leave, Attendance, and Helpdesk

```mermaid
erDiagram
    Employee ||--o{ LeaveApplication : EmployeeId
    LeaveType ||--o{ LeaveApplication : LeaveTypeId
    Employee ||--o{ EmployeeLeaveBalance : EmployeeId
    LeaveType ||--o{ EmployeeLeaveBalance : LeaveTypeId
    Employee ||--o{ LeaveAccrualLog : EmployeeId
    LeaveType ||--o{ LeaveAccrualLog : LeaveTypeId
    Employee ||--o{ CompOffTransfer : FromEmployeeId
    Employee ||--o{ CompOffTransfer : ToEmployeeId
    Employee ||--o{ AttendanceRecord : EmployeeId
    Employee ||--o{ EmployeeTicket : EmployeeId
    EmployeeTicket ||--o{ EmployeeTicketTimelineEvent : TicketId

    LeaveType {
        int Id PK
        string Name
        bool IsCompOff
        bool IsFloaterHoliday
    }
    LeaveApplication {
        int Id PK
        int EmployeeId FK
        int LeaveTypeId FK
        int ApproverId
        int CancellationActionedById
    }
    EmployeeLeaveBalance {
        int Id PK
        int EmployeeId FK
        int LeaveTypeId FK
    }
    LeaveAccrualLog {
        int Id PK
        int EmployeeId FK
        int LeaveTypeId FK
    }
    CompOffTransfer {
        int Id PK
        int FromEmployeeId FK
        int ToEmployeeId FK
    }
    AttendanceRecord {
        int Id PK
        int EmployeeId FK
        DateTime Date
    }
    EmployeeTicket {
        int Id PK
        int EmployeeId FK
        int AssignedHrId
    }
    EmployeeTicketTimelineEvent {
        int Id PK
        int TicketId FK
    }
```

## HR Lifecycle, Documents, and Performance

```mermaid
erDiagram
    Employee ||--o{ EmployeeOnboardingProfile : EmployeeId
    EmployeeOnboardingProfile ||--o{ EmployeeOnboardingDocument : OnboardingProfileId
    EmployeeOnboardingProfile ||--o{ EmployeeOnboardingExperience : OnboardingProfileId
    Employee ||--|| EmployeeOnboarding : EmployeeId
    EmployeeOnboarding ||--o{ EmployeeOnboardingStep : OnboardingId
    OnboardingChecklistItem ||--o{ EmployeeOnboardingStep : ChecklistItemId
    Employee ||--|| EmployeeOffboarding : EmployeeId
    Employee ||--|| EmployeeProbation : EmployeeId
    Employee ||--o{ EmployeeAsset : EmployeeId
    Asset ||--o{ EmployeeAsset : AssetId
    Employee ||--o{ EmployeeDocument : EmployeeId
    DocumentTemplate ||--o{ EmployeeDocument : TemplateId_nullable
    Employee ||--o{ EmployeeAppraisal : EmployeeId
    Employee ||--o{ EmployeeAppraisal : ReviewerId_nullable
    AppraisalCycle ||--o{ EmployeeAppraisal : CycleId
    EmployeeAppraisal ||--o{ EmployeeAppraisalGoal : AppraisalId
    Employee ||--o{ SalaryDiscussion : EmployeeId
    Employee ||--o{ SalaryDiscussion : ProposedById_nullable
    Employee ||--o{ SalaryDiscussion : ApprovedById_nullable

    EmployeeOnboardingProfile {
        int Id PK
        int EmployeeId FK
    }
    EmployeeOnboarding {
        int Id PK
        int EmployeeId FK
    }
    EmployeeOffboarding {
        int Id PK
        int EmployeeId FK
    }
    EmployeeProbation {
        int Id PK
        int EmployeeId FK
    }
    EmployeeAsset {
        int Id PK
        int EmployeeId FK
        int AssetId FK
    }
    EmployeeDocument {
        int Id PK
        int EmployeeId FK
        int TemplateId FK
    }
    EmployeeAppraisal {
        int Id PK
        int EmployeeId FK
        int ReviewerId FK
        int CycleId FK
    }
    SalaryDiscussion {
        int Id PK
        int EmployeeId FK
        int ProposedById FK
        int ApprovedById FK
    }
```

## Engagement, Workplace, and Rewards

```mermaid
erDiagram
    Employee ||--o{ Announcement : CreatedById
    Employee ||--o{ KnowledgeBaseArticle : CreatedById
    Employee ||--o{ MoodEntry : EmployeeId
    Employee ||--o{ EmployeeSkill : EmployeeId
    EmployeeSkill ||--o{ SkillEndorsement : EmployeeSkillId
    Employee ||--o{ SkillEndorsement : EndorsedById
    Employee ||--o{ BragPost : EmployeeId
    BragPost ||--o{ BragLike : BragPostId
    Employee ||--o{ BragLike : EmployeeId
    Employee ||--o{ CommuteRoute : EmployeeId
    CarpoolGroup ||--o{ CarpoolMember : GroupId
    Employee ||--o{ CarpoolMember : EmployeeId
    Desk ||--o{ DeskBooking : DeskId
    Employee ||--o{ DeskBooking : EmployeeId
    MeetingRoom ||--o{ RoomBooking : RoomId
    Employee ||--o{ RoomBooking : EmployeeId
    Employee ||--o{ MentorshipProfile : EmployeeId
    Employee ||--o{ MentorshipMatch : MentorId
    Employee ||--o{ MentorshipMatch : MenteeId
    MentorshipMatch ||--o{ MentorshipSession : MatchId
    Employee ||--|| RewardPointsAccount : EmployeeId
    Employee ||--o{ RewardTransaction : EmployeeId
    Employee ||--o{ RewardRedemption : EmployeeId
    RewardCatalogItem ||--o{ RewardRedemption : ItemId
    Employee ||--o{ Survey : CreatedById
    Survey ||--o{ SurveyQuestion : SurveyId
    Survey ||--o{ SurveyResponse : SurveyId
    SurveyQuestion ||--o{ SurveyResponse : QuestionId
    Employee ||--o{ SurveyResponse : EmployeeId
    Employee ||--o{ Notification : EmployeeId

    MoodEntry {
        int Id PK
        int EmployeeId FK
        DateTime Date UK
    }
    EmployeeSkill {
        int Id PK
        int EmployeeId FK
        string SkillName UK
    }
    BragPost {
        int Id PK
        int EmployeeId FK
    }
    CarpoolMember {
        int Id PK
        int GroupId FK
        int EmployeeId FK
    }
    DeskBooking {
        int Id PK
        int DeskId FK
        int EmployeeId FK
    }
    RoomBooking {
        int Id PK
        int RoomId FK
        int EmployeeId FK
    }
    SurveyResponse {
        int Id PK
        int SurveyId FK
        int QuestionId FK
        int EmployeeId FK
    }
```

## Operations and Administration

```mermaid
erDiagram
    Employee ||--o{ BenefitEnrollment : EmployeeId
    BenefitPlan ||--o{ BenefitEnrollment : BenefitPlanId
    Employee ||--o{ ExpenseClaim : EmployeeId
    Employee ||--o{ ExpenseClaim : ApprovedById_nullable
    ExpenseCategory ||--o{ ExpenseClaim : CategoryId
    Employee ||--o{ TimesheetEntry : EmployeeId
    Employee ||--o{ TimesheetEntry : ApprovedById_nullable
    Project ||--o{ TimesheetEntry : ProjectId_nullable
    Employee ||--o{ TimesheetPeriod : EmployeeId
    Employee ||--o{ TimesheetPeriod : ApprovedById_nullable
    TrainingCourse ||--o{ TrainingRegistration : CourseId
    Employee ||--o{ TrainingRegistration : EmployeeId
    Employee ||--o{ EmployeeLoan : EmployeeId
    Employee ||--o{ EmployeeLoan : ApprovedById_nullable
    LoanType ||--o{ EmployeeLoan : LoanTypeId
    EmployeeLoan ||--o{ LoanRepayment : LoanId
    Employee ||--o{ ShiftAssignment : EmployeeId
    ShiftTemplate ||--o{ ShiftAssignment : ShiftTemplateId
    Employee ||--o{ ShiftSwap : RequestedById
    Employee ||--o{ ShiftSwap : TargetEmployeeId
    Employee ||--o{ Visitor : HostEmployeeId_nullable
    ComplianceRequirement ||--o{ ComplianceRecord : RequirementId
    Employee ||--o{ ComplianceRecord : EmployeeId_nullable
    Contractor ||--o{ ContractorEmployee : ContractorId
    Employee ||--o{ InternalJobPosting : CreatedById
    InternalJobPosting ||--o{ InternalJobApplication : JobPostingId
    Employee ||--o{ InternalJobApplication : EmployeeId

    BenefitEnrollment {
        int Id PK
        int EmployeeId FK
        int BenefitPlanId FK
    }
    ExpenseClaim {
        int Id PK
        int EmployeeId FK
        int CategoryId FK
        int ApprovedById FK
    }
    TimesheetEntry {
        int Id PK
        int EmployeeId FK
        int ProjectId FK
        int ApprovedById FK
    }
    TrainingRegistration {
        int Id PK
        int CourseId FK
        int EmployeeId FK
    }
    EmployeeLoan {
        int Id PK
        int EmployeeId FK
        int LoanTypeId FK
        int ApprovedById FK
    }
    ShiftAssignment {
        int Id PK
        int EmployeeId FK
        int ShiftTemplateId FK
    }
    InternalJobApplication {
        int Id PK
        int JobPostingId FK
        int EmployeeId FK
    }
```

## Workforce Resilience Tables

These are implemented as standalone tables. They contain duplicated names and ID-like columns, but EF does not define relationships to `Employees`, `Projects`, or users.

```mermaid
erDiagram
    WorkforceEmployee {
        int Id PK
        string EmployeeCode
        string FullName
        string Team
        string Role
    }
    WorkforceProject {
        int Id PK
        string ProjectCode
        string ProjectName
        string Team
        string Client
    }
    WorkforceDependency {
        int Id PK
        int OwnerId
        int DependentId
        string DependencyType
    }
    WorkforceKnowledge {
        int Id PK
        int EmployeeId
        string EmployeeName
        string KnowledgeArea
    }
    WorkforcePerformance {
        int Id PK
        int EmployeeId
        string EmployeeName
        string Team
    }
    WorkforceWorkload {
        int Id PK
        int EmployeeId
        string EmployeeName
        string Team
    }
    WorkforceScenario {
        int Id PK
        int CreatedById
        string Name
        string Status
    }
    WorkforceFeedback {
        int Id PK
        int EmployeeId
        string EmployeeName
        string ActionTitle
    }
```

## Table Coverage

### Core

`Employees`, `UserLogins`, `OrganizationRoles`, `Projects`, `Teams`, `EmployeeTeams`, `ApprovalDelegates`, `SalaryStructures`

### Leave, Attendance, and Tickets

`LeaveTypes`, `LeaveApplications`, `EmployeeLeaveBalances`, `LeaveAccrualLogs`, `CompOffTransfers`, `AttendanceRecords`, `EmployeeTickets`, `EmployeeTicketTimelineEvents`, `HrPolicies`

### Lifecycle, Documents, Assets, Performance

`EmployeeOnboardingProfiles`, `EmployeeOnboardingExperiences`, `EmployeeOnboardingDocuments`, `EmployeeOnboardings`, `EmployeeOnboardingSteps`, `OnboardingChecklistItems`, `EmployeeOffboardings`, `EmployeeProbations`, `Assets`, `EmployeeAssets`, `DocumentTemplates`, `EmployeeDocuments`, `AppraisalCycles`, `EmployeeAppraisals`, `EmployeeAppraisalGoals`, `SalaryDiscussions`

### Engagement and Workplace

`Announcements`, `KnowledgeBaseArticles`, `MoodEntries`, `EmployeeSkills`, `SkillEndorsements`, `BragPosts`, `BragLikes`, `CommuteRoutes`, `CarpoolGroups`, `CarpoolMembers`, `Desks`, `MeetingRooms`, `DeskBookings`, `RoomBookings`, `MentorshipProfiles`, `MentorshipMatches`, `MentorshipSessions`, `Surveys`, `SurveyQuestions`, `SurveyResponses`, `Notifications`, `NotificationTemplates`

### Operations

`BenefitPlans`, `BenefitEnrollments`, `ExpenseCategories`, `ExpenseClaims`, `TimesheetEntries`, `TimesheetPeriods`, `TrainingCourses`, `TrainingRegistrations`, `LoanTypes`, `EmployeeLoans`, `LoanRepayments`, `ShiftTemplates`, `ShiftAssignments`, `ShiftSwaps`, `Visitors`, `ComplianceRequirements`, `ComplianceRecords`, `Contractors`, `ContractorEmployees`, `InternalJobPostings`, `InternalJobApplications`, `RewardPointsAccounts`, `RewardTransactions`, `RewardCatalogItems`, `RewardRedemptions`

### Workforce Resilience

`WorkforceEmployees`, `WorkforceProjects`, `WorkforceDependencies`, `WorkforceKnowledges`, `WorkforcePerformances`, `WorkforceWorkloads`, `WorkforceScenarios`, `WorkforceFeedbacks`

## Indexes Worth Keeping

- `EmployeeTeams`: unique `(EmployeeId, TeamId)`
- `EmployeeLeaveBalances`: unique `(EmployeeId, LeaveTypeId)`
- `UserLogins`: unique `EmployeeId`, unique `Username`
- `SalaryStructures`: unique `EmployeeId`
- `EmployeeOnboardings`, `EmployeeOffboardings`, `EmployeeProbations`: unique `EmployeeId`
- `MoodEntries`: unique `(EmployeeId, Date)`
- `EmployeeSkills`: unique `(EmployeeId, SkillName)`
- `SkillEndorsements`: unique `(EmployeeSkillId, EndorsedById)`
- `BragLikes`: unique `(BragPostId, EmployeeId)`
- `CarpoolMembers`: unique `(GroupId, EmployeeId)`
- `DeskBookings`: unique `(DeskId, Date, StartTime)`
- `RoomBookings`: unique `(RoomId, Date, StartTime)`
- `MentorshipProfiles`: unique `EmployeeId`
- `RewardPointsAccounts`: unique `EmployeeId`
