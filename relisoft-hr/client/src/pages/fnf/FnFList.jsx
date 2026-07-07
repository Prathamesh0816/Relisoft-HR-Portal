import { useState } from 'react';
import { Calculator, DollarSign, FileText, UserCheck, Percent, MinusCircle, PlusCircle, Download, CheckCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const FnFList = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [settlement, setSettlement] = useState({
    grossPayable: 0,
    leaveEncashment: 0,
    noticePeriodDays: 0,
    noticePayRecovery: 0,
    otherDeductions: 0,
    otherDeductionDesc: '',
    advanceRecovery: 0,
    netPayable: 0,
  });

  const handleCalculate = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    const gross = 50000;
    const leaveDays = 15;
    const leaveAmt = (gross / 30) * leaveDays;
    const noticeRecovery = settlement.noticePeriodDays > 0 ? (gross / 30) * settlement.noticePeriodDays : 0;
    const totalDeductions = noticeRecovery + Number(settlement.otherDeductions) + Number(settlement.advanceRecovery);
    const netPayable = gross + leaveAmt - totalDeductions;

    setSettlement((prev) => ({
      ...prev,
      grossPayable: gross,
      leaveEncashment: leaveAmt,
      noticePayRecovery: noticeRecovery,
      netPayable: Math.max(0, netPayable),
    }));
    setShowCalculator(true);
  };

  const handleGenerateLetter = () => {
    toast.success('Settlement letter generated');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Full & Final Settlement</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="card-header">Employee Selection</h2>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select className="input-field" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                  <option value="">Choose employee...</option>
                  <option value="EMP001">John Doe (EMP001) - Resigned</option>
                  <option value="EMP002">Jane Smith (EMP002) - Resigned</option>
                  <option value="EMP003">Bob Wilson (EMP003) - Retired</option>
                </select>
              </div>
              <button onClick={handleCalculate} className="btn-primary flex items-center gap-2"><Calculator size={18} /> Calculate</button>
            </div>
          </div>

          <div className="card">
            <h2 className="card-header">Settlement Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Payable</label>
                <input type="number" className="input-field" value={settlement.grossPayable} onChange={(e) => setSettlement({ ...settlement, grossPayable: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Encashment Days</label>
                <div className="flex gap-2">
                  <input type="number" className="input-field" placeholder="Days" value={settlement.leaveEncashment > 0 ? 15 : 0} />
                  <span className="flex items-center text-sm text-gray-500">= ${settlement.leaveEncashment}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period (Days)</label>
                <div className="flex gap-2">
                  <input type="number" className="input-field" value={settlement.noticePeriodDays} onChange={(e) => setSettlement({ ...settlement, noticePeriodDays: e.target.value })} placeholder="0" />
                  <span className="flex items-center text-sm text-gray-500">Recovery: ${settlement.noticePayRecovery}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                <input type="number" className="input-field" value={settlement.otherDeductions} onChange={(e) => setSettlement({ ...settlement, otherDeductions: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Description</label>
                <input type="text" className="input-field" value={settlement.otherDeductionDesc} onChange={(e) => setSettlement({ ...settlement, otherDeductionDesc: e.target.value })} placeholder="e.g., Training bond" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Recovery</label>
                <input type="number" className="input-field" value={settlement.advanceRecovery} onChange={(e) => setSettlement({ ...settlement, advanceRecovery: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleCalculate} className="btn-primary flex items-center gap-2"><Calculator size={16} /> Recalculate</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Net Payable Amount</h3>
            <p className="text-3xl font-bold text-green-700">${settlement.netPayable}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Payable</span>
                <span className="font-medium">${settlement.grossPayable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Leave Encashment</span>
                <span className="font-medium text-green-600">+${settlement.leaveEncashment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Notice Pay Recovery</span>
                <span className="font-medium text-red-600">-${settlement.noticePayRecovery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Other Deductions</span>
                <span className="font-medium text-red-600">-${settlement.otherDeductions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Advance Recovery</span>
                <span className="font-medium text-red-600">-${settlement.advanceRecovery || 0}</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-base font-bold">
                <span>Net Payable</span>
                <span className="text-green-700">${settlement.netPayable}</span>
              </div>
            </div>
          </div>

          <button onClick={handleGenerateLetter} className="btn-primary w-full flex items-center justify-center gap-2">
            <FileText size={18} /> Generate Settlement Letter
          </button>
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <Download size={18} /> Download Statement
          </button>
        </div>
      </div>
    </div>
  );
};

export default FnFList;
