using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RelisoftHR.Migrations
{
    /// <inheritdoc />
    public partial class EnforceDomainIntegrity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF EXISTS (
                    SELECT 1
                    FROM [EmployeeOnboardingDocuments] d
                    WHERE d.[ExperienceId] IS NOT NULL
                      AND NOT EXISTS (
                          SELECT 1
                          FROM [EmployeeOnboardingExperiences] e
                          WHERE e.[Id] = d.[ExperienceId]
                            AND e.[OnboardingProfileId] = d.[OnboardingProfileId]))
                    THROW 51000, 'Onboarding documents contain an experience from another profile. Correct those rows before applying this migration.', 1;

                IF EXISTS (
                    SELECT 1
                    FROM [SurveyResponses] r
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM [SurveyQuestions] q
                        WHERE q.[Id] = r.[QuestionId]
                          AND q.[SurveyId] = r.[SurveyId]))
                    THROW 51000, 'Survey responses contain a question from another survey. Correct those rows before applying this migration.', 1;

                IF EXISTS (
                    SELECT 1
                    FROM [EmployeeOnboardingProfiles]
                    GROUP BY [EmployeeId]
                    HAVING COUNT(*) > 1)
                    THROW 51000, 'An employee has multiple onboarding profiles. Merge those profiles before applying this migration.', 1;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeOnboardingSteps_OnboardingChecklistItems_ChecklistItemId",
                table: "EmployeeOnboardingSteps");

            migrationBuilder.DropForeignKey(
                name: "FK_SurveyResponses_SurveyQuestions_QuestionId",
                table: "SurveyResponses");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRegistrations_CourseId",
                table: "TrainingRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_TimesheetPeriods_EmployeeId",
                table: "TimesheetPeriods");

            migrationBuilder.DropIndex(
                name: "IX_Teams_ProjectId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_SurveyResponses_QuestionId",
                table: "SurveyResponses");

            migrationBuilder.DropIndex(
                name: "IX_SurveyResponses_SurveyId",
                table: "SurveyResponses");

            migrationBuilder.DropIndex(
                name: "IX_SurveyQuestions_SurveyId",
                table: "SurveyQuestions");

            migrationBuilder.DropIndex(
                name: "IX_MentorshipMatches_MentorId",
                table: "MentorshipMatches");

            migrationBuilder.DropIndex(
                name: "IX_LoanRepayments_LoanId",
                table: "LoanRepayments");

            migrationBuilder.DropIndex(
                name: "IX_InternalJobApplications_JobPostingId",
                table: "InternalJobApplications");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingSteps_OnboardingId",
                table: "EmployeeOnboardingSteps");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingProfiles_EmployeeId",
                table: "EmployeeOnboardingProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingExperiences_OnboardingProfileId",
                table: "EmployeeOnboardingExperiences");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingDocuments_OnboardingProfileId",
                table: "EmployeeOnboardingDocuments");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeAssets_AssetId",
                table: "EmployeeAssets");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeAppraisals_EmployeeId",
                table: "EmployeeAppraisals");

            migrationBuilder.DropIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes");

            migrationBuilder.DropIndex(
                name: "IX_BenefitEnrollments_EmployeeId",
                table: "BenefitEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EmployeeId",
                table: "AttendanceRecords");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_SurveyQuestions_SurveyId_Id",
                table: "SurveyQuestions",
                columns: new[] { "SurveyId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_EmployeeOnboardingExperiences_OnboardingProfileId_Id",
                table: "EmployeeOnboardingExperiences",
                columns: new[] { "OnboardingProfileId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_CourseId_EmployeeId",
                table: "TrainingRegistrations",
                columns: new[] { "CourseId", "EmployeeId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TrainingCourses_DateRange",
                table: "TrainingCourses",
                sql: "[EndDate] IS NULL OR [EndDate] >= [StartDate]");

            migrationBuilder.CreateIndex(
                name: "IX_TimesheetPeriods_EmployeeId_WeekStart",
                table: "TimesheetPeriods",
                columns: new[] { "EmployeeId", "WeekStart" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TimesheetPeriods_DateRange",
                table: "TimesheetPeriods",
                sql: "[WeekEnd] >= [WeekStart]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_TimesheetEntries_Hours",
                table: "TimesheetEntries",
                sql: "[Hours] > 0 AND [Hours] <= 24");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_ProjectId_Name",
                table: "Teams",
                columns: new[] { "ProjectId", "Name" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Surveys_DateRange",
                table: "Surveys",
                sql: "[EndDate] >= [StartDate]");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyId_QuestionId_EmployeeId",
                table: "SurveyResponses",
                columns: new[] { "SurveyId", "QuestionId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShiftTemplates_Name",
                table: "ShiftTemplates",
                column: "Name",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ShiftSwaps_DifferentEmployees",
                table: "ShiftSwaps",
                sql: "[RequestedById] <> [TargetEmployeeId]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ShiftAssignments_DateRange",
                table: "ShiftAssignments",
                sql: "[EndDate] IS NULL OR [EndDate] >= [StartDate]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SalaryStructures_NonNegative",
                table: "SalaryStructures",
                sql: "[FixedPay] >= 0 AND [VariablePay] >= 0 AND [PF] >= 0 AND [Gratuity] >= 0 AND [Insurance] >= 0 AND [OtherDeductions] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_RoomBookings_TimeRange",
                table: "RoomBookings",
                sql: "[EndTime] > [StartTime]");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Name",
                table: "Projects",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationRoles_Name",
                table: "OrganizationRoles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingChecklistItems_Name",
                table: "OnboardingChecklistItems",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_EventType",
                table: "NotificationTemplates",
                column: "EventType",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_MoodEntries_Score",
                table: "MoodEntries",
                sql: "[Score] BETWEEN 1 AND 5");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipMatches_MentorId_MenteeId",
                table: "MentorshipMatches",
                columns: new[] { "MentorId", "MenteeId" },
                unique: true,
                filter: "[Status] IN ('Pending', 'Active')");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingRooms_Building_Floor_Name",
                table: "MeetingRooms",
                columns: new[] { "Building", "Floor", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanTypes_Name",
                table: "LoanTypes",
                column: "Name",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_LoanTypes_Amounts",
                table: "LoanTypes",
                sql: "[MinAmount] >= 0 AND [MaxAmount] >= [MinAmount] AND [InterestRate] >= 0 AND [MaxInstallments] > 0");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepayments_LoanId_InstallmentNumber",
                table: "LoanRepayments",
                columns: new[] { "LoanId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTypes_Name",
                table: "LeaveTypes",
                column: "Name",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_LeaveApplications_DateRange",
                table: "LeaveApplications",
                sql: "[ToDate] >= [FromDate]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LeaveApplications_TotalDays",
                table: "LeaveApplications",
                sql: "[TotalDays] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_InternalJobPostings_DateRange",
                table: "InternalJobPostings",
                sql: "[ClosingDate] >= [PostingDate]");

            migrationBuilder.CreateIndex(
                name: "IX_InternalJobApplications_JobPostingId_EmployeeId",
                table: "InternalJobApplications",
                columns: new[] { "JobPostingId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseCategories_Name",
                table: "ExpenseCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingSteps_OnboardingId_ChecklistItemId",
                table: "EmployeeOnboardingSteps",
                columns: new[] { "OnboardingId", "ChecklistItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingProfiles_EmployeeId",
                table: "EmployeeOnboardingProfiles",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingDocuments_OnboardingProfileId_ExperienceId",
                table: "EmployeeOnboardingDocuments",
                columns: new[] { "OnboardingProfileId", "ExperienceId" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_EmployeeLoans_Amounts",
                table: "EmployeeLoans",
                sql: "[Amount] > 0 AND [Installments] > 0 AND [InterestRate] >= 0 AND [EmiAmount] >= 0 AND [OutstandingBalance] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_EmployeeLeaveBalances_NonNegative",
                table: "EmployeeLeaveBalances",
                sql: "[AllocatedLeaves] >= 0 AND [UsedLeaves] >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssets_AssetId",
                table: "EmployeeAssets",
                column: "AssetId",
                unique: true,
                filter: "[ReturnedOn] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisals_EmployeeId_CycleId",
                table: "EmployeeAppraisals",
                columns: new[] { "EmployeeId", "CycleId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_EmployeeAppraisals_Ratings",
                table: "EmployeeAppraisals",
                sql: "([SelfRating] IS NULL OR [SelfRating] BETWEEN 1 AND 5) AND ([ManagerRating] IS NULL OR [ManagerRating] BETWEEN 1 AND 5) AND ([FinalRating] IS NULL OR [FinalRating] BETWEEN 1 AND 5)");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_Name",
                table: "DocumentTemplates",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Desks_Building_Floor_Name",
                table: "Desks",
                columns: new[] { "Building", "Floor", "Name" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_DeskBookings_TimeRange",
                table: "DeskBookings",
                sql: "[EndTime] > [StartTime]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Contractors_DateRange",
                table: "Contractors",
                sql: "[ContractEnd] >= [ContractStart]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CompOffTransfers_Days",
                table: "CompOffTransfers",
                sql: "[Days] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CompOffTransfers_DifferentEmployees",
                table: "CompOffTransfers",
                sql: "[FromEmployeeId] <> [ToEmployeeId]");

            migrationBuilder.CreateIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes",
                column: "EmployeeId",
                unique: true,
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_BenefitPlans_Name",
                table: "BenefitPlans",
                column: "Name",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_BenefitPlans_NonNegativeCosts",
                table: "BenefitPlans",
                sql: "[EmployeeCost] >= 0 AND [EmployerCost] >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_BenefitEnrollments_EmployeeId_BenefitPlanId",
                table: "BenefitEnrollments",
                columns: new[] { "EmployeeId", "BenefitPlanId" },
                unique: true,
                filter: "[Status] = 'Active'");

            migrationBuilder.AddCheckConstraint(
                name: "CK_BenefitEnrollments_DateRange",
                table: "BenefitEnrollments",
                sql: "[TerminationDate] IS NULL OR [TerminationDate] >= [EnrollmentDate]");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId_Date",
                table: "AttendanceRecords",
                columns: new[] { "EmployeeId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssetTag",
                table: "Assets",
                column: "AssetTag",
                unique: true,
                filter: "[AssetTag] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_SerialNumber",
                table: "Assets",
                column: "SerialNumber",
                unique: true,
                filter: "[SerialNumber] IS NOT NULL AND [SerialNumber] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_AppraisalCycles_Name",
                table: "AppraisalCycles",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeOnboardingDocuments_EmployeeOnboardingExperiences_OnboardingProfileId_ExperienceId",
                table: "EmployeeOnboardingDocuments",
                columns: new[] { "OnboardingProfileId", "ExperienceId" },
                principalTable: "EmployeeOnboardingExperiences",
                principalColumns: new[] { "OnboardingProfileId", "Id" });

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeOnboardingSteps_OnboardingChecklistItems_ChecklistItemId",
                table: "EmployeeOnboardingSteps",
                column: "ChecklistItemId",
                principalTable: "OnboardingChecklistItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyResponses_SurveyQuestions_SurveyId_QuestionId",
                table: "SurveyResponses",
                columns: new[] { "SurveyId", "QuestionId" },
                principalTable: "SurveyQuestions",
                principalColumns: new[] { "SurveyId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeOnboardingDocuments_EmployeeOnboardingExperiences_OnboardingProfileId_ExperienceId",
                table: "EmployeeOnboardingDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeOnboardingSteps_OnboardingChecklistItems_ChecklistItemId",
                table: "EmployeeOnboardingSteps");

            migrationBuilder.DropForeignKey(
                name: "FK_SurveyResponses_SurveyQuestions_SurveyId_QuestionId",
                table: "SurveyResponses");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRegistrations_CourseId_EmployeeId",
                table: "TrainingRegistrations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_TrainingCourses_DateRange",
                table: "TrainingCourses");

            migrationBuilder.DropIndex(
                name: "IX_TimesheetPeriods_EmployeeId_WeekStart",
                table: "TimesheetPeriods");

            migrationBuilder.DropCheckConstraint(
                name: "CK_TimesheetPeriods_DateRange",
                table: "TimesheetPeriods");

            migrationBuilder.DropCheckConstraint(
                name: "CK_TimesheetEntries_Hours",
                table: "TimesheetEntries");

            migrationBuilder.DropIndex(
                name: "IX_Teams_ProjectId_Name",
                table: "Teams");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Surveys_DateRange",
                table: "Surveys");

            migrationBuilder.DropIndex(
                name: "IX_SurveyResponses_SurveyId_QuestionId_EmployeeId",
                table: "SurveyResponses");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_SurveyQuestions_SurveyId_Id",
                table: "SurveyQuestions");

            migrationBuilder.DropIndex(
                name: "IX_ShiftTemplates_Name",
                table: "ShiftTemplates");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ShiftSwaps_DifferentEmployees",
                table: "ShiftSwaps");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ShiftAssignments_DateRange",
                table: "ShiftAssignments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SalaryStructures_NonNegative",
                table: "SalaryStructures");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RoomBookings_TimeRange",
                table: "RoomBookings");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Name",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_OrganizationRoles_Name",
                table: "OrganizationRoles");

            migrationBuilder.DropIndex(
                name: "IX_OnboardingChecklistItems_Name",
                table: "OnboardingChecklistItems");

            migrationBuilder.DropIndex(
                name: "IX_NotificationTemplates_EventType",
                table: "NotificationTemplates");

            migrationBuilder.DropCheckConstraint(
                name: "CK_MoodEntries_Score",
                table: "MoodEntries");

            migrationBuilder.DropIndex(
                name: "IX_MentorshipMatches_MentorId_MenteeId",
                table: "MentorshipMatches");

            migrationBuilder.DropIndex(
                name: "IX_MeetingRooms_Building_Floor_Name",
                table: "MeetingRooms");

            migrationBuilder.DropIndex(
                name: "IX_LoanTypes_Name",
                table: "LoanTypes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LoanTypes_Amounts",
                table: "LoanTypes");

            migrationBuilder.DropIndex(
                name: "IX_LoanRepayments_LoanId_InstallmentNumber",
                table: "LoanRepayments");

            migrationBuilder.DropIndex(
                name: "IX_LeaveTypes_Name",
                table: "LeaveTypes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LeaveApplications_DateRange",
                table: "LeaveApplications");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LeaveApplications_TotalDays",
                table: "LeaveApplications");

            migrationBuilder.DropCheckConstraint(
                name: "CK_InternalJobPostings_DateRange",
                table: "InternalJobPostings");

            migrationBuilder.DropIndex(
                name: "IX_InternalJobApplications_JobPostingId_EmployeeId",
                table: "InternalJobApplications");

            migrationBuilder.DropIndex(
                name: "IX_ExpenseCategories_Name",
                table: "ExpenseCategories");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingSteps_OnboardingId_ChecklistItemId",
                table: "EmployeeOnboardingSteps");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingProfiles_EmployeeId",
                table: "EmployeeOnboardingProfiles");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_EmployeeOnboardingExperiences_OnboardingProfileId_Id",
                table: "EmployeeOnboardingExperiences");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeOnboardingDocuments_OnboardingProfileId_ExperienceId",
                table: "EmployeeOnboardingDocuments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_EmployeeLoans_Amounts",
                table: "EmployeeLoans");

            migrationBuilder.DropCheckConstraint(
                name: "CK_EmployeeLeaveBalances_NonNegative",
                table: "EmployeeLeaveBalances");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeAssets_AssetId",
                table: "EmployeeAssets");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeAppraisals_EmployeeId_CycleId",
                table: "EmployeeAppraisals");

            migrationBuilder.DropCheckConstraint(
                name: "CK_EmployeeAppraisals_Ratings",
                table: "EmployeeAppraisals");

            migrationBuilder.DropIndex(
                name: "IX_DocumentTemplates_Name",
                table: "DocumentTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Desks_Building_Floor_Name",
                table: "Desks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_DeskBookings_TimeRange",
                table: "DeskBookings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Contractors_DateRange",
                table: "Contractors");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CompOffTransfers_Days",
                table: "CompOffTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CompOffTransfers_DifferentEmployees",
                table: "CompOffTransfers");

            migrationBuilder.DropIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes");

            migrationBuilder.DropIndex(
                name: "IX_BenefitPlans_Name",
                table: "BenefitPlans");

            migrationBuilder.DropCheckConstraint(
                name: "CK_BenefitPlans_NonNegativeCosts",
                table: "BenefitPlans");

            migrationBuilder.DropIndex(
                name: "IX_BenefitEnrollments_EmployeeId_BenefitPlanId",
                table: "BenefitEnrollments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_BenefitEnrollments_DateRange",
                table: "BenefitEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EmployeeId_Date",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_Assets_AssetTag",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_SerialNumber",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_AppraisalCycles_Name",
                table: "AppraisalCycles");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_CourseId",
                table: "TrainingRegistrations",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_TimesheetPeriods_EmployeeId",
                table: "TimesheetPeriods",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_ProjectId",
                table: "Teams",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_QuestionId",
                table: "SurveyResponses",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyId",
                table: "SurveyResponses",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyQuestions_SurveyId",
                table: "SurveyQuestions",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipMatches_MentorId",
                table: "MentorshipMatches",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepayments_LoanId",
                table: "LoanRepayments",
                column: "LoanId");

            migrationBuilder.CreateIndex(
                name: "IX_InternalJobApplications_JobPostingId",
                table: "InternalJobApplications",
                column: "JobPostingId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingSteps_OnboardingId",
                table: "EmployeeOnboardingSteps",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingProfiles_EmployeeId",
                table: "EmployeeOnboardingProfiles",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingExperiences_OnboardingProfileId",
                table: "EmployeeOnboardingExperiences",
                column: "OnboardingProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeOnboardingDocuments_OnboardingProfileId",
                table: "EmployeeOnboardingDocuments",
                column: "OnboardingProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssets_AssetId",
                table: "EmployeeAssets",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAppraisals_EmployeeId",
                table: "EmployeeAppraisals",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_CommuteRoutes_EmployeeId",
                table: "CommuteRoutes",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_BenefitEnrollments_EmployeeId",
                table: "BenefitEnrollments",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId",
                table: "AttendanceRecords",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeOnboardingSteps_OnboardingChecklistItems_ChecklistItemId",
                table: "EmployeeOnboardingSteps",
                column: "ChecklistItemId",
                principalTable: "OnboardingChecklistItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyResponses_SurveyQuestions_QuestionId",
                table: "SurveyResponses",
                column: "QuestionId",
                principalTable: "SurveyQuestions",
                principalColumn: "Id");
        }
    }
}
