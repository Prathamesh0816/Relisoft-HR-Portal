import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';
import CompOff from '../models/CompOff.js';
import FloaterHolidayUsage from '../models/FloaterHolidayUsage.js';
import HrPolicy from '../models/HrPolicy.js';
import { ROLES, isHrRole, isManagerRole, isApproverRole, getRoleByValue } from '../utils/roleEnums.js';
import approvalTokenService from '../services/tokenService.js';
import emailService from '../services/emailService.js';
import leaveAccrualService from '../services/leaveAccrualService.js';

const appBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const { leaveTypeId, startDate, endDate, isHalfDay, reason, proceedAsLop, workedDate } = req.body;

    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) return res.status(400).json({ success: false, message: 'Invalid leave type' });

    const from = new Date(startDate);
    const to = new Date(endDate);
    if (to < from) return res.status(400).json({ success: false, message: 'End date must be on or after start date' });

    const calendarDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const days = isHalfDay ? calendarDays * 0.5 : calendarDays;

    if (isHalfDay) {
      const policy = await HrPolicy.findOne();
      if (!policy?.allowHalfDayLeave) {
        return res.status(400).json({ success: false, message: 'Half day leave is currently disabled by HR.' });
      }
    }

    let isLop = false;
    let lopDays = 0;

    if (leaveType.name === 'Unpaid Leave') {
      isLop = true;
      lopDays = days;
    } else if (leaveType.isCompOff) {
      if (!workedDate) {
        return res.status(400).json({ success: false, message: 'Worked date is required for compensatory off.' });
      }
      const worked = new Date(workedDate);
      const now = new Date();
      const daysSinceWorked = Math.floor((now - worked) / (1000 * 60 * 60 * 24));
      if (daysSinceWorked > 30) {
        return res.status(400).json({ success: false, message: 'Compensatory off must be availed within 1 month of the worked date.' });
      }
    } else if (leaveType.isFloater) {
      const year = from.getFullYear();
      let usage = await FloaterHolidayUsage.findOne({ employee: employee._id, calendarYear: year });
      const usedSoFar = usage?.usedCount || 0;
      if (usedSoFar >= 2) {
        return res.status(400).json({
          success: false,
          message: `Floater holiday limit reached. You have used ${usedSoFar}/2 floater holidays for ${year}.`,
        });
      }
    } else {
      await leaveAccrualService.syncEmployee(employee._id);

      if (leaveType.name !== 'Unpaid Leave') {
        const balance = await LeaveBalance.findOne({ employee: employee._id, leaveType: leaveType._id });
        if (!balance) return res.status(400).json({ success: false, message: `No leave balance found for ${leaveType.name}` });

        const remaining = (balance.allocatedLeaves || 0) - (balance.usedLeaves || 0);
        if (remaining < days) {
          if (!proceedAsLop) {
            return res.status(400).json({
              success: false,
              message: `Insufficient balance. Available: ${remaining} days, Requested: ${days} days`,
              insufficientBalance: true,
              remainingBalance: remaining,
              requestedDays: days,
            });
          }
          isLop = true;
          lopDays = days - remaining;
        }
      }
    }

    const approver = await resolveApprover(employee);
    if (!approver) return res.status(400).json({ success: false, message: 'No approver found for your role' });

    const now = new Date();
    const leave = await Leave.create({
      employee: employee._id,
      leaveType: leaveType._id,
      fromDate: from,
      toDate: to,
      totalDays: days,
      isHalfDay: !!isHalfDay,
      isLop,
      lopDays,
      isCompOff: !!leaveType.isCompOff,
      workedDate: leaveType.isCompOff ? new Date(workedDate) : undefined,
      compOffExpiryDate: leaveType.isCompOff ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
      reason,
      status: 'Pending',
      approver: approver._id,
      appliedOn: now,
    });

    if (leaveType.isFloater) {
      const year = from.getFullYear();
      await FloaterHolidayUsage.findOneAndUpdate(
        { employee: employee._id, calendarYear: year },
        { $inc: { usedCount: 1 } },
        { upsert: true }
      );
    }

    try {
      const token = approvalTokenService.generateToken(leave._id, approver._id);
      await emailService.sendLeaveApprovalRequest(
        approver.email,
        `${approver.firstName} ${approver.lastName || ''}`.trim(),
        `${employee.firstName} ${employee.lastName || ''}`.trim(),
        employee.employeeCode,
        leaveType.name,
        from, to, days, reason, token, appBaseUrl
      );
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Leave application submitted for approval to ${approver.firstName} ${approver.lastName || ''}`.trim(),
      leaveApplicationId: leave._id,
      isLop,
      lopDays,
    });
  } catch (error) {
    console.error('applyLeave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveLeaveFromEmail = async (req, res) => {
  try {
    const { token, action, reason } = req.query;

    let decoded;
    try {
      decoded = approvalTokenService.decodeToken(token);
    } catch {
      return res.status(400).send(buildDecisionPage(false, 'Invalid or expired approval link.'));
    }

    const { leaveAppId, approverId } = decoded;

    const leave = await Leave.findById(leaveAppId)
      .populate('employee')
      .populate('leaveType')
      .populate({ path: 'approver', select: 'firstName lastName email' });

    if (!leave) {
      return res.status(400).send(buildDecisionPage(false, 'Leave application not found.'));
    }

    if (leave.approver?._id.toString() !== approverId.toString()) {
      return res.status(400).send(buildDecisionPage(false, 'You are not the assigned approver for this request.'));
    }

    if (leave.status !== 'Pending') {
      return res.status(400).send(buildDecisionPage(false, `Request is already ${leave.status} and cannot be modified.`));
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).send(buildDecisionPage(false, 'Invalid action. Must be approve or reject.'));
    }

    if (action === 'approve') {
      leave.status = 'Approved';
      leave.approvedBy = leave.approver._id;
      leave.approvedOn = new Date();
      leave.approvalReason = reason || 'Approved';

      if (!leave.isCompOff && !leave.leaveType?.isCompOff && !leave.leaveType?.isFloater) {
        const balance = await LeaveBalance.findOne({ employee: leave.employee._id, leaveType: leave.leaveType._id });
        if (balance) {
          balance.usedLeaves = (balance.usedLeaves || 0) + leave.totalDays;
          await balance.save();
        }
      }
    } else {
      leave.status = 'Rejected';
      leave.rejectedBy = leave.approver._id;
      leave.rejectedOn = new Date();
      leave.approvalReason = reason || 'Rejected by approver';
    }

    await leave.save();

    try {
      await emailService.sendLeaveDecision(
        leave.employee.email,
        `${leave.employee.firstName} ${leave.employee.lastName || ''}`.trim(),
        `${leave.approver.firstName} ${leave.approver.lastName || ''}`.trim(),
        leave.status,
        leave.leaveType.name,
        leave.fromDate, leave.toDate, leave.totalDays,
        leave.approvalReason
      );
    } catch (emailErr) {
      console.error('Failed to send decision email:', emailErr.message);
    }

    const successMsg = action === 'approve'
      ? `Leave approved successfully.`
      : 'Leave rejected successfully.';

    res.send(buildDecisionPage(true, successMsg));
  } catch (error) {
    console.error('approveLeaveFromEmail error:', error);
    res.status(500).send(buildDecisionPage(false, 'An error occurred processing your request.'));
  }
};

export const getEmployeeRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const requests = await Leave.find({ employee: employee._id })
      .populate('leaveType', 'name')
      .populate({ path: 'approver', select: 'firstName lastName' })
      .sort('-appliedOn');

    res.json({
      requests: requests.map(r => ({
        id: r._id,
        leaveTypeId: r.leaveType?._id,
        leaveTypeName: r.leaveType?.name,
        fromDate: r.fromDate,
        toDate: r.toDate,
        reason: r.reason,
        isHalfDay: r.isHalfDay,
        isLop: r.isLop,
        lopDays: r.lopDays,
        isCompOff: r.isCompOff,
        workedDate: r.workedDate,
        appliedOn: r.appliedOn,
        approvedOn: r.approvedOn,
        rejectedOn: r.rejectedOn,
        actionedOn: r.status === 'Cancelled' ? r.rejectedOn : (r.approvedOn || r.rejectedOn),
        status: r.status,
        approverName: r.approver ? `${r.approver.firstName} ${r.approver.lastName || ''}`.trim() : null,
        totalDays: r.totalDays,
        canCancel: r.status === 'Pending' || r.status === 'Approved',
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewerRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true })
      .populate('primaryTeam')
      .populate('organizationRole');
    if (!employee) return res.status(404).json({ message: 'Reviewer not found' });

    const pendingRequests = await Leave.find({ approver: employee._id, status: 'Pending' })
      .populate({ path: 'employee', populate: { path: 'primaryTeam organizationRole' } })
      .populate('leaveType')
      .sort({ appliedOn: -1, fromDate: 1 });

    const recentDecisions = await Leave.find({ approver: employee._id, status: { $ne: 'Pending' } })
      .populate({ path: 'employee', populate: { path: 'primaryTeam organizationRole' } })
      .populate('leaveType')
      .sort({ approvedOn: -1, rejectedOn: -1 })
      .limit(10);

    const mapRequest = (r) => ({
      id: r._id,
      employeeId: r.employee?._id,
      employeeName: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim(),
      employeeCode: r.employee?.employeeCode,
      employeeRole: r.employee?.roleValue ? getRoleByValue(r.employee.roleValue)?.label : 'Employee',
      primaryTeamName: r.employee?.primaryTeam?.name,
      leaveTypeName: r.leaveType?.name,
      fromDate: r.fromDate,
      toDate: r.toDate,
      reason: r.reason,
      isHalfDay: r.isHalfDay,
      isLop: r.isLop,
      lopDays: r.lopDays,
      isCompOff: r.isCompOff,
      workedDate: r.workedDate,
      appliedOn: r.appliedOn,
      approvedOn: r.approvedOn,
      rejectedOn: r.rejectedOn,
      actionedOn: r.approvedOn || r.rejectedOn,
      status: r.status,
      totalDays: r.totalDays,
    });

    res.json({
      reviewer: {
        id: employee._id,
        fullName: `${employee.firstName} ${employee.lastName || ''}`.trim(),
        role: employee.roleValue ? getRoleByValue(employee.roleValue)?.label : 'Employee',
      },
      requests: pendingRequests.map(mapRequest),
      recentDecisions: recentDecisions.map(mapRequest),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Reviewer not found' });

    const { leaveApplicationId, action, reason } = req.body;
    if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const leave = await Leave.findById(leaveApplicationId).populate('employee').populate('leaveType');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (leave.approver?.toString() !== employee._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the assigned approver' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request is already ${leave.status}` });
    }

    if (action === 'approve') {
      leave.status = 'Approved';
      leave.approvedBy = employee._id;
      leave.approvedOn = new Date();
      leave.approvalReason = reason || 'Approved';

      if (!leave.isCompOff && !leave.leaveType?.isCompOff && !leave.leaveType?.isFloater) {
        const balance = await LeaveBalance.findOne({ employee: leave.employee._id, leaveType: leave.leaveType._id });
        if (balance) {
          balance.usedLeaves = (balance.usedLeaves || 0) + leave.totalDays;
          await balance.save();
        }
      }
    } else {
      leave.status = 'Rejected';
      leave.rejectedBy = employee._id;
      leave.rejectedOn = new Date();
      leave.approvalReason = reason || 'Rejected by approver';
    }

    await leave.save();

    try {
      await emailService.sendLeaveDecision(
        leave.employee.email,
        `${leave.employee.firstName} ${leave.employee.lastName || ''}`.trim(),
        `${employee.firstName} ${employee.lastName || ''}`.trim(),
        leave.status,
        leave.leaveType?.name,
        leave.fromDate, leave.toDate, leave.totalDays,
        leave.approvalReason
      );
    } catch (emailErr) {
      console.error('Failed to send decision email:', emailErr.message);
    }

    const msg = action === 'approve'
      ? `Leave approved.`
      : 'Leave rejected.';

    res.json({ success: true, message: msg });
  } catch (error) {
    console.error('reviewLeave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const leave = await Leave.findById(req.params.id).populate('leaveType');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (leave.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the employee who applied can cancel' });
    }

    if (leave.status !== 'Pending' && leave.status !== 'Approved') {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status.toLowerCase()} and cannot be cancelled` });
    }

    let restoredDays = 0;
    if (leave.status === 'Approved') {
      if (leave.isCompOff) {
        await CompOff.findOneAndUpdate(
          { employee: leave.employee, workedDate: leave.workedDate },
          { status: 'Cancelled' }
        );
      } else if (leave.leaveType?.isFloater) {
        const year = leave.fromDate.getFullYear();
        await FloaterHolidayUsage.findOneAndUpdate(
          { employee: leave.employee, calendarYear: year },
          { $inc: { usedCount: -1 } }
        );
        restoredDays = leave.totalDays;
      } else {
        const balance = await LeaveBalance.findOne({ employee: leave.employee, leaveType: leave.leaveType._id });
        if (balance) {
          balance.usedLeaves = Math.max(0, (balance.usedLeaves || 0) - leave.totalDays);
          await balance.save();
          restoredDays = leave.totalDays;
        }
      }
    }

    leave.status = 'Cancelled';
    leave.approvalReason = 'Cancelled by employee';
    leave.rejectedOn = new Date();
    leave.rejectedBy = employee._id;
    await leave.save();

    const msg = restoredDays > 0
      ? `Leave cancelled. ${restoredDays} days restored to balance.`
      : 'Leave cancelled.';

    res.json({ success: true, message: msg, restoredDays });
  } catch (error) {
    console.error('cancelLeave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveBalanceForEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, isActive: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const balances = await LeaveBalance.find({ employee: employee._id })
      .populate('leaveType', 'name')
      .lean();

    const year = new Date().getFullYear();
    const floaterUsage = await FloaterHolidayUsage.findOne({ employee: employee._id, calendarYear: year });
    const floaterRemaining = Math.max(0, 2 - (floaterUsage?.usedCount || 0));

    const pendingCompOffs = await CompOff.find({ employee: employee._id, status: 'Approved', isExpired: false }).lean();

    res.json({
      success: true,
      data: balances.map(b => ({
        leaveTypeId: b.leaveType?._id,
        leaveTypeName: b.leaveType?.name,
        allocatedLeaves: b.allocatedLeaves || 0,
        usedLeaves: b.usedLeaves || 0,
        remainingLeaves: (b.allocatedLeaves || 0) - (b.usedLeaves || 0),
      })),
      floaterRemaining,
      pendingCompOffs: pendingCompOffs.map(c => ({
        id: c._id,
        workedDate: c.workedDate,
        expiryDate: c.expiryDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function resolveApprover(employee) {
  const role = getRoleByValue(employee.roleValue);

  if (role?.value === ROLES.ORGANIZATION_HEAD.value) {
    return await Employee.findOne({ roleValue: { $in: [ROLES.HR.value, ROLES.HR_L2.value] }, isActive: true });
  }

  if (role?.baseRole === 'hr') {
    return await Employee.findOne({ roleValue: ROLES.ORGANIZATION_HEAD.value, isActive: true });
  }

  if (role?.baseRole === 'manager') {
    return await Employee.findOne({ roleValue: { $in: [ROLES.HR.value, ROLES.HR_L2.value] }, isActive: true });
  }

  if (employee.primaryTeam) {
    const team = await (await import('../models/Team.js')).default.findById(employee.primaryTeam).populate('lead');
    if (team?.lead?.isActive) return team.lead;
  }

  const reportingMgr = await Employee.findOne({
    department: employee.department,
    roleValue: { $in: [ROLES.MANAGER.value, ROLES.MANAGER_L2.value, ROLES.TEAM_LEAD.value] },
    isActive: true,
  });
  if (reportingMgr) return reportingMgr;

  return await Employee.findOne({ roleValue: ROLES.ORGANIZATION_HEAD.value, isActive: true });
}

function buildDecisionPage(success, message) {
  const title = success ? 'Leave Request Approved' : 'Leave Request Not Completed';
  const badge = success ? 'Completed' : 'Needs Attention';
  const badgeClass = success ? 'success' : 'error';
  const safeMsg = escapeHtml(message);
  const linkUrl = appBaseUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f7f2ff; color: #24302b; font-family: Arial, sans-serif; }
    .panel { width: min(560px, 100%); padding: 28px; border: 1px solid #e7def2; border-radius: 8px; background: #fff; box-shadow: 0 20px 60px rgba(36,28,48,0.12); }
    .badge { display: inline-flex; min-height: 32px; align-items: center; padding: 0 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
    .badge.success { color: #245c3d; background: #dbf3e5; }
    .badge.error { color: #8c2f24; background: #f8dfda; }
    h1 { margin: 18px 0 10px; font-size: 1.6rem; }
    p { color: #5f6f68; line-height: 1.55; }
    a { display: inline-flex; align-items: center; min-height: 42px; margin-top: 18px; padding: 0 16px; border-radius: 8px; color: #fff; background: #315f4f; font-weight: 800; text-decoration: none; }
  </style>
</head>
<body>
  <main class="panel">
    <span class="badge ${badgeClass}">${badge}</span>
    <h1>${title}</h1>
    <p>${safeMsg}</p>
    <a href="${linkUrl}">Open HR Portal</a>
  </main>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
