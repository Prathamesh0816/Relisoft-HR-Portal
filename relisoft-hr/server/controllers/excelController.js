import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import EmployeeTeam from '../models/EmployeeTeam.js';
import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';
import OrganizationRole from '../models/OrganizationRole.js';
import { ROLES, getRoleByValue } from '../utils/roleEnums.js';
import bcrypt from 'bcryptjs';
import { Parser } from 'json2csv';

const DEFAULT_TEMP_PASSWORD = 'Temp@123';

const ROLE_MAP = {
  'employee': ROLES.EMPLOYEE.value,
  'softwareengineer': ROLES.EMPLOYEE.value,
  'teamlead': ROLES.TEAM_LEAD.value,
  'hr': ROLES.HR.value,
  'hrl1': ROLES.HR.value,
  'seniorsoftwareengineer': ROLES.SENIOR_SOFTWARE_ENGINEER.value,
  'manager': ROLES.MANAGER.value,
  'managerl1': ROLES.MANAGER.value,
  'technicalmanagerl1': ROLES.MANAGER.value,
  'organizationhead': ROLES.ORGANIZATION_HEAD.value,
  'orghead': ROLES.ORGANIZATION_HEAD.value,
  'hrl2': ROLES.HR_L2.value,
  'managerl2': ROLES.MANAGER_L2.value,
  'technicalmanagerl2': ROLES.MANAGER_L2.value,
};

export async function uploadExistingEmployees(req, res) {
  try {
    const { employees } = req.body;
    if (!employees?.length) {
      return res.status(400).json({ success: false, message: 'No employee data provided' });
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];

    for (const row of employees) {
      try {
        const existing = await Employee.findOne({ employeeCode: row.employeeCode });
        if (existing) {
          skipped++;
          continue;
        }

        if (await Employee.findOne({ email: row.email })) {
          errors.push(`Row: Email '${row.email}' already exists`);
          failed++;
          continue;
        }

        const normalizedRole = (row.role || '').replace(/[\s-]/g, '').toLowerCase();
        const roleValue = ROLE_MAP[normalizedRole] || ROLES.EMPLOYEE.value;
        const roleInfo = getRoleByValue(roleValue);

        let project = null;
        if (row.projectName) {
          project = await Project.findOneAndUpdate(
            { name: row.projectName.trim() },
            { name: row.projectName.trim() },
            { upsert: true, new: true }
          );
        }

        const emp = await Employee.create({
          employeeCode: row.employeeCode,
          firstName: (row.fullName || '').split(' ')[0],
          lastName: (row.fullName || '').split(' ').slice(1).join(' '),
          email: row.email,
          department: row.department,
          designation: row.designation,
          jobRole: row.jobRole,
          employmentType: row.employmentType || 'permanent',
          workLocation: row.location,
          salaryStructureDetails: row.salaryStructureDetails,
          dateOfJoining: row.joinDate || new Date(),
          roleValue,
          isActive: true,
        });

        const teamNames = [row.primaryTeam].concat(
          (row.additionalTeams || '').split(',').map(t => t.trim()).filter(Boolean)
        ).filter((v, i, a) => a.indexOf(v) === i);

        let primaryTeamId = null;
        for (const tName of teamNames) {
          if (!tName) continue;
          let leadEmp = null;
          if (row.teamLeadEmpcode) leadEmp = await Employee.findOne({ employeeCode: row.teamLeadEmpcode });
          const team = await Team.findOneAndUpdate(
            { name: tName, project: project?._id },
            { name: tName, project: project?._id, lead: leadEmp?._id || emp._id },
            { upsert: true, new: true }
          );
          await EmployeeTeam.findOneAndUpdate(
            { employee: emp._id, team: team._id },
            { employee: emp._id, team: team._id },
            { upsert: true }
          );
          if (tName === row.primaryTeam) primaryTeamId = team._id;
        }

        if (primaryTeamId) {
          emp.primaryTeam = primaryTeamId;
          await emp.save();
        }

        const username = row.username || row.employeeCode?.toLowerCase();
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(row.temporaryPassword || DEFAULT_TEMP_PASSWORD, salt);

        await User.create({
          name: row.fullName,
          email: row.email,
          password: hashedPwd,
          role: roleInfo?.baseRole || 'employee',
          roleValue,
          employeeId: row.employeeCode,
          department: row.department,
          designation: row.designation,
          username,
          status: 'active',
        });

        const defaultLeaveTypes = await LeaveType.find({ name: { $in: ['Sick/Casual Leave', 'Planned Leave'] } });
        for (const lt of defaultLeaveTypes) {
          await LeaveBalance.findOneAndUpdate(
            { employee: emp._id, leaveType: lt._id },
            { employee: emp._id, leaveType: lt._id, allocatedLeaves: lt.name === 'Sick/Casual Leave' ? 7 : 1, usedLeaves: 0 },
            { upsert: true }
          );
        }

        processed++;
      } catch (err) {
        errors.push(`Row ${row.employeeCode}: ${err.message}`);
        failed++;
      }
    }

    res.json({
      success: failed === 0,
      message: `Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`,
      recordsProcessed: processed,
      recordsFailed: failed,
      recordsSkipped: skipped,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function uploadLeaveBalances(req, res) {
  try {
    const { rows } = req.body;
    if (!rows?.length) {
      return res.status(400).json({ success: false, message: 'No data provided' });
    }

    let processed = 0;
    let failed = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const employee = await Employee.findOne({ employeeCode: row.employeeCode });
        if (!employee) {
          errors.push(`Employee '${row.employeeCode}' not found`);
          failed++;
          continue;
        }

        const leaveType = await LeaveType.findOne({ name: row.leaveTypeName });
        if (!leaveType) {
          errors.push(`Leave type '${row.leaveTypeName}' not found`);
          failed++;
          continue;
        }

        await LeaveBalance.findOneAndUpdate(
          { employee: employee._id, leaveType: leaveType._id },
          {
            employee: employee._id,
            leaveType: leaveType._id,
            allocatedLeaves: row.allocatedLeaves || 0,
            usedLeaves: row.usedLeaves || 0,
          },
          { upsert: true }
        );
        processed++;
      } catch (err) {
        errors.push(`Error: ${err.message}`);
        failed++;
      }
    }

    res.json({
      success: failed === 0,
      message: `Processed: ${processed}, Failed: ${failed}`,
      recordsProcessed: processed,
      recordsFailed: failed,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function downloadEmployeeTemplate(req, res) {
  try {
    const roles = await OrganizationRole.find({ isActive: true }).lean();
    const fields = [
      'employeeCode', 'fullName', 'email', 'department', 'designation',
      'jobRole', 'employmentType', 'workLocation', 'salaryStructureDetails',
      'joinDate', 'role', 'projectName', 'primaryTeam', 'additionalTeams',
      'teamLeadEmployeeCode', 'username',
    ];
    const sampleRow = {
      employeeCode: 'EMP001', fullName: 'John Doe', email: 'john.doe@relisofttechnologies.com',
      department: 'Engineering', designation: 'Software Engineer', jobRole: 'Frontend Developer',
      employmentType: 'permanent', workLocation: 'Pune', salaryStructureDetails: 'Fixed',
      joinDate: '2024-01-15', role: roles[0]?.name || 'employee',
      projectName: 'Project Alpha', primaryTeam: 'Team A', additionalTeams: 'Team B',
      teamLeadEmployeeCode: 'EMP002', username: 'johndoe',
    };
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse([sampleRow]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-template.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadLeaveBalanceTemplate(req, res) {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true }).lean();
    const fields = ['employeeCode', 'leaveTypeName', 'allocatedLeaves', 'usedLeaves'];
    const sampleRow = {
      employeeCode: 'EMP001',
      leaveTypeName: leaveTypes[0]?.name || 'Sick/Casual Leave',
      allocatedLeaves: 7,
      usedLeaves: 2,
    };
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse([sampleRow]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leave-balances-template.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
