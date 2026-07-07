import { ROLES, getRoleByValue, getRoleLabel, isHrRole, isManagerRole } from '../utils/roleEnums.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import EmployeeTeam from '../models/EmployeeTeam.js';
import OrganizationRole from '../models/OrganizationRole.js';
import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';
import HrPolicy from '../models/HrPolicy.js';
import bcrypt from 'bcryptjs';

export const getWorkspace = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .populate('organizationRole')
      .populate({ path: 'primaryTeam', populate: { path: 'lead' } })
      .populate({
        path: 'userId',
        select: 'name email role roleValue employeeId department designation phone status',
      })
      .sort({ firstName: 1 });

    const employeeTeams = await EmployeeTeam.find()
      .populate({ path: 'team', populate: { path: 'project lead' } });

    const projects = await Project.find().sort({ name: 1 }).lean();

    const teams = await Team.find().populate('lead project').sort({ name: 1 }).lean();

    const leaveTypes = await LeaveType.find({ isActive: true }).sort({ name: 1 }).lean();

    const hrPolicy = await getOrCreateHrPolicy();

    const orgRoles = await OrganizationRole.find({ isActive: true }).lean();

    const employeeMap = {};
    for (const emp of employees) {
      const empTeams = employeeTeams.filter(et => et.employee?.toString() === emp._id.toString());
      emp._doc.teams = empTeams.map(et => ({
        id: et.team?._id,
        name: et.team?.name,
        projectName: et.team?.project?.name,
        leadName: et.team?.lead?.firstName + ' ' + (et.team?.lead?.lastName || ''),
      }));
      emp._doc.roleLabel = emp.roleValue ? getRoleLabel(emp.roleValue) : 'Employee';
      employeeMap[emp._id] = emp;
    }

    const employeeList = Object.values(employeeMap).map(emp => ({
      id: emp._id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName || ''}`.trim(),
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      jobRole: emp.jobRole,
      employmentType: emp.employmentType,
      workLocation: emp.workLocation,
      salaryStructureDetails: emp.salaryStructureDetails,
      dateOfJoining: emp.dateOfJoining,
      roleLabel: emp._doc.roleLabel,
      roleValue: emp.roleValue,
      primaryTeam: emp.primaryTeam ? {
        id: emp.primaryTeam._id,
        name: emp.primaryTeam.name,
        leadName: emp.primaryTeam.lead ? `${emp.primaryTeam.lead.firstName} ${emp.primaryTeam.lead.lastName || ''}`.trim() : null,
      } : null,
      teams: emp._doc.teams,
      organizationRole: emp.organizationRole,
      isActive: emp.isActive,
    }));

    res.json({
      employees: employeeList,
      projects: projects.map(p => ({
        id: p._id,
        name: p.name,
        teams: teams.filter(t => t.project?._id?.toString() === p._id.toString()).map(t => ({
          id: t._id,
          name: t.name,
          projectId: t.project?._id,
          leadId: t.lead?._id,
          leadName: t.lead ? `${t.lead.firstName} ${t.lead.lastName || ''}`.trim() : null,
        })),
      })),
      leaveTypes: leaveTypes.map(lt => ({
        id: lt._id,
        name: lt.name,
        isPaid: lt.isPaid,
        isCompOff: lt.isCompOff,
        isFloater: lt.isFloater,
        requiresAdvanceNotice: lt.requiresAdvanceNotice,
        advanceNoticeDays: lt.advanceNoticeDays,
        isAccrued: lt.isAccrued,
        accrualPerMonth: lt.accrualPerMonth,
      })),
      roles: Object.entries(ROLES).map(([key, val]) => ({
        id: val.value,
        name: key,
        label: val.label,
        baseRole: val.baseRole,
      })),
      orgRoles: orgRoles.map(r => ({
        id: r._id,
        name: r.name,
        label: r.label,
        baseRole: r.baseRole,
        roleValue: r.roleValue,
      })),
      hrPolicy: { allowHalfDayLeave: hrPolicy.allowHalfDayLeave },
    });
  } catch (error) {
    console.error('getWorkspace error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      employeeCode, firstName, lastName, email, department, designation,
      jobRole, employmentType, workLocation, dateOfJoining, roleValue,
      projectName, primaryTeam, additionalTeams, teamLeadEmpcode,
      salaryStructureDetails, username, temporaryPassword,
    } = req.body;

    const errors = [];
    if (!employeeCode) errors.push('EmployeeCode is required');
    if (!firstName) errors.push('FirstName is required');
    if (!email) errors.push('Email is required');
    if (!department) errors.push('Department is required');
    if (!designation) errors.push('Designation is required');
    if (!jobRole) errors.push('JobRole is required');
    if (!employmentType) errors.push('EmploymentType is required');
    if (!workLocation) errors.push('Location is required');
    if (!roleValue) errors.push('Role is required');
    if (errors.length > 0) return res.status(400).json({ message: errors.join('; ') });

    const existing = await Employee.findOne({ employeeCode });
    if (existing) return res.status(400).json({ message: `Employee code '${employeeCode}' already exists` });

    const emailExists = await Employee.findOne({ email });
    if (emailExists) return res.status(400).json({ message: `Email '${email}' already exists` });

    let project = null;
    if (projectName) {
      project = await Project.findOneAndUpdate(
        { name: projectName.trim() },
        { name: projectName.trim() },
        { upsert: true, new: true }
      );
    }

    const role = getRoleByValue(roleValue);
    const emp = await Employee.create({
      employeeCode, firstName, lastName, email, department, designation,
      jobRole, employmentType, workLocation, dateOfJoining: dateOfJoining || new Date(),
      roleValue, salaryStructureDetails, isActive: true,
    });

    const teamNames = [primaryTeam].concat((additionalTeams || '').split(',').map(t => t.trim()).filter(Boolean))
      .filter((v, i, a) => a.indexOf(v) === i);

    let primaryTeamId = null;
    for (const tName of teamNames) {
      if (!tName) continue;
      let leadEmp = null;
      if (teamLeadEmpcode) leadEmp = await Employee.findOne({ employeeCode: teamLeadEmpcode });
      const team = await Team.findOneAndUpdate(
        { name: tName, project: project?._id },
        { name: tName, project: project?._id, lead: leadEmp?._id || emp._id },
        { upsert: true, new: true }
      );
      await EmployeeTeam.findOneAndUpdate(
        { employee: emp._id, team: team._id },
        { employee: emp._id, team: team._id },
        { upsert: true, new: true }
      );
      if (tName === primaryTeam) primaryTeamId = team._id;
    }

    if (primaryTeamId) {
      emp.primaryTeam = primaryTeamId;
      await emp.save();
    }

    const userLogin = username || employeeCode.toLowerCase();
    const tempPwd = temporaryPassword || 'demo123';
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(tempPwd, salt);

    await User.findOneAndUpdate(
      { email },
      {
        name: `${firstName} ${lastName || ''}`.trim(),
        email,
        password: hashedPwd,
        role: role?.baseRole || 'employee',
        roleValue,
        employeeId: employeeCode,
        department,
        designation,
        username: userLogin,
        status: 'active',
      },
      { upsert: true }
    );

    const defaultBalances = {
      'Sick/Casual Leave': 7,
      'Planned Leave': 1,
    };
    const leaveTypes = await LeaveType.find({ name: { $in: Object.keys(defaultBalances) } });
    for (const lt of leaveTypes) {
      await LeaveBalance.findOneAndUpdate(
        { employee: emp._id, leaveType: lt._id },
        { employee: emp._id, leaveType: lt._id, allocatedLeaves: defaultBalances[lt.name] || 0, usedLeaves: 0 },
        { upsert: true }
      );
    }

    res.status(201).json({ success: true, message: `Employee ${firstName} ${lastName || ''} created`, employeeId: emp._id });
  } catch (error) {
    console.error('createEmployee error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const emp = await Employee.findByIdAndUpdate(id, updates, { new: true });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    if (updates.email) {
      await User.findOneAndUpdate({ employeeId: emp.employeeCode }, { email: updates.email });
    }

    res.json({ success: true, employee: emp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const existing = await Project.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: 'Project already exists' });

    const project = await Project.create({ name: name.trim() });
    res.status(201).json({ success: true, id: project._id, name: project.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, projectId, leadEmployeeCode } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required' });
    if (!projectId) return res.status(400).json({ message: 'Project is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let lead = null;
    if (leadEmployeeCode) lead = await Employee.findOne({ employeeCode: leadEmployeeCode });

    const team = await Team.create({ name: name.trim(), project: projectId, lead: lead?._id || null });
    res.status(201).json({ success: true, id: team._id, name: team.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, projectId, leadEmployeeCode } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (projectId) updates.project = projectId;
    if (leadEmployeeCode) {
      const lead = await Employee.findOne({ employeeCode: leadEmployeeCode });
      if (lead) updates.lead = lead._id;
    }

    const team = await Team.findByIdAndUpdate(id, updates, { new: true }).populate('lead project');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ name: 1 }).lean();
    const teams = await Team.find().populate('lead project').sort({ name: 1 }).lean();

    res.json(projects.map(p => ({
      id: p._id,
      name: p.name,
      teams: teams.filter(t => t.project?._id?.toString() === p._id.toString()).map(t => ({
        id: t._id,
        name: t.name,
        leadId: t.lead?._id,
        leadName: t.lead ? `${t.lead.firstName} ${t.lead.lastName || ''}`.trim() : null,
      })),
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHrPolicy = async (req, res) => {
  try {
    const policy = await getOrCreateHrPolicy();
    res.json({ allowHalfDayLeave: policy.allowHalfDayLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHrPolicy = async (req, res) => {
  try {
    const { allowHalfDayLeave } = req.body;
    const policy = await HrPolicy.findOneAndUpdate(
      {},
      { allowHalfDayLeave: !!allowHalfDayLeave },
      { upsert: true, new: true }
    );
    res.json({ success: true, allowHalfDayLeave: policy.allowHalfDayLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getOrCreateHrPolicy() {
  let policy = await HrPolicy.findOne();
  if (!policy) {
    policy = await HrPolicy.create({ allowHalfDayLeave: false });
  }
  return policy;
}

export { ROLES, getRoleByValue, getRoleLabel };
