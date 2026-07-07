import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import OrganizationRole from '../models/OrganizationRole.js';
import HrPolicy from '../models/HrPolicy.js';
import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { ROLES } from '../utils/roleEnums.js';

const seedNewModels = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // 1. Organization Roles
    const orgRolesData = [
      { name: 'SoftwareEngineer', label: 'Software Engineer', baseRole: 'employee', roleValue: ROLES.EMPLOYEE.value },
      { name: 'TeamLead', label: 'Team Lead', baseRole: 'manager', roleValue: ROLES.TEAM_LEAD.value },
      { name: 'HRL1', label: 'HR L1', baseRole: 'hr', roleValue: ROLES.HR.value },
      { name: 'SeniorSoftwareEngineer', label: 'Senior Software Engineer', baseRole: 'employee', roleValue: ROLES.SENIOR_SOFTWARE_ENGINEER.value },
      { name: 'TechnicalManagerL1', label: 'Technical Manager L1', baseRole: 'manager', roleValue: ROLES.MANAGER.value },
      { name: 'OrganizationHead', label: 'Organization Head', baseRole: 'admin', roleValue: ROLES.ORGANIZATION_HEAD.value },
      { name: 'HRL2', label: 'HR L2', baseRole: 'hr', roleValue: ROLES.HR_L2.value },
      { name: 'TechnicalManagerL2', label: 'Technical Manager L2', baseRole: 'manager', roleValue: ROLES.MANAGER_L2.value },
    ];

    for (const r of orgRolesData) {
      await OrganizationRole.findOneAndUpdate(
        { name: r.name },
        r,
        { upsert: true }
      );
    }
    console.log(`Seeded ${orgRolesData.length} organization roles`);

    // 2. HrPolicy
    await HrPolicy.findOneAndUpdate({}, { allowHalfDayLeave: true }, { upsert: true });
    console.log('Seeded HR Policy (half-day enabled)');

    // 3. Update LeaveTypes to match .NET project
    const dotNetLeaveTypes = [
      { name: 'Sick/Casual Leave', code: 'SCL', isPaid: true, requiresAdvanceNotice: false, isAccrued: false, colorCode: '#4CAF50', isActive: true, description: 'Sick and casual leave combined' },
      { name: 'Planned Leave', code: 'PLN', isPaid: true, requiresAdvanceNotice: true, advanceNoticeDays: 3, isAccrued: true, accrualPerMonth: 1, colorCode: '#2196F3', isActive: true, description: 'Pre-planned annual leave' },
      { name: 'Compensatory Off', code: 'CO', isPaid: true, requiresAdvanceNotice: false, isAccrued: false, colorCode: '#8BC34A', isActive: true, description: 'Compensatory off for extra work', isCompOff: true },
      { name: 'Floater Holiday', code: 'FH', isPaid: true, requiresAdvanceNotice: false, isAccrued: false, colorCode: '#00BCD4', isActive: true, description: 'Optional holiday (max 2/year)', isFloater: true },
      { name: 'Maternity Leave', code: 'MAT', isPaid: true, requiresAdvanceNotice: true, advanceNoticeDays: 30, isAccrued: false, colorCode: '#E91E63', isActive: true, description: 'Maternity leave as per law' },
      { name: 'Paternity Leave', code: 'PAT', isPaid: true, requiresAdvanceNotice: true, advanceNoticeDays: 7, isAccrued: false, colorCode: '#9C27B0', isActive: true, description: 'Paternity leave for new fathers' },
      { name: 'Unpaid Leave', code: 'LWP', isPaid: false, isAccrued: false, colorCode: '#607D8B', isActive: true, description: 'Leave without pay' },
      { name: 'Director Special Leave', code: 'DSL', isPaid: true, requiresAdvanceNotice: false, isAccrued: false, colorCode: '#FF9800', isActive: true, description: 'Special leave at director discretion' },
    ];

    for (const lt of dotNetLeaveTypes) {
      const existing = await LeaveType.findOne({ name: lt.name });
      if (existing) {
        await LeaveType.updateOne({ name: lt.name }, { $set: lt });
      } else {
        await LeaveType.create(lt);
      }
    }
    console.log(`Seeded ${dotNetLeaveTypes.length} leave types`);

    // 4. Update existing employees with roleValue
    const employees = await Employee.find({});
    for (const emp of employees) {
      if (!emp.roleValue) {
        const user = await User.findOne({ email: emp.email });
        if (user?.roleValue) {
          emp.roleValue = user.roleValue;
          await emp.save();
        }
      }
      if (!emp.employeeCode) {
        emp.employeeCode = `EMP${String(emp._id).slice(-5).toUpperCase()}`;
        await emp.save();
      }
    }
    console.log(`Updated ${employees.length} employees with roleValue and employeeCode`);

    // 5. Update users with username and roleValue
    const users = await User.find({});
    for (const u of users) {
      if (!u.username) {
        u.username = u.email.split('@')[0];
      }
      if (!u.roleValue) {
        const roleMap = { superadmin: 6, admin: 6, hr: 3, manager: 5, employee: 1, finance: 1, it: 1 };
        u.roleValue = roleMap[u.role] || 1;
      }
      await u.save();
    }
    console.log(`Updated ${users.length} users with username and roleValue`);

    // 6. Sync leave balances for new leave types
    const updatedLeaveTypes = await LeaveType.find({});
    for (const emp of employees) {
      for (const lt of updatedLeaveTypes) {
        await LeaveBalance.findOneAndUpdate(
          { employee: emp._id, leaveType: lt._id },
          {
            employee: emp._id,
            leaveType: lt._id,
            allocatedLeaves: lt.name === 'Sick/Casual Leave' ? 7 : lt.name === 'Planned Leave' ? 1 : lt.name === 'Maternity Leave' ? 60 : 0,
            usedLeaves: 0,
          },
          { upsert: true }
        );
      }
    }
    console.log(`Synced leave balances for ${employees.length} employees`);

    console.log('\n--- Seed Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedNewModels();
