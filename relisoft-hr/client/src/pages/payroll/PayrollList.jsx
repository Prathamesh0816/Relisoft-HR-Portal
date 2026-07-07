import { useState, useEffect } from 'react';
import { DollarSign, Download, Eye, Loader2, FileText, AlertCircle, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollAPI } from '../../services/api';

const statusStyles = {
  Draft: 'bg-gray-100 text-gray-800',
  Processed: 'bg-relisoft-100 text-relisoft-800',
  Paid: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [month]);

  const loadData = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        payrollAPI.list({ month }),
        payrollAPI.getSummary({ month }).catch(() => null),
      ]);
      setPayrolls(listRes.data.payrolls || listRes.data.data || listRes.data || []);
      setSummary(summaryRes?.data || null);
    } catch (err) {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await payrollAPI.process({ month });
      toast.success('Payroll processed successfully');
      setShowProcessModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await payrollAPI.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch (err) {
      toast.error('Failed to download payslip');
    }
  };

  const totalGross = summary?.totalGross || payrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0);
  const totalDeductions = summary?.totalDeductions || payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalNet = summary?.totalNet || payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-500 mt-1">Process and manage employee payroll</p>
          </div>
          <button onClick={() => setShowProcessModal(true)}
            className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
            <DollarSign className="h-5 w-5 mr-2" /> Process Payroll
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Gross</p>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${(totalGross || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Deductions</p>
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${(totalDeductions || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Net Pay</p>
              <DollarSign className="h-5 w-5 text-relisoft-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${(totalNet || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No payroll records found</p>
              <p className="text-sm">Process payroll for the selected month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payrolls.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-relisoft-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-relisoft-700">
                              {p.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{p.employee?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">${(p.grossPay || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">${(p.deductions || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">${(p.netPay || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.status] || 'bg-gray-100 text-gray-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDownload(p._id)}
                          className="p-1.5 text-gray-400 hover:text-relisoft-600 hover:bg-relisoft-50 rounded-lg transition-colors" title="Download Payslip">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => window.open(`/payroll/${p._id}`, '_blank')}
                          className="p-1.5 text-gray-400 hover:text-relisoft-600 hover:bg-relisoft-50 rounded-lg transition-colors ml-1" title="View Payslip">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Process Payroll</h3>
              <button onClick={() => setShowProcessModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4 p-4 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  You are about to process payroll for <strong>{month}</strong>. This action will calculate salaries for all active employees.
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Month: <span className="font-semibold">{month}</span>
              </p>
              <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                <button onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleProcess} disabled={processing}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Check className="h-4 w-4 mr-2" /> Confirm Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
