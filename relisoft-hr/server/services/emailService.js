import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL] Would send to ${to}: ${subject}`);
      return;
    }
    try {
      await this.getTransporter().sendMail({
        from: `"${process.env.APP_NAME || 'ReliSoft HR'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    } catch (err) {
      console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
    }
  }

  async sendLeaveApprovalRequest(approverEmail, approverName, employeeName, employeeCode, leaveType, fromDate, toDate, days, reason, approvalToken, baseUrl) {
    const approveUrl = `${baseUrl}/api/leave/approve?token=${approvalToken}&action=approve`;
    const rejectUrl = `${baseUrl}/api/leave/approve?token=${approvalToken}&action=reject`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { border: 1px solid #ddd; padding: 20px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table td { padding: 10px; border: 1px solid #ddd; }
    .table tr:nth-child(even) { background-color: #f9f9f9; }
    .label { font-weight: bold; width: 30%; }
    .buttons { margin: 30px 0; text-align: center; }
    .btn { padding: 12px 30px; margin: 0 10px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-approve { background-color: #27ae60; color: white; }
    .btn-reject { background-color: #e74c3c; color: white; }
    .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Leave Request - Awaiting Your Approval</h2>
    </div>
    <div class="content">
      <p>Dear <b>${approverName}</b>,</p>
      <p><b>${employeeName}</b> (${employeeCode}) has applied for leave.</p>
      <table class="table">
        <tr><td class="label">Leave Type</td><td>${leaveType}</td></tr>
        <tr><td class="label">From</td><td>${new Date(fromDate).toLocaleDateString()}</td></tr>
        <tr><td class="label">To</td><td>${new Date(toDate).toLocaleDateString()}</td></tr>
        <tr><td class="label">Days</td><td><b>${days}</b></td></tr>
        <tr><td class="label">Reason</td><td>${reason || 'N/A'}</td></tr>
      </table>
      <div class="buttons">
        <a href="${approveUrl}" class="btn btn-approve">Approve</a>
        <a href="${rejectUrl}" class="btn btn-reject">Reject</a>
      </div>
    </div>
    <div class="footer">
      <p>ReliSoft HR | Do not reply to this email</p>
    </div>
  </div>
</body>
</html>`;

    return this.sendEmail(approverEmail, 'New Leave Request - Action Required', html);
  }

  async sendLeaveDecision(employeeEmail, employeeName, approverName, status, leaveType, fromDate, toDate, days, reason) {
    const statusText = status === 'Approved' ? 'APPROVED' : 'REJECTED';
    const statusColor = status === 'Approved' ? '#27ae60' : '#e74c3c';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { border: 1px solid #ddd; padding: 20px; }
    .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .table td { padding: 10px; border: 1px solid #ddd; }
    .table tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Leave Request ${statusText}</h2>
    </div>
    <div class="content">
      <p>Dear ${employeeName},</p>
      <p>Your leave request has been <b>${status.toLowerCase()}</b> by ${approverName}.</p>
      <table class="table">
        <tr><td><b>Leave Type</b></td><td>${leaveType}</td></tr>
        <tr><td><b>From</b></td><td>${new Date(fromDate).toLocaleDateString()}</td></tr>
        <tr><td><b>To</b></td><td>${new Date(toDate).toLocaleDateString()}</td></tr>
        <tr><td><b>Days</b></td><td>${days}</td></tr>
      </table>
      ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}
      <p>Best regards,<br/><b>ReliSoft HR</b></p>
    </div>
    <div class="footer">
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>`;

    return this.sendEmail(employeeEmail, `Leave Request ${status}`, html);
  }
}

export default new EmailService();
