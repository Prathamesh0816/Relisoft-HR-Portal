import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileBarChart, Eye, Calendar } from 'lucide-react';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const reportCards = [
  { key: 'hr', title: 'HR Report', description: 'Employee demographics, headcount, and HR metrics', icon: FileText, color: 'blue' },
  { key: 'payroll', title: 'Payroll Report', description: 'Salary, deductions, and payroll summaries', icon: FileBarChart, color: 'green' },
  { key: 'attendance', title: 'Attendance Report', description: 'Attendance records and summaries', icon: Calendar, color: 'relisoft' },
  { key: 'leave', title: 'Leave Report', description: 'Leave balances and utilization', icon: FileSpreadsheet, color: 'orange' },
  { key: 'compliance', title: 'Compliance Report', description: 'Compliance status and tracking', icon: FileText, color: 'red' },
];

const colorMap = {
  blue: 'border-l-relisoft-500 bg-relisoft-50',
  green: 'border-l-green-500 bg-green-50',
  relisoft: 'border-l-relisoft-500 bg-relisoft-50',
  orange: 'border-l-orange-500 bg-orange-50',
  red: 'border-l-red-500 bg-red-50',
};

const iconColorMap = {
  blue: 'text-relisoft-600 bg-relisoft-100',
  green: 'text-green-600 bg-green-100',
  relisoft: 'text-relisoft-600 bg-relisoft-100',
  orange: 'text-orange-600 bg-orange-100',
  red: 'text-red-600 bg-red-100',
};

const ReportPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRanges, setDateRanges] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAPIMethod = (key) => {
    const map = {
      hr: reportAPI.hrReport,
      payroll: reportAPI.payrollReport,
      attendance: reportAPI.attendanceReport,
      leave: reportAPI.leaveReport,
      compliance: reportAPI.complianceReport,
    };
    return map[key];
  };

  const handleDownload = async (key, format) => {
    try {
      setLoading(true);
      const params = {};
      const range = dateRanges[key] || {};
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;

      let blob;
      if (format === 'csv') {
        const res = await reportAPI.exportCSV(key, params);
        blob = res.data;
      } else if (format === 'pdf') {
        const res = await reportAPI.exportPDF(key, params);
        blob = res.data;
      } else {
        const apiMethod = getAPIMethod(key);
        if (!apiMethod) throw new Error('Unknown report type');
        const res = await apiMethod(params);
        blob = res.data;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}-report.${format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${key} report downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(`Failed to download ${key} report`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (key) => {
    setSelectedReport(key);
    try {
      setLoading(true);
      const params = {};
      const range = dateRanges[key] || {};
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;

      const apiMethod = getAPIMethod(key);
      if (!apiMethod) throw new Error('Unknown report type');
      const res = await apiMethod(params);
      const text = await res.data.text();
      setPreviewData(text.substring(0, 2000));
      toast.success('Report loaded for preview');
    } catch (err) {
      toast.error('Failed to load preview');
      setPreviewData('Preview not available. Try downloading the report instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MIS Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report) => {
          const Icon = report.icon;
          const borderColor = colorMap[report.color] || colorMap.blue;
          const iconColor = iconColorMap[report.color] || iconColorMap.blue;
          const range = dateRanges[report.key] || {};

          return (
            <div key={report.key} className={`card border-l-4 ${borderColor}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2.5 rounded-lg ${iconColor}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">From:</label>
                  <input
                    type="date"
                    className="input-field text-xs py-1"
                    value={range.from || ''}
                    onChange={(e) => setDateRanges({ ...dateRanges, [report.key]: { ...range, from: e.target.value } })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">To:</label>
                  <input
                    type="date"
                    className="input-field text-xs py-1"
                    value={range.to || ''}
                    onChange={(e) => setDateRanges({ ...dateRanges, [report.key]: { ...range, to: e.target.value } })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleDownload(report.key, 'csv')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Download size={14} /> CSV</button>
                <button onClick={() => handleDownload(report.key, 'pdf')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><FileBarChart size={14} /> PDF</button>
                <button onClick={() => handleDownload(report.key, 'excel')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => handlePreview(report.key)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Eye size={14} /> Preview</button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-header mb-0">Preview: {reportCards.find((r) => r.key === selectedReport)?.title}</h2>
            <button onClick={() => setSelectedReport(null)} className="btn-secondary text-xs">Close</button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-relisoft-600" />
              </div>
            ) : (
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{previewData}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
