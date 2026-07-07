import { generateReport } from '../services/leaveReportingService.js';

export const getLeaveReport = async (req, res) => {
  try {
    const { department, startDate, endDate, leaveTypeId, status, format } = req.query;
    const data = await generateReport({ department, startDate, endDate, leaveTypeId, status, format });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leave-report.csv"');
      return res.send(data);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('getLeaveReport error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
