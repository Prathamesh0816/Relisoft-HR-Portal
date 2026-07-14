using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public static class WorkforceSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.WorkforceEmployees.AnyAsync())
            return;

        var employees = new List<WorkforceEmployee>
        {
            new() { EmployeeCode = "WF-001", FullName = "Vikram Sharma", Team = "Sales", Role = "Sales Manager", Criticality = "High", BackupAvailable = "No", ExperienceYears = 12, AnnualSalaryUsd = 95000, TenureYears = 8.0, IsActive = true },
            new() { EmployeeCode = "WF-002", FullName = "Priya Patel", Team = "Engineering", Role = "Engineering Lead", Criticality = "High", BackupAvailable = "No", ExperienceYears = 10, AnnualSalaryUsd = 110000, TenureYears = 6.0, IsActive = true },
            new() { EmployeeCode = "WF-003", FullName = "Amit Verma", Team = "Engineering", Role = "Senior Developer", Criticality = "Medium", BackupAvailable = "Yes", ExperienceYears = 7, AnnualSalaryUsd = 85000, TenureYears = 4.0, IsActive = true },
            new() { EmployeeCode = "WF-004", FullName = "Neha Gupta", Team = "HR", Role = "HR Manager", Criticality = "Medium", BackupAvailable = "Yes", ExperienceYears = 9, AnnualSalaryUsd = 72000, TenureYears = 5.0, IsActive = true },
            new() { EmployeeCode = "WF-005", FullName = "Raj Kumar", Team = "DevOps", Role = "DevOps Lead", Criticality = "High", BackupAvailable = "No", ExperienceYears = 8, AnnualSalaryUsd = 98000, TenureYears = 5.0, IsActive = true },
            new() { EmployeeCode = "WF-006", FullName = "Ankit Joshi", Team = "QA", Role = "QA Lead", Criticality = "Medium", BackupAvailable = "Yes", ExperienceYears = 6, AnnualSalaryUsd = 70000, TenureYears = 3.5, IsActive = true },
            new() { EmployeeCode = "WF-007", FullName = "Deepa Iyer", Team = "Product", Role = "Product Manager", Criticality = "High", BackupAvailable = "No", ExperienceYears = 11, AnnualSalaryUsd = 105000, TenureYears = 7.0, IsActive = true },
            new() { EmployeeCode = "WF-008", FullName = "Suresh Reddy", Team = "Design", Role = "Senior Designer", Criticality = "Medium", BackupAvailable = "Yes", ExperienceYears = 8, AnnualSalaryUsd = 78000, TenureYears = 5.0, IsActive = true },
            new() { EmployeeCode = "WF-009", FullName = "Kavita Nair", Team = "Data", Role = "Data Analyst", Criticality = "Low", BackupAvailable = "No", ExperienceYears = 4, AnnualSalaryUsd = 62000, TenureYears = 2.0, IsActive = true },
            new() { EmployeeCode = "WF-010", FullName = "Rohan Desai", Team = "Engineering", Role = "Junior Developer", Criticality = "Low", BackupAvailable = "Yes", ExperienceYears = 2, AnnualSalaryUsd = 55000, TenureYears = 1.0, IsActive = true }
        };

        db.WorkforceEmployees.AddRange(employees);
        await db.SaveChangesAsync();

        var projects = new List<WorkforceProject>
        {
            new() { ProjectCode = "PRJ-001", ProjectName = "Sales Platform", Team = "Sales", Criticality = "High", DeadlineDays = 180, Client = "Client A", AnnualContractValueUsd = 500000, Status = "Active" },
            new() { ProjectCode = "PRJ-002", ProjectName = "Cloud Migration", Team = "Engineering", Criticality = "High", DeadlineDays = 240, Client = "Client B", AnnualContractValueUsd = 800000, Status = "Active" },
            new() { ProjectCode = "PRJ-003", ProjectName = "HR Portal", Team = "Engineering", Criticality = "Medium", DeadlineDays = 120, Client = "Internal", AnnualContractValueUsd = 200000, Status = "Active" },
            new() { ProjectCode = "PRJ-004", ProjectName = "Mobile App", Team = "Design", Criticality = "Medium", DeadlineDays = 180, Client = "Client C", AnnualContractValueUsd = 350000, Status = "Active" },
            new() { ProjectCode = "PRJ-005", ProjectName = "Data Pipeline", Team = "Data", Criticality = "High", DeadlineDays = 150, Client = "Client D", AnnualContractValueUsd = 450000, Status = "Active" }
        };

        db.WorkforceProjects.AddRange(projects);
        await db.SaveChangesAsync();

        var dependencies = new List<WorkforceDependency>
        {
            new() { OwnerId = 1, OwnerName = "Vikram Sharma", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Development", Criticality = "High" },
            new() { OwnerId = 1, OwnerName = "Vikram Sharma", DependentId = 7, DependentName = "Deepa Iyer", DependencyType = "Product Input", Criticality = "Medium" },
            new() { OwnerId = 2, OwnerName = "Priya Patel", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Development", Criticality = "High" },
            new() { OwnerId = 2, OwnerName = "Priya Patel", DependentId = 5, DependentName = "Raj Kumar", DependencyType = "Infrastructure", Criticality = "High" },
            new() { OwnerId = 2, OwnerName = "Priya Patel", DependentId = 10, DependentName = "Rohan Desai", DependencyType = "Mentoring", Criticality = "Low" },
            new() { OwnerId = 2, OwnerName = "Priya Patel", DependentId = 6, DependentName = "Ankit Joshi", DependencyType = "QA Support", Criticality = "Medium" },
            new() { OwnerId = 3, OwnerName = "Amit Verma", DependentId = 10, DependentName = "Rohan Desai", DependencyType = "Mentoring", Criticality = "Low" },
            new() { OwnerId = 3, OwnerName = "Amit Verma", DependentId = 9, DependentName = "Kavita Nair", DependencyType = "Data Integration", Criticality = "Medium" },
            new() { OwnerId = 4, OwnerName = "Neha Gupta", DependentId = 2, DependentName = "Priya Patel", DependencyType = "Engineering Coordination", Criticality = "Medium" },
            new() { OwnerId = 4, OwnerName = "Neha Gupta", DependentId = 1, DependentName = "Vikram Sharma", DependencyType = "Sales Coordination", Criticality = "Low" },
            new() { OwnerId = 5, OwnerName = "Raj Kumar", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Deployment", Criticality = "High" },
            new() { OwnerId = 5, OwnerName = "Raj Kumar", DependentId = 8, DependentName = "Suresh Reddy", DependencyType = "Design Assets", Criticality = "Medium" },
            new() { OwnerId = 5, OwnerName = "Raj Kumar", DependentId = 6, DependentName = "Ankit Joshi", DependencyType = "QA Signoff", Criticality = "Medium" },
            new() { OwnerId = 6, OwnerName = "Ankit Joshi", DependentId = 10, DependentName = "Rohan Desai", DependencyType = "Bug Fixing", Criticality = "Medium" },
            new() { OwnerId = 6, OwnerName = "Ankit Joshi", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Code Review", Criticality = "High" },
            new() { OwnerId = 7, OwnerName = "Deepa Iyer", DependentId = 1, DependentName = "Vikram Sharma", DependencyType = "Market Feedback", Criticality = "Medium" },
            new() { OwnerId = 7, OwnerName = "Deepa Iyer", DependentId = 2, DependentName = "Priya Patel", DependencyType = "Engineering Delivery", Criticality = "High" },
            new() { OwnerId = 7, OwnerName = "Deepa Iyer", DependentId = 8, DependentName = "Suresh Reddy", DependencyType = "Design Execution", Criticality = "Medium" },
            new() { OwnerId = 7, OwnerName = "Deepa Iyer", DependentId = 9, DependentName = "Kavita Nair", DependencyType = "Data Analysis", Criticality = "Medium" },
            new() { OwnerId = 8, OwnerName = "Suresh Reddy", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Implementation", Criticality = "Medium" },
            new() { OwnerId = 8, OwnerName = "Suresh Reddy", DependentId = 7, DependentName = "Deepa Iyer", DependencyType = "Product Direction", Criticality = "Medium" },
            new() { OwnerId = 9, OwnerName = "Kavita Nair", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Data Pipeline", Criticality = "Medium" },
            new() { OwnerId = 9, OwnerName = "Kavita Nair", DependentId = 5, DependentName = "Raj Kumar", DependencyType = "Infrastructure", Criticality = "High" },
            new() { OwnerId = 10, OwnerName = "Rohan Desai", DependentId = 3, DependentName = "Amit Verma", DependencyType = "Guidance", Criticality = "Low" },
            new() { OwnerId = 6, OwnerName = "Ankit Joshi", DependentId = 5, DependentName = "Raj Kumar", DependencyType = "Test Environment", Criticality = "Medium" }
        };

        db.WorkforceDependencies.AddRange(dependencies);
        await db.SaveChangesAsync();

        var knowledge = new List<WorkforceKnowledge>
        {
            new() { EmployeeId = 1, EmployeeName = "Vikram Sharma", KnowledgeArea = "Sales Strategy", DocumentationLevel = "Medium", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 1, EmployeeName = "Vikram Sharma", KnowledgeArea = "CRM Management", DocumentationLevel = "Medium", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 2, EmployeeName = "Priya Patel", KnowledgeArea = "System Architecture", DocumentationLevel = "Low", Proficiency = "Expert", LastUpdated = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 2, EmployeeName = "Priya Patel", KnowledgeArea = "Team Management", DocumentationLevel = "Low", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 3, EmployeeName = "Amit Verma", KnowledgeArea = "Full Stack Development", DocumentationLevel = "Medium", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 3, EmployeeName = "Amit Verma", KnowledgeArea = "Cloud Services", DocumentationLevel = "Medium", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 28, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 4, EmployeeName = "Neha Gupta", KnowledgeArea = "HR Compliance", DocumentationLevel = "High", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 4, EmployeeName = "Neha Gupta", KnowledgeArea = "Recruitment", DocumentationLevel = "High", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 25, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 5, EmployeeName = "Raj Kumar", KnowledgeArea = "CI/CD", DocumentationLevel = "Low", Proficiency = "Expert", LastUpdated = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 5, EmployeeName = "Raj Kumar", KnowledgeArea = "Cloud Infrastructure", DocumentationLevel = "Low", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 5, EmployeeName = "Raj Kumar", KnowledgeArea = "Security", DocumentationLevel = "Low", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 6, EmployeeName = "Ankit Joshi", KnowledgeArea = "Test Automation", DocumentationLevel = "High", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 8, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 6, EmployeeName = "Ankit Joshi", KnowledgeArea = "QA Processes", DocumentationLevel = "Medium", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 18, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 7, EmployeeName = "Deepa Iyer", KnowledgeArea = "Product Strategy", DocumentationLevel = "Medium", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 2, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 7, EmployeeName = "Deepa Iyer", KnowledgeArea = "Market Research", DocumentationLevel = "Low", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 8, EmployeeName = "Suresh Reddy", KnowledgeArea = "UI/UX Design", DocumentationLevel = "High", Proficiency = "Expert", LastUpdated = new DateTime(2026, 3, 12, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 8, EmployeeName = "Suresh Reddy", KnowledgeArea = "Design Systems", DocumentationLevel = "High", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 2, 22, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 9, EmployeeName = "Kavita Nair", KnowledgeArea = "Data Analysis", DocumentationLevel = "Medium", Proficiency = "Advanced", LastUpdated = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 9, EmployeeName = "Kavita Nair", KnowledgeArea = "Reporting", DocumentationLevel = "Medium", Proficiency = "Intermediate", LastUpdated = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 10, EmployeeName = "Rohan Desai", KnowledgeArea = "Web Development", DocumentationLevel = "Low", Proficiency = "Intermediate", LastUpdated = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc) },
            new() { EmployeeId = 10, EmployeeName = "Rohan Desai", KnowledgeArea = "Bug Fixing", DocumentationLevel = "Low", Proficiency = "Intermediate", LastUpdated = new DateTime(2026, 2, 28, 0, 0, 0, DateTimeKind.Utc) }
        };

        db.WorkforceKnowledges.AddRange(knowledge);
        await db.SaveChangesAsync();

        var performances = new List<WorkforcePerformance>
        {
            new() { EmployeeId = 1, EmployeeName = "Vikram Sharma", Team = "Sales", PerformanceRating = "Excellent", GoalsCompleted = 12, GoalsTotal = 15, LastReviewDate = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 8, TenureAtCompany = 8.0 },
            new() { EmployeeId = 2, EmployeeName = "Priya Patel", Team = "Engineering", PerformanceRating = "Excellent", GoalsCompleted = 14, GoalsTotal = 15, LastReviewDate = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 9, TenureAtCompany = 6.0 },
            new() { EmployeeId = 3, EmployeeName = "Amit Verma", Team = "Engineering", PerformanceRating = "Good", GoalsCompleted = 10, GoalsTotal = 12, LastReviewDate = new DateTime(2026, 2, 28, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 7, TenureAtCompany = 4.0 },
            new() { EmployeeId = 4, EmployeeName = "Neha Gupta", Team = "HR", PerformanceRating = "Excellent", GoalsCompleted = 13, GoalsTotal = 14, LastReviewDate = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 8, TenureAtCompany = 5.0 },
            new() { EmployeeId = 5, EmployeeName = "Raj Kumar", Team = "DevOps", PerformanceRating = "Good", GoalsCompleted = 9, GoalsTotal = 12, LastReviewDate = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 6, TenureAtCompany = 5.0 },
            new() { EmployeeId = 6, EmployeeName = "Ankit Joshi", Team = "QA", PerformanceRating = "Good", GoalsCompleted = 11, GoalsTotal = 13, LastReviewDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 7, TenureAtCompany = 3.5 },
            new() { EmployeeId = 7, EmployeeName = "Deepa Iyer", Team = "Product", PerformanceRating = "Excellent", GoalsCompleted = 14, GoalsTotal = 15, LastReviewDate = new DateTime(2026, 3, 12, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 9, TenureAtCompany = 7.0 },
            new() { EmployeeId = 8, EmployeeName = "Suresh Reddy", Team = "Design", PerformanceRating = "Good", GoalsCompleted = 10, GoalsTotal = 12, LastReviewDate = new DateTime(2026, 2, 25, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 7, TenureAtCompany = 5.0 },
            new() { EmployeeId = 9, EmployeeName = "Kavita Nair", Team = "Data", PerformanceRating = "Satisfactory", GoalsCompleted = 8, GoalsTotal = 12, LastReviewDate = new DateTime(2026, 1, 30, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 5, TenureAtCompany = 2.0 },
            new() { EmployeeId = 10, EmployeeName = "Rohan Desai", Team = "Engineering", PerformanceRating = "Satisfactory", GoalsCompleted = 7, GoalsTotal = 10, LastReviewDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc), EngagementScore = 6, TenureAtCompany = 1.0 }
        };

        db.WorkforcePerformances.AddRange(performances);
        await db.SaveChangesAsync();

        var workloads = new List<WorkforceWorkload>
        {
            new() { EmployeeId = 1, EmployeeName = "Vikram Sharma", Team = "Sales", WeeklyHours = 45, TaskDifficulty = "High", ActiveProjects = 3, OverdueTasks = 2, PtoPlannedDays = 5, LastPtoDays = 3 },
            new() { EmployeeId = 2, EmployeeName = "Priya Patel", Team = "Engineering", WeeklyHours = 50, TaskDifficulty = "High", ActiveProjects = 4, OverdueTasks = 3, PtoPlannedDays = 3, LastPtoDays = 5 },
            new() { EmployeeId = 3, EmployeeName = "Amit Verma", Team = "Engineering", WeeklyHours = 40, TaskDifficulty = "Medium", ActiveProjects = 3, OverdueTasks = 1, PtoPlannedDays = 8, LastPtoDays = 4 },
            new() { EmployeeId = 4, EmployeeName = "Neha Gupta", Team = "HR", WeeklyHours = 38, TaskDifficulty = "Medium", ActiveProjects = 2, OverdueTasks = 1, PtoPlannedDays = 10, LastPtoDays = 6 },
            new() { EmployeeId = 5, EmployeeName = "Raj Kumar", Team = "DevOps", WeeklyHours = 48, TaskDifficulty = "High", ActiveProjects = 3, OverdueTasks = 4, PtoPlannedDays = 0, LastPtoDays = 2 },
            new() { EmployeeId = 6, EmployeeName = "Ankit Joshi", Team = "QA", WeeklyHours = 40, TaskDifficulty = "Medium", ActiveProjects = 2, OverdueTasks = 2, PtoPlannedDays = 7, LastPtoDays = 5 },
            new() { EmployeeId = 7, EmployeeName = "Deepa Iyer", Team = "Product", WeeklyHours = 45, TaskDifficulty = "High", ActiveProjects = 4, OverdueTasks = 3, PtoPlannedDays = 4, LastPtoDays = 3 },
            new() { EmployeeId = 8, EmployeeName = "Suresh Reddy", Team = "Design", WeeklyHours = 38, TaskDifficulty = "Medium", ActiveProjects = 2, OverdueTasks = 1, PtoPlannedDays = 9, LastPtoDays = 6 },
            new() { EmployeeId = 9, EmployeeName = "Kavita Nair", Team = "Data", WeeklyHours = 35, TaskDifficulty = "Low", ActiveProjects = 2, OverdueTasks = 1, PtoPlannedDays = 6, LastPtoDays = 4 },
            new() { EmployeeId = 10, EmployeeName = "Rohan Desai", Team = "Engineering", WeeklyHours = 40, TaskDifficulty = "Medium", ActiveProjects = 2, OverdueTasks = 2, PtoPlannedDays = 5, LastPtoDays = 3 }
        };

        db.WorkforceWorkloads.AddRange(workloads);
        await db.SaveChangesAsync();
    }
}
