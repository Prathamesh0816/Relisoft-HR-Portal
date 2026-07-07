import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import LeaveBalance from '../models/LeaveBalance.js';
import LeaveType from '../models/LeaveType.js';
import OrganizationRole from '../models/OrganizationRole.js';
import HrPolicy from '../models/HrPolicy.js';
import SocialPost from '../models/SocialPost.js';
import Survey from '../models/Survey.js';
import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';
import Payslip from '../models/Payslip.js';
import Training from '../models/Training.js';
import Performance from '../models/Performance.js';
import Ticket from '../models/Ticket.js';
import ITAsset from '../models/ITAsset.js';
import TravelRequest from '../models/TravelRequest.js';
import Document from '../models/Document.js';
import Policy from '../models/Policy.js';
import Notification from '../models/Notification.js';
import BenefitPlan from '../models/BenefitPlan.js';
import Asset from '../models/Asset.js';
import Contractor from '../models/Contractor.js';
import Visitor from '../models/Visitor.js';
import GatePass from '../models/GatePass.js';
import InternalJobPosting from '../models/InternalJobPosting.js';
import ServiceCatalog from '../models/ServiceCatalog.js';
import ServiceCategory from '../models/ServiceCategory.js';

const ROLES = { SUPERADMIN: 1, ADMIN: 2, HR: 3, MANAGER: 4, TEAM_LEAD: 5, EMPLOYEE: 6, FINANCE: 7, IT: 8 };

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/relisoft-hr');
  console.log('Connected to MongoDB');

  // Clean all demo data
  const collections = [
    User, Employee, Leave, LeaveBalance, SocialPost, Survey, Attendance, Holiday,
    Job, Applicant, Payslip, Training, Performance, Ticket, ITAsset, TravelRequest,
    Document, Policy, Notification, BenefitPlan, Asset, Contractor, Visitor, GatePass,
    InternalJobPosting, ServiceCatalog, ServiceCategory,
  ];
  for (const C of collections) {
    try { await C.deleteMany({}); } catch {}
  }
  console.log('Cleaned all existing data');

  // --- SCHEMA RECORDS ---

  const orgRoles = await OrganizationRole.find();
  if (orgRoles.length === 0) {
    await OrganizationRole.insertMany([
      { name: 'Super Admin', label: 'Super Admin', baseRole: 'superadmin', roleValue: ROLES.SUPERADMIN, description: 'Full system access', canApprove: true, isHrRole: true, isManagerRole: true },
      { name: 'Admin', label: 'Admin', baseRole: 'admin', roleValue: ROLES.ADMIN, description: 'Administrative access', canApprove: true, isHrRole: true, isManagerRole: true },
      { name: 'HR Manager', label: 'HR Manager', baseRole: 'hr', roleValue: ROLES.HR, description: 'HR operations', canApprove: true, isHrRole: true, isManagerRole: true },
      { name: 'Manager', label: 'Manager', baseRole: 'manager', roleValue: ROLES.MANAGER, description: 'Team management', canApprove: true, isManagerRole: true },
      { name: 'Team Lead', label: 'Team Lead', baseRole: 'employee', roleValue: ROLES.TEAM_LEAD, description: 'Team lead', canApprove: false },
      { name: 'Employee', label: 'Employee', baseRole: 'employee', roleValue: ROLES.EMPLOYEE, description: 'Regular employee' },
      { name: 'Finance', label: 'Finance', baseRole: 'finance', roleValue: ROLES.FINANCE, description: 'Finance access' },
      { name: 'IT Support', label: 'IT Support', baseRole: 'it', roleValue: ROLES.IT, description: 'IT support access' },
    ]);
  }

  const leaveTypes = await LeaveType.find();
  if (leaveTypes.length === 0) {
    await LeaveType.insertMany([
      { name: 'Sick/Casual Leave', code: 'SL', defaultAllocation: 7, requiresAdvanceNotice: false, isAccrued: false, isCompOff: false, isFloater: false, requiresDocumentation: false, carryForward: false, color: '#6366f1' },
      { name: 'Planned Leave', code: 'PL', defaultAllocation: 12, requiresAdvanceNotice: true, advanceNoticeDays: 3, isAccrued: true, accrualPerMonth: 1, isCompOff: false, isFloater: false, requiresDocumentation: false, carryForward: true, color: '#f59e0b' },
      { name: 'Compensatory Off', code: 'CO', defaultAllocation: 0, requiresAdvanceNotice: false, isAccrued: false, isCompOff: true, isFloater: false, requiresDocumentation: true, carryForward: false, color: '#10b981' },
      { name: 'Floater Holiday', code: 'FH', defaultAllocation: 2, requiresAdvanceNotice: false, isAccrued: false, isCompOff: false, isFloater: true, requiresDocumentation: false, carryForward: false, color: '#8b5cf6' },
      { name: 'Maternity Leave', code: 'ML', defaultAllocation: 60, requiresAdvanceNotice: true, advanceNoticeDays: 30, isAccrued: false, isCompOff: false, isFloater: false, requiresDocumentation: true, carryForward: false, color: '#ec4899' },
      { name: 'Paternity Leave', code: 'PAT', defaultAllocation: 5, requiresAdvanceNotice: true, advanceNoticeDays: 15, isAccrued: false, isCompOff: false, isFloater: false, requiresDocumentation: true, carryForward: false, color: '#06b6d4' },
      { name: 'Unpaid Leave', code: 'LOP', defaultAllocation: 0, requiresAdvanceNotice: false, isAccrued: false, isCompOff: false, isFloater: false, requiresDocumentation: false, carryForward: false, color: '#ef4444' },
    ]);
  }

  const hrPolicy = await HrPolicy.findOne();
  if (!hrPolicy) {
    await HrPolicy.create({ allowHalfDayLeave: true, enableCompOff: true, enableFloaterHoliday: true, maxFloaterPerYear: 2, compOffValidityDays: 30 });
  }

  const lt = await LeaveType.find();

  // --- USERS & EMPLOYEES ---
  const defaultPassword = 'Temp@123';

  const employeesData = [
    { name: 'Priya Sharma', email: 'priya.sharma@relisofttechnologies.com', role: 'hr', roleValue: ROLES.HR, phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer', employeeId: 'EMP001', joinDate: '2024-01-15', address: 'Mumbai', salary: 1800000 },
    { name: 'Arun Kumar', email: 'arun.kumar@relisofttechnologies.com', role: 'finance', roleValue: ROLES.FINANCE, phone: '+91 98765 43211', department: 'Finance', designation: 'Accountant', employeeId: 'EMP002', joinDate: '2024-02-01', address: 'Pune', salary: 1200000 },
    { name: 'Neha Patel', email: 'neha.patel@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43212', department: 'Marketing', designation: 'Marketing Lead', employeeId: 'EMP003', joinDate: '2024-03-10', address: 'Mumbai', salary: 1500000 },
    { name: 'Rahul Verma', email: 'rahul.verma@relisofttechnologies.com', role: 'manager', roleValue: ROLES.MANAGER, phone: '+91 98765 43213', department: 'Engineering', designation: 'Product Manager', employeeId: 'EMP004', joinDate: '2024-01-20', address: 'Delhi', salary: 2200000 },
    { name: 'Sneha Gupta', email: 'sneha.gupta@relisofttechnologies.com', role: 'hr', roleValue: ROLES.HR, phone: '+91 98765 43214', department: 'HR', designation: 'HR Executive', employeeId: 'EMP005', joinDate: '2024-04-01', address: 'Bangalore', salary: 1100000 },
    { name: 'Vikram Joshi', email: 'vikram.joshi@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43215', department: 'Engineering', designation: 'DevOps Engineer', employeeId: 'EMP006', joinDate: '2024-05-15', address: 'Pune', salary: 1600000 },
    { name: 'Ananya Reddy', email: 'ananya.reddy@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43216', department: 'Design', designation: 'UI/UX Designer', employeeId: 'EMP007', joinDate: '2024-06-01', address: 'Hyderabad', salary: 1300000 },
    { name: 'Karthik Nair', email: 'karthik.nair@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43217', department: 'Operations', designation: 'Operations Manager', employeeId: 'EMP008', joinDate: '2024-02-15', address: 'Mumbai', salary: 1700000 },
    { name: 'Divya Singh', email: 'divya.singh@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43218', department: 'Sales', designation: 'Sales Executive', employeeId: 'EMP009', joinDate: '2024-07-01', address: 'Delhi', salary: 1400000 },
    { name: 'Rohan Desai', email: 'rohan.desai@relisofttechnologies.com', role: 'employee', roleValue: ROLES.EMPLOYEE, phone: '+91 98765 43219', department: 'Engineering', designation: 'Junior Developer', employeeId: 'EMP010', joinDate: '2025-01-10', address: 'Mumbai', salary: 800000 },
    { name: 'Admin User', email: 'admin@relisofttechnologies.com', role: 'admin', roleValue: ROLES.ADMIN, phone: '+91 98765 43200', department: 'IT', designation: 'System Admin', employeeId: 'EMP000', joinDate: '2023-06-01', address: 'Mumbai', salary: 2500000 },
  ];

  const createdUsers = [];
  for (const emp of employeesData) {
    const user = await User.create({
      name: emp.name, email: emp.email, username: emp.email.split('@')[0],
      password: defaultPassword, role: emp.role, roleValue: emp.roleValue, isActive: true,
    });
    const employee = await Employee.create({
      userId: user._id, firstName: emp.name.split(' ')[0], lastName: emp.name.split(' ').slice(1).join(' '),
      email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation,
      employeeId: emp.employeeId, dateOfJoining: new Date(emp.joinDate), address: emp.address,
      isActive: true, role: emp.role, roleValue: emp.roleValue, salary: emp.salary,
      employeeCode: `EMP${String(emp.employeeId).slice(-5)}`,
    });
    createdUsers.push({ user, employee, data: emp });
  }
  console.log(`Created ${createdUsers.length} users/employees`);

  // --- LEAVE BALANCES ---
  for (const cu of createdUsers) {
    for (const leaveType of await LeaveType.find()) {
      if (leaveType.isCompOff) continue;
      const allocated = leaveType.isFloater ? 2 : (leaveType.defaultAllocation || 0);
      const used = leaveType.name === 'Sick/Casual Leave' ? Math.floor(Math.random() * 3) + 1 : (leaveType.isFloater ? 0 : Math.floor(Math.random() * 2));
      await LeaveBalance.create({ employee: cu.employee._id, leaveType: leaveType._id, allocatedLeaves: allocated, usedLeaves: used, financialYear: '2026-2027' });
    }
  }
  console.log('Created leave balances');

  // --- LEAVE REQUESTS ---
  const now = new Date();
  const leaveRequests = [
    { ei: 0, ti: 0, start: '2026-07-10', end: '2026-07-11', status: 'Approved', reason: 'Fever and body ache', halfDay: false },
    { ei: 2, ti: 1, start: '2026-07-20', end: '2026-07-22', status: 'Pending', reason: 'Family function', halfDay: false },
    { ei: 5, ti: 2, start: '2026-07-05', end: '2026-07-05', status: 'Pending', reason: 'Worked on Sunday for production release', halfDay: false },
    { ei: 0, ti: 0, start: '2026-06-25', end: '2026-06-25', status: 'Rejected', reason: 'Doctor appointment', halfDay: true },
    { ei: 2, ti: 3, start: '2026-08-15', end: '2026-08-15', status: 'Approved', reason: 'Independence Day', halfDay: false },
    { ei: 3, ti: 1, start: '2026-07-18', end: '2026-07-19', status: 'Pending', reason: 'Sister wedding', halfDay: false },
    { ei: 6, ti: 0, start: '2026-07-14', end: '2026-07-14', status: 'Pending', reason: 'Not feeling well', halfDay: true },
    { ei: 5, ti: 2, start: '2026-07-12', end: '2026-07-12', status: 'Pending', reason: 'Worked on holiday', halfDay: false },
  ];
  const allLt = await LeaveType.find();
  for (const lr of leaveRequests) {
    const emp = createdUsers[lr.ei];
    const from = new Date(lr.start);
    const to = new Date(lr.end);
    const diff = Math.round((to - from) / 86400000) + 1;
    await Leave.create({
      employee: emp.employee._id, leaveType: allLt[lr.ti]._id, fromDate: from, toDate: to, totalDays: diff,
      status: lr.status, reason: lr.reason, isHalfDay: lr.halfDay, isCompOff: false, isLop: false, isFloater: false, appliedOn: new Date(),
    });
  }
  console.log('Created leave requests');

  // --- ATTENDANCE ---
  const statuses = ['present', 'present', 'late', 'present', 'present', 'half-day', 'present', 'ot', 'present', 'absent'];
  for (let d = 0; d < 5; d++) {
    const date = new Date(now.getTime() - d * 86400000);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    for (let e = 0; e < createdUsers.length; e++) {
      const emp = createdUsers[e];
      const s = statuses[e % statuses.length];
      await Attendance.create({
        employee: emp.employee._id, date, status: s,
        checkIn: s === 'present' || s === 'late' || s === 'half-day' ? (s === 'late' ? '10:30 AM' : s === 'half-day' ? '09:30 AM' : '09:15 AM') : null,
        checkOut: s === 'present' ? '06:00 PM' : s === 'late' ? '07:00 PM' : s === 'half-day' ? '01:00 PM' : null,
      });
    }
  }
  console.log('Created attendance records');

  // --- HOLIDAYS ---
  const holidays = [
    { date: '2026-01-01', name: "New Year's Day", type: 'national' },
    { date: '2026-01-26', name: 'Republic Day', type: 'national' },
    { date: '2026-03-25', name: 'Holi', type: 'festival' },
    { date: '2026-08-15', name: 'Independence Day', type: 'national' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2026-10-22', name: 'Diwali', type: 'festival' },
    { date: '2026-12-25', name: 'Christmas', type: 'festival' },
    { date: '2026-08-19', name: 'Raksha Bandhan', type: 'optional' },
    { date: '2026-09-07', name: 'Ganesh Chaturthi', type: 'optional' },
  ];
  for (const h of holidays) {
    await Holiday.create({ ...h, day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' }), location: ['All'] });
  }
  console.log('Created holidays');

  // --- SOCIAL POSTS ---
  const socialPosts = [
    { ei: 0, content: '🎉 Q3 Town Hall is TODAY at 3 PM in the main conference room! Agenda: quarterly results, product launch, team awards. Lunch will be served!', type: 'event', pinned: true, offset: 0 },
    { ei: 4, content: '🎂 Happy Birthday Ananya Reddy! Wishing you a fantastic day! Join us in the breakout area at 4 PM for cake! 🎉', type: 'greeting', pinned: false, offset: 0 },
    { ei: 4, content: '🎊 This Friday is Fun Friday — Ganesh Festival Theme! Wear traditional Maharashtrian outfits, modak competition, and dhol-tasha from 3 PM! 🥟', type: 'event', pinned: false, offset: 1 },
    { ei: 3, content: '🏏 ReliSoft Cricket Tournament 2026 registrations open! Team size 8, weekend matches. Register by July 18!', type: 'event', pinned: false, offset: 1 },
    { ei: 0, content: '🔥 Client visit: Alpha Corp team visiting Mumbai office next Monday. Please update project dashboards.', type: 'announcement', pinned: false, offset: 2 },
    { ei: 5, content: '🇺🇸 Just landed in San Francisco for client go-live. 3 backend team members joining next week! #GlobalTeam', type: 'post', pinned: false, offset: 2 },
    { ei: 2, content: '🪷 Ganesh Chaturthi celebrations! Lord Ganesha brings wisdom and prosperity to all! #Festival', type: 'event', pinned: false, offset: 3 },
    { ei: 9, content: '🌴 Fun Friday — Beach Theme was incredible! Thanks HR for the sand art contest and music! Photos attached!', type: 'post', pinned: false, offset: 3 },
    { ei: 10, content: '🇮🇳 Pune team now fully operational with new collab tools. Stand-ups at 10 AM IST. Welcome aboard!', type: 'post', pinned: false, offset: 4 },
    { ei: 8, content: '🎯 Weekly Sales Review this Friday 11 AM. Bring pipeline updates and Q3 forecasts.', type: 'announcement', pinned: false, offset: 4 },
    { ei: 7, content: '🎊 Huge congrats for achieving ISO 27001 certification! Team lunch this Friday! 🏆', type: 'recognition', pinned: false, offset: 5 },
    { ei: 6, content: '🎨 Design Review tomorrow 2 PM — new employee portal UI design system. All stakeholders please join.', type: 'post', pinned: false, offset: 5 },
    { ei: 2, content: '✈️ Beta Technologies client visit next Wednesday. Product demo preparation needed.', type: 'announcement', pinned: false, offset: 6 },
    { ei: 0, content: '📢 New Health Insurance plans live! Visit Benefits portal to compare and enroll. Deadline July 20.', type: 'announcement', pinned: false, offset: 6 },
    { ei: 10, content: '🖥️ Server maintenance Saturday 10 PM — 2 AM. HR portal may be unavailable. Save your work.', type: 'announcement', pinned: false, offset: 7 },
  ];
  for (const sp of socialPosts) {
    const emp = createdUsers[sp.ei];
    await SocialPost.create({
      employee: emp.employee._id, content: sp.content, type: sp.type, pinned: sp.pinned || false,
      visibility: 'all', status: 'active', createdAt: new Date(now.getTime() - sp.offset * 86400000),
    });
  }
  console.log(`Created ${socialPosts.length} social posts`);

  // --- SURVEYS ---
  const hrEmp = createdUsers.find(e => e.data.name === 'Priya Sharma');
  const surveys = [
    { title: 'Q2 Employee Engagement Survey', description: 'Help us understand how engaged you feel at work.', type: 'engagement', questions: [{ questionText: 'How satisfied are you with your role?', questionType: 'rating' }, { questionText: 'Do you feel valued by your team?', questionType: 'boolean' }, { questionText: 'What can we improve?', questionType: 'text' }], status: 'active' },
    { title: 'Remote Work Policy Feedback', description: 'Share your remote work experience.', type: 'feedback', questions: [{ questionText: 'How productive are you remotely?', questionType: 'rating' }, { questionText: 'Hybrid or fully remote?', questionType: 'mcq' }], status: 'active' },
    { title: 'Annual Training Needs Assessment', description: 'What skills do you want to develop?', type: 'pulse', questions: [{ questionText: 'Which skill area interests you most?', questionType: 'text' }], status: 'draft' },
  ];
  for (const sd of surveys) {
    await Survey.create({ ...sd, createdBy: hrEmp?.employee._id, startDate: now, endDate: new Date(now.getTime() + 30 * 86400000) });
  }
  console.log('Created surveys');

  // --- RECRUITMENT: JOBS ---
  const jobs = [
    { jobTitle: 'Senior React Developer', department: 'Engineering', location: 'Pune', employmentType: 'full-time', vacancies: 3, description: 'Build and maintain complex React applications with TypeScript.', requirements: '5+ years React, TypeScript, state management, testing.', salaryRange: '18-25 LPA', status: 'active', postedBy: hrEmp?.user._id },
    { jobTitle: 'DevOps Engineer', department: 'Engineering', location: 'Mumbai', employmentType: 'full-time', vacancies: 2, description: 'Manage CI/CD pipelines, cloud infrastructure on AWS.', requirements: '3+ years AWS, Docker, Kubernetes, Terraform.', salaryRange: '14-20 LPA', status: 'active', postedBy: hrEmp?.user._id },
    { jobTitle: 'HR Executive', department: 'HR', location: 'Pune', employmentType: 'full-time', vacancies: 1, description: 'Manage recruitment, employee engagement, and HR operations.', requirements: '2+ years HR experience, HRMS knowledge.', salaryRange: '6-9 LPA', status: 'active', postedBy: hrEmp?.user._id },
    { jobTitle: 'UI/UX Designer', department: 'Design', location: 'Hyderabad', employmentType: 'full-time', vacancies: 2, description: 'Design intuitive interfaces for enterprise applications.', requirements: '3+ years Figma, design systems, user research.', salaryRange: '12-18 LPA', status: 'active', postedBy: hrEmp?.user._id },
    { jobTitle: 'QA Automation Engineer', department: 'Engineering', location: 'Pune', employmentType: 'full-time', vacancies: 2, description: 'Build automated test suites for web and mobile apps.', requirements: '3+ years Selenium, Playwright, API testing.', salaryRange: '10-16 LPA', status: 'draft', postedBy: hrEmp?.user._id },
  ];
  const createdJobs = [];
  for (const j of jobs) {
    createdJobs.push(await Job.create(j));
  }
  console.log(`Created ${jobs.length} job postings`);

  // --- APPLICANTS ---
  const applicants = [
    { ji: 0, name: 'Amit Shah', email: 'amit.shah@gmail.com', phone: '+91 99887 76655', status: 'shortlisted', rating: 4 },
    { ji: 0, name: 'Sonali Deshmukh', email: 'sonali.d@gmail.com', phone: '+91 88776 65544', status: 'interviewed', rating: 5 },
    { ji: 0, name: 'Rajesh Iyer', email: 'rajesh.iyer@outlook.com', phone: '+91 77665 54433', status: 'new', rating: 3 },
    { ji: 1, name: 'Nitin Kale', email: 'nitin.kale@gmail.com', phone: '+91 66554 43322', status: 'offered', rating: 5 },
    { ji: 1, name: 'Pooja Malhotra', email: 'pooja.m@yahoo.com', phone: '+91 55443 32211', status: 'new', rating: 4 },
    { ji: 2, name: 'Meera Joshi', email: 'meera.joshi@gmail.com', phone: '+91 44332 21100', status: 'shortlisted', rating: 4 },
    { ji: 3, name: 'Kiran Patil', email: 'kiran.patil@gmail.com', phone: '+91 33221 10099', status: 'new', rating: 3 },
    { ji: 0, name: 'Deepa Nair', email: 'deepa.n@gmail.com', phone: '+91 22110 09988', status: 'rejected', rating: 2 },
  ];
  for (const a of applicants) {
    await Applicant.create({ job: createdJobs[a.ji]._id, name: a.name, email: a.email, phone: a.phone, status: a.status, rating: a.rating, appliedDate: new Date(now.getTime() - Math.floor(Math.random() * 20) * 86400000) });
  }
  console.log(`Created ${applicants.length} applicants`);

  // --- PAYROLL / PAYSLIPS ---
  const months = [4, 5, 6]; // Apr, May, Jun 2026
  for (const m of months) {
    for (const cu of createdUsers) {
      const basic = Math.round(cu.data.salary / 12 * 0.5);
      const hra = Math.round(basic * 0.5);
      await Payslip.create({
        employee: cu.employee._id, month: m, year: 2026,
        earnings: [
          { name: 'Basic Pay', amount: basic },
          { name: 'House Rent Allowance', amount: hra },
          { name: 'Conveyance Allowance', amount: 1600 },
          { name: 'Medical Allowance', amount: 1250 },
          { name: 'Special Allowance', amount: Math.round(basic * 0.2) },
        ],
        deductions: [
          { name: 'PF', amount: Math.round(basic * 0.12) },
          { name: 'Professional Tax', amount: 200 },
          { name: 'TDS', amount: Math.round(basic * 0.1) },
        ],
        grossEarnings: basic + hra + 1600 + 1250 + Math.round(basic * 0.2),
        grossDeductions: Math.round(basic * 0.12) + 200 + Math.round(basic * 0.1),
        netPay: Math.round((basic + hra + 1600 + 1250 + Math.round(basic * 0.2)) - (Math.round(basic * 0.12) + 200 + Math.round(basic * 0.1))),
        totalDays: 30, daysPaid: 30,
        bankName: 'HDFC Bank', bankAccount: `XXXX${String(1000 + createdUsers.indexOf(cu)).padStart(4, '0')}`,
        status: m < 6 ? 'Paid' : 'Generated',
        paymentDate: m < 6 ? new Date(2026, m, 1) : null,
      });
    }
  }
  console.log(`Created payslips for ${createdUsers.length} employees x ${months.length} months`);

  // --- TRAINING ---
  const trainings = [
    { title: 'Advanced React & TypeScript', type: 'technical', mode: 'online', trainer: 'Rahul Sharma', startDate: new Date(2026, 6, 15), endDate: new Date(2026, 6, 19), duration: '5 days', maxParticipants: 20, status: 'planned', link: 'https://meet.google.com/abc-defg-hij' },
    { title: 'AWS Cloud Practitioner Prep', type: 'technical', mode: 'hybrid', trainer: 'AWS Certified Trainer', startDate: new Date(2026, 6, 22), endDate: new Date(2026, 6, 26), duration: '5 days', location: 'Pune Office - Conference Room A', maxParticipants: 15, status: 'planned' },
    { title: 'Leadership & Management Skills', type: 'leadership', mode: 'offline', trainer: 'Dr. Anjali Mehta', startDate: new Date(2026, 7, 5), endDate: new Date(2026, 7, 6), duration: '2 days', location: 'Mumbai Office', maxParticipants: 12, status: 'planned' },
    { title: 'Effective Communication', type: 'soft-skill', mode: 'online', trainer: 'Communication Pro', startDate: new Date(2026, 7, 12), endDate: new Date(2026, 7, 12), duration: '1 day', maxParticipants: 30, status: 'planned', link: 'https://teams.microsoft.com/meeting/123' },
    { title: 'Data Privacy & Compliance', type: 'compliance', mode: 'online', trainer: 'Compliance Team', startDate: new Date(2026, 6, 10), endDate: new Date(2026, 6, 10), duration: 'Half day', maxParticipants: 50, status: 'completed' },
    { title: 'Kubernetes for Beginners', type: 'technical', mode: 'online', trainer: 'Vikram Joshi', startDate: new Date(2026, 7, 19), endDate: new Date(2026, 7, 23), duration: '5 days', maxParticipants: 10, status: 'planned', link: 'https://meet.google.com/xyz' },
  ];
  for (const t of trainings) {
    await Training.create(t);
  }
  console.log(`Created ${trainings.length} training courses`);

  // --- PERFORMANCE REVIEWS ---
  for (let i = 3; i < createdUsers.length; i++) {
    const cu = createdUsers[i];
    await Performance.create({
      employee: cu.employee._id,
      reviewer: createdUsers[3]?.employee._id,
      reviewPeriod: 'H1', year: 2026,
      kras: [
        { area: 'Project Delivery', weightage: 40, target: 'Deliver all sprint commitments', achievement: '90% sprint completion', selfRating: 4, managerRating: 4 },
        { area: 'Code Quality', weightage: 25, target: '<5% defect rate', achievement: '3% defect rate', selfRating: 4, managerRating: 3 },
        { area: 'Team Collaboration', weightage: 20, target: 'Active participation in reviews', achievement: 'Regular contributor', selfRating: 4, managerRating: 5 },
        { area: 'Learning & Growth', weightage: 15, target: 'Complete 2 certifications', achievement: '1 certification done', selfRating: 3, managerRating: 3 },
      ],
      overallRating: 4, selfComment: 'Good quarter with solid delivery.', managerComment: 'Consistent performer. Could improve on documentation.',
      status: 'completed', reviewedAt: new Date(2026, 5, 30),
    });
  }
  console.log(`Created performance reviews for ${createdUsers.length - 3} employees`);

  // --- HELP DESK TICKETS ---
  const ticketData = [
    { ei: 2, cat: 'it', subj: 'Laptop not charging', desc: 'My Dell Latitude battery is not charging beyond 15%. Need replacement urgently.', pri: 'high', status: 'in-progress', assign: 10 },
    { ei: 3, cat: 'hr', subj: 'Leave balance discrepancy', desc: 'My PL balance shows 8 days but I should have 12 days as per policy.', pri: 'medium', status: 'open', assign: 0 },
    { ei: 5, cat: 'it', subj: 'VPN access not working', desc: 'Unable to connect to office VPN from home. Getting authentication error.', pri: 'urgent', status: 'in-progress', assign: 10 },
    { ei: 6, cat: 'it', subj: 'Software license request', desc: 'Need Adobe Creative Cloud license for design work.', pri: 'low', status: 'open', assign: null },
    { ei: 7, cat: 'admin', subj: 'Access card not working', desc: 'My office access card is not working at the main gate.', pri: 'medium', status: 'resolved', assign: 10 },
    { ei: 8, cat: 'it', subj: 'Email signature update', desc: 'Need to update my email signature with new designation.', pri: 'low', status: 'closed', assign: 10 },
    { ei: 9, cat: 'hr', subj: 'Address change in records', desc: 'I moved to a new apartment. Need to update address in system.', pri: 'low', status: 'open', assign: 0 },
    { ei: 2, cat: 'it', subj: 'Monitor flickering', desc: 'My secondary monitor is flickering intermittently.', pri: 'medium', status: 'open', assign: null },
  ];
  for (const td of ticketData) {
    await Ticket.create({
      employee: createdUsers[td.ei].employee._id, category: td.cat, subject: td.subj, description: td.desc,
      priority: td.pri, status: td.status, assignedTo: td.assign !== null ? createdUsers[td.assign]?.employee._id : undefined,
      department: td.cat === 'hr' ? 'Human Resources' : td.cat === 'it' ? 'IT' : 'Administration',
      comments: td.status === 'resolved' || td.status === 'closed' ? [{ user: createdUsers[td.assign]?.employee._id, message: 'Issue has been resolved. Please confirm.', createdAt: new Date(now.getTime() - 86400000) }] : [],
    });
  }
  console.log(`Created ${ticketData.length} support tickets`);

  // --- IT ASSETS ---
  const itAssets = [
    { type: 'laptop', brand: 'Dell', model: 'Latitude 5440', serialNumber: 'DL5440-001', assetTag: 'AST-001', processor: 'Intel i7-1365U', ram: '16GB', storage: '512GB SSD', osType: 'Windows', osVersion: '11 Pro', status: 'issued', assignedTo: 0, condition: 'excellent' },
    { type: 'laptop', brand: 'HP', model: 'EliteBook 840 G10', serialNumber: 'HP840-002', assetTag: 'AST-002', processor: 'Intel i5-1345U', ram: '16GB', storage: '256GB SSD', osType: 'Windows', osVersion: '11 Pro', status: 'issued', assignedTo: 3, condition: 'good' },
    { type: 'monitor', brand: 'Dell', model: 'U2723QE', serialNumber: 'MON-001', assetTag: 'AST-003', status: 'issued', assignedTo: 0, condition: 'excellent' },
    { type: 'laptop', brand: 'Apple', model: 'MacBook Pro 14 M3', serialNumber: 'MBP-M3-003', assetTag: 'AST-004', processor: 'Apple M3 Pro', ram: '18GB', storage: '512GB SSD', osType: 'macOS', osVersion: 'Sonoma 14.5', status: 'issued', assignedTo: 6, condition: 'new' },
    { type: 'laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serialNumber: 'LEN-X1-004', assetTag: 'AST-005', processor: 'Intel i7-1370P', ram: '32GB', storage: '1TB SSD', osType: 'Windows', osVersion: '11 Pro', status: 'available', condition: 'good' },
    { type: 'desktop', brand: 'Dell', model: 'OptiPlex 7080', serialNumber: 'DESK-005', assetTag: 'AST-006', processor: 'Intel i7-10700', ram: '32GB', storage: '512GB SSD', osType: 'Windows', osVersion: '11 Pro', status: 'available', condition: 'fair' },
    { type: 'phone', brand: 'Poly', model: 'Voyager 5200', serialNumber: 'PHN-001', assetTag: 'AST-007', status: 'issued', assignedTo: 3, condition: 'good' },
    { type: 'laptop', brand: 'HP', model: 'ProBook 450 G10', serialNumber: 'HP450-006', assetTag: 'AST-008', processor: 'Intel i5-1335U', ram: '8GB', storage: '256GB SSD', osType: 'Windows', osVersion: '11 Pro', status: 'available', condition: 'good' },
  ];
  for (const a of itAssets) {
    await ITAsset.create({
      ...a,
      assignedTo: a.assignedTo !== undefined ? createdUsers[a.assignedTo]?.employee._id : undefined,
      assignedDate: a.status === 'issued' ? new Date(2026, 0, 15) : undefined,
      purchaseDate: new Date(2025, 11, 1),
      purchaseCost: a.type === 'laptop' ? 120000 : a.type === 'monitor' ? 45000 : a.type === 'phone' ? 15000 : 80000,
      warrantyExpiry: new Date(2028, 11, 1),
      location: 'Pune Office',
    });
  }
  console.log(`Created ${itAssets.length} IT assets`);

  // --- TRAVEL REQUESTS ---
  const travelRequests = [
    { ei: 5, type: 'domestic', purpose: 'Client visit for go-live support', from: 'Pune', to: 'Mumbai', dep: new Date(2026, 6, 20), ret: new Date(2026, 6, 22), mode: 'flight', budget: 25000, status: 'approved', approvedBy: 3 },
    { ei: 5, type: 'international', purpose: 'Onshore deployment at client site', from: 'Mumbai', to: 'San Francisco', dep: new Date(2026, 6, 10), ret: new Date(2026, 6, 28), mode: 'flight', budget: 350000, status: 'approved', approvedBy: 3 },
    { ei: 6, type: 'domestic', purpose: 'Design workshop with client team', from: 'Hyderabad', to: 'Bangalore', dep: new Date(2026, 7, 5), ret: new Date(2026, 7, 6), mode: 'flight', budget: 15000, status: 'pending' },
    { ei: 0, type: 'domestic', purpose: 'Conference speaking engagement', from: 'Mumbai', to: 'Delhi', dep: new Date(2026, 7, 15), ret: new Date(2026, 7, 16), mode: 'flight', budget: 30000, status: 'approved', approvedBy: 3 },
    { ei: 8, type: 'domestic', purpose: 'Client meeting for new project', from: 'Delhi', to: 'Pune', dep: new Date(2026, 7, 10), ret: new Date(2026, 7, 11), mode: 'train', budget: 5000, status: 'pending' },
  ];
  for (const tr of travelRequests) {
    await TravelRequest.create({
      employee: createdUsers[tr.ei].employee._id, type: tr.type, purpose: tr.purpose,
      fromLocation: tr.from, toLocation: tr.to, departureDate: tr.dep, returnDate: tr.ret,
      mode: tr.mode, estimatedBudget: tr.budget, status: tr.status,
      approvedBy: tr.approvedBy !== undefined ? createdUsers[tr.approvedBy]?.employee._id : undefined,
      approvalDate: tr.status === 'approved' ? now : undefined,
    });
  }
  console.log(`Created ${travelRequests.length} travel requests`);

  // --- EMPLOYEE DOCUMENTS ---
  const docs = [
    { ei: 0, name: 'Offer Letter - Priya Sharma', type: 'offer-letter', status: 'final', version: 2 },
    { ei: 0, name: 'Appraisal Letter Q1 FY26', type: 'appraisal-letter', status: 'final', version: 1 },
    { ei: 3, name: 'Offer Letter - Rahul Verma', type: 'offer-letter', status: 'final', version: 1 },
    { ei: 3, name: 'Experience Letter - Previous Employer', type: 'experience-letter', status: 'final', version: 1 },
    { ei: 6, name: 'Offer Letter - Ananya Reddy', type: 'offer-letter', status: 'final', version: 1 },
    { ei: 4, name: 'HR Policy Acknowledgment', type: 'other', status: 'final', version: 1 },
    { ei: 4, name: 'Maternity Policy Acknowledgment', type: 'policy', status: 'final', version: 1 },
  ];
  for (const d of docs) {
    await Document.create({
      name: d.name, type: d.type, employee: createdUsers[d.ei]?.employee._id, generatedBy: hrEmp?.employee._id, status: d.status, version: d.version,
      content: `This is a sample ${d.name} document content. This serves as a demo record for the ReliSoft HR portal.`,
      tags: [d.type, createdUsers[d.ei]?.data.department],
    });
  }
  console.log(`Created ${docs.length} documents`);

  // --- POLICIES ---
  const policies = [
    { title: 'Leave Policy', category: 'hr', description: 'Comprehensive leave policy covering all leave types, accruals, and approvals.', version: '2.1', effectiveDate: new Date(2026, 0, 1), status: 'active', requiresAcknowledgment: true, tags: ['leave', 'attendance', 'hr'] },
    { title: 'Code of Conduct', category: 'hr', description: 'Standards of professional behavior and ethical practices for all employees.', version: '1.0', effectiveDate: new Date(2025, 5, 1), status: 'active', requiresAcknowledgment: true, tags: ['ethics', 'conduct', 'hr'] },
    { title: 'IT Security Policy', category: 'it', description: 'Information security guidelines, password policies, and data protection rules.', version: '3.0', effectiveDate: new Date(2025, 11, 1), status: 'active', requiresAcknowledgment: true, tags: ['security', 'it', 'password'] },
    { title: 'Travel & Expense Policy', category: 'finance', description: 'Guidelines for booking travel, claiming expenses, and reimbursement limits.', version: '1.2', effectiveDate: new Date(2026, 2, 1), status: 'active', requiresAcknowledgment: true, tags: ['travel', 'expense', 'finance'] },
    { title: 'Work From Home Policy', category: 'hr', description: 'Remote work eligibility, expectations, and infrastructure requirements.', version: '1.0', effectiveDate: new Date(2025, 3, 1), status: 'active', requiresAcknowledgment: false, tags: ['remote', 'wfh', 'flexible'] },
    { title: 'POSH Policy', category: 'compliance', description: 'Prevention of Sexual Harassment at Workplace policy as per legal requirements.', version: '1.0', effectiveDate: new Date(2024, 0, 1), status: 'active', requiresAcknowledgment: true, tags: ['posh', 'compliance', 'legal'] },
    { title: 'Attendance & Late Coming Policy', category: 'hr', description: 'Attendance marking, late coming rules, and half-day guidelines.', version: '2.0', effectiveDate: new Date(2026, 3, 1), status: 'active', requiresAcknowledgment: false, tags: ['attendance', 'late', 'hours'] },
  ];
  for (const p of policies) {
    await Policy.create({ ...p, owner: hrEmp?.employee._id, content: `Full content of ${p.title}. This is auto-generated demo content for the ReliSoft HR portal.` });
  }
  console.log(`Created ${policies.length} policies`);

  // --- NOTIFICATIONS ---
  for (const cu of createdUsers) {
    await Notification.create({ recipient: cu.employee._id, type: 'in-app', module: 'system', title: 'Welcome to ReliSoft HR!', message: `Hi ${cu.data.name}, your account has been set up. Explore your dashboard to get started.`, read: false, sentAt: now });
  }
  await Notification.create({ recipient: createdUsers[0].employee._id, type: 'in-app', module: 'leave', title: 'Leave Request Update', message: 'Your leave request (Jul 10-11) has been Approved.', read: false, sentAt: now });
  await Notification.create({ recipient: createdUsers[3].employee._id, type: 'in-app', module: 'leave', title: 'Leave Action Required', message: 'Neha Patel has requested leave (Jul 20-22). Please review.', read: false, sentAt: now });
  await Notification.create({ recipient: createdUsers[10].employee._id, type: 'in-app', module: 'ticket', title: 'New IT Ticket Assigned', message: 'Ticket TKT-000001 (Laptop not charging) has been assigned to you.', read: false, sentAt: now });
  await Notification.create({ recipient: createdUsers[0].employee._id, type: 'in-app', module: 'performance', title: 'Performance Review Reminder', message: 'H1 performance reviews are due in 2 weeks. Please complete pending reviews.', read: false, sentAt: now });
  console.log('Created notifications');

  // --- BENEFIT PLANS ---
  const benefitPlans = [
    { name: 'Health Plus Insurance', type: 'HealthInsurance', description: 'Comprehensive health insurance covering employee and 4 dependents. Includes OPD, maternity, and critical illness.', coverage: 'Employee + 4 Dependents', monthlyCost: 2500, employerContribution: 100, status: 'active' },
    { name: 'Dental Care Plan', type: 'Dental', description: 'Annual dental checkup and coverage for dental procedures up to ₹50,000.', coverage: 'Employee + Spouse', monthlyCost: 800, employerContribution: 100, status: 'active' },
    { name: 'Annual Wellness Program', type: 'Wellness', description: 'Annual health checkup, gym membership reimbursement, and wellness workshops.', coverage: 'Employee', monthlyCost: 1500, employerContribution: 80, status: 'active' },
    { name: 'Employee Stock Option Plan', type: 'Others', description: 'ESOP for all employees with 2+ years tenure. Annual vesting over 4 years.', coverage: 'Employee', monthlyCost: 0, employerContribution: 0, status: 'active' },
    { name: 'Flexi-Benefits Account', type: 'Reimbursement', description: 'Choose your own benefits from a menu of options — fuel, mobile, internet, books, and more.', coverage: 'Employee', monthlyCost: 0, employerContribution: 100, status: 'active' },
  ];
  for (const b of benefitPlans) {
  try { await BenefitPlan.create(b); } catch (e) { console.error('  Skipped benefit plan:', b.name, e.message); }
  }
  console.log(`Created ${benefitPlans.length} benefit plans`);

  // --- PHYSICAL ASSETS ---
  const assets = [
    { name: 'Conference Room Projector', type: 'other', assetTag: 'AST-001', location: 'Pune Office - Conference A', status: 'available', purchaseDate: new Date(2024, 5, 1), purchaseCost: 85000, condition: 'good' },
    { name: 'Standing Desk - Prabhadevi', type: 'other', assetTag: 'AST-002', location: 'Mumbai Office - Floor 3', assignedTo: 0, status: 'issued', purchaseDate: new Date(2025, 2, 15), purchaseCost: 35000, condition: 'good' },
    { name: 'Air Conditioner - Server Room', type: 'other', assetTag: 'AST-003', location: 'Pune Office - Server Room', status: 'available', purchaseDate: new Date(2023, 8, 1), purchaseCost: 120000, condition: 'fair' },
    { name: 'Server Rack - Dell PowerEdge', type: 'other', assetTag: 'AST-004', location: 'Pune Office - Server Room', status: 'available', purchaseDate: new Date(2025, 0, 1), purchaseCost: 450000, condition: 'good' },
    { name: 'Office Vehicle - Toyota Innova', type: 'other', assetTag: 'AST-005', location: 'Pune Office - Parking', status: 'available', purchaseDate: new Date(2024, 3, 1), purchaseCost: 2800000, condition: 'good' },
    { name: 'CCTV System', type: 'other', assetTag: 'AST-006', location: 'Both Offices', status: 'available', purchaseDate: new Date(2025, 6, 1), purchaseCost: 180000, condition: 'new' },
  ];
  for (const a of assets) {
    try {
      await Asset.create({
        ...a,
        assignedTo: a.assignedTo !== undefined ? createdUsers[a.assignedTo]?.employee._id : undefined,
      });
    } catch (e) { console.error('  Skipped asset:', a.name, e.message); }
  }
  console.log(`Created ${assets.length} physical assets`);

  // --- CONTRACTORS ---
  const contractors = [
    { companyName: 'TechUp Solutions', contactPerson: 'Suresh Iyer', email: 'suresh@techup.in', phone: '+91 99887 76600', services: 'Web Development - Contract staffing', status: 'active', contractStart: new Date(2025, 6, 1), contractEnd: new Date(2026, 11, 31), contractValue: 2400000 },
    { companyName: 'CleanPro Services', contactPerson: 'Rajesh Patil', email: 'rajesh@cleanpro.in', phone: '+91 88776 65511', services: 'Office cleaning and maintenance', status: 'active', contractStart: new Date(2024, 0, 1), contractEnd: new Date(2026, 11, 31), contractValue: 600000 },
    { companyName: 'Ace Security Systems', contactPerson: 'Vijay Singh', email: 'vijay@acesecurity.in', phone: '+91 77665 54422', services: 'Security personnel for office premises', status: 'active', contractStart: new Date(2024, 3, 1), contractEnd: new Date(2027, 2, 31), contractValue: 1800000 },
    { companyName: 'C2H Tech Solutions', contactPerson: 'Priya Kulkarni', email: 'priya@c2htech.in', phone: '+91 66554 43333', services: 'IT staffing - Contract to hire (3 positions)', status: 'active', contractStart: new Date(2026, 2, 1), contractEnd: new Date(2026, 8, 30), contractValue: 3600000 },
  ];
  for (const c of contractors) {
    try { await Contractor.create(c); } catch (e) { console.error('  Skipped contractor:', c.companyName, e.message); }
  }
  console.log(`Created ${contractors.length} contractors`);

  // --- VISITORS ---
  const visitors = [
    { name: 'Anand Kulkarni', email: 'anand@alphacorp.com', phone: '+91 99887 76500', company: 'Alpha Corp', purpose: 'Client Meeting', host: createdUsers[0]?.employee._id, visitDate: now, status: 'checked-in' },
    { name: 'Dr. Meera Bhat', email: 'meera@consulting.in', phone: '+91 88776 65411', company: 'Consulting Partners', purpose: 'Interview Panel', host: createdUsers[4]?.employee._id, visitDate: new Date(now.getTime() + 86400000), status: 'scheduled' },
    { name: 'Sandeep Rao', email: 'sandeep@betatech.com', phone: '+91 77665 54322', company: 'Beta Technologies', purpose: 'Product Demo', host: createdUsers[3]?.employee._id, visitDate: new Date(now.getTime() + 2 * 86400000), status: 'scheduled' },
    { name: 'Neelam Sharma', email: 'neelam@vendor.in', phone: '+91 66554 43233', company: 'Vendor Corp', purpose: 'Vendor Meeting', host: createdUsers[1]?.employee._id, visitDate: new Date(now.getTime() - 86400000), status: 'checked-in' },
    { name: 'Rohit Jain', email: 'rohit@partner.com', phone: '+91 55443 32144', company: 'Partner Inc', purpose: 'Partnership Discussion', host: createdUsers[10]?.employee._id, visitDate: new Date(now.getTime() - 2 * 86400000), status: 'completed' },
  ];
  for (const v of visitors) {
    try { await Visitor.create(v); } catch (e) { console.error('  Skipped visitor:', v.name, e.message); }
  }
  console.log(`Created ${visitors.length} visitors`);

  // --- GATE PASSES ---
  const gatePasses = [
    { requestedBy: createdUsers[0]?.employee._id, type: 'asset-out', itemDescription: 'Dell Latitude Laptop - Service Center', reason: 'Repair - Faulty battery', status: 'approved', approvedBy: createdUsers[10]?.employee._id, expectedReturn: new Date(now.getTime() + 7 * 86400000), createdAt: now },
    { requestedBy: createdUsers[5]?.employee._id, type: 'temporary', itemDescription: 'Visit company property', reason: 'Taking company projector for client presentation', status: 'pending', expectedReturn: new Date(now.getTime() + 1 * 86400000), createdAt: now },
    { requestedBy: createdUsers[7]?.employee._id, type: 'permanent', itemDescription: 'Old desktop - Decommissioned', reason: 'E-waste disposal', status: 'approved', approvedBy: createdUsers[10]?.employee._id, expectedReturn: null, createdAt: new Date(now.getTime() - 3 * 86400000) },
  ];
  for (const g of gatePasses) {
    try { await GatePass.create(g); } catch (e) { console.error('  Skipped gate pass:', g.itemDescription, e.message); }
  }
  console.log(`Created ${gatePasses.length} gate passes`);

  // --- INTERNAL JOB POSTINGS ---
  const internalJobPostings = [
    { title: 'Tech Lead - Frontend', department: 'Engineering', location: 'Pune', description: 'Lead the frontend team, architect solutions, mentor junior devs.', requirements: '7+ years experience, React, team leadership.', status: 'open', postedDate: new Date(now.getTime() - 5 * 86400000), closingDate: new Date(now.getTime() + 25 * 86400000) },
    { title: 'HR Business Partner', department: 'HR', location: 'Mumbai', description: 'Partner with business leaders on talent strategy and employee relations.', requirements: '5+ years HRBP experience, employee relations.', status: 'open', postedDate: new Date(now.getTime() - 10 * 86400000), closingDate: new Date(now.getTime() + 20 * 86400000) },
  ];
  for (const ijp of internalJobPostings) {
    try { await InternalJobPosting.create(ijp); } catch (e) { console.error('  Skipped job posting:', ijp.title, e.message); }
  }
  console.log(`Created ${internalJobPostings.length} internal job postings`);

  // --- SERVICE CATALOG ---
  try {
    const serviceCats = await ServiceCategory.insertMany([
      { name: 'IT Hardware', description: 'Laptops, desktops, monitors, and peripherals', displayOrder: 1 },
      { name: 'Software & Licenses', description: 'Software installation, license requests', displayOrder: 2 },
      { name: 'Access & Security', description: 'VPN, email, badge access, permissions', displayOrder: 3 },
      { name: 'HR Services', description: 'Certificates, letters, policy info', displayOrder: 4 },
    ]);
    const services = [
      { name: 'New Laptop Request', category: serviceCats[0]._id, description: 'Request a new laptop for new joiners or replacement', deliveryTime: '3-5 days', cost: 'Free (company-provided)', status: 'active', displayOrder: 1 },
      { name: 'Software Installation', category: serviceCats[1]._id, description: 'Request installation of approved software', deliveryTime: '1-2 days', cost: 'Free', status: 'active', displayOrder: 1 },
      { name: 'VPN Access Request', category: serviceCats[2]._id, description: 'Request VPN access for remote work', deliveryTime: '1 day', cost: 'Free', status: 'active', displayOrder: 1 },
      { name: 'Email ID Creation', category: serviceCats[2]._id, description: 'Create new employee email account', deliveryTime: '1 day', cost: 'Free', status: 'active', displayOrder: 2 },
      { name: 'Experience Letter', category: serviceCats[3]._id, description: 'Request relieving and experience letter', deliveryTime: '3-5 days', cost: 'Free', status: 'active', displayOrder: 1 },
      { name: 'Visitor Wi-Fi Access', category: serviceCats[2]._id, description: 'Temporary Wi-Fi credentials for visitors', deliveryTime: 'Same day', cost: 'Free', status: 'active', displayOrder: 3 },
      { name: 'Monitor Upgrade Request', category: serviceCats[0]._id, description: 'Request upgrade to larger/better monitor', deliveryTime: '5-7 days', cost: 'Free', status: 'active', displayOrder: 2 },
      { name: 'MS Office License', category: serviceCats[1]._id, description: 'Microsoft 365 license assignment', deliveryTime: '1 day', cost: 'Free', status: 'active', displayOrder: 2 },
    ];
    for (const s of services) {
      await ServiceCatalog.create(s);
    }
    console.log(`Created ${services.length} service catalog items`);
  } catch (e) { console.error('  Skipped service catalog:', e.message); }

  // --- SUMMARY ---
  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login Credentials (password: Temp@123):');
  console.log('   Admin:    admin@relisofttechnologies.com (admin)');
  console.log('   HR:       priya.sharma@relisofttechnologies.com (hr)');
  console.log('   HR:       sneha.gupta@relisofttechnologies.com (hr)');
  console.log('   Mgr:      rahul.verma@relisofttechnologies.com (manager)');
  console.log('   Emp:      neha.patel@relisofttechnologies.com (employee)');
  console.log('   Emp:      vikram.joshi@relisofttechnologies.com (employee)');
  console.log('   Fin:      arun.kumar@relisofttechnologies.com (finance)');
  console.log('\n📊 Seeded modules:');
  console.log('   ✅ Users & Employees (11)');
  console.log('   ✅ Leave Types, Balances, Requests');
  console.log('   ✅ Attendance Records');
  console.log('   ✅ Holidays');
  console.log('   ✅ Social Posts');
  console.log('   ✅ Surveys');
  console.log('   ✅ Recruitment (Jobs + Applicants)');
  console.log('   ✅ Payroll / Payslips');
  console.log('   ✅ Training Courses');
  console.log('   ✅ Performance Reviews');
  console.log('   ✅ Helpdesk Tickets');
  console.log('   ✅ IT Assets');
  console.log('   ✅ Travel Requests');
  console.log('   ✅ Employee Documents');
  console.log('   ✅ Company Policies');
  console.log('   ✅ Notifications');
  console.log('   ✅ Benefit Plans');
  console.log('   ✅ Physical Assets');
  console.log('   ✅ Contractors');
  console.log('   ✅ Visitors');
  console.log('   ✅ Gate Passes');
  console.log('   ✅ Internal Job Postings');
  console.log('   ✅ Service Catalog');
  console.log('   ✅ Service Categories');
  console.log('\n🌐 Server ready at http://localhost:5000');
  console.log('🖥️  Client ready at http://localhost:5173');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
