import { useState, useEffect } from 'react';
import { UserX, CheckCircle, XCircle, Clock, FileText, DollarSign, Send, AlertCircle } from 'lucide-react';
import { separationAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const clearanceDepartments = ['IT', 'HR', 'Finance', 'Admin', 'Operations'];

const clearanceColors = {
  Pending: 'badge-warning',
  Cleared: 'badge-success',
  Hold: 'badge-danger',
};

const SeparationMy = () => {
  const [separation, setSeparation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlement, setSettlement] = useState(null);
  const [resignForm, setResignForm] = useState({ resignationDate: '', lastWorkingDay: '', reason: '' });
  const [exitForm, setExitForm] = useState({
    reasonForLeaving: '', feedback: '', suggestions: '', wouldRejoin: 'yes',
  });

  const fetchMySeparation = async () => {
    setLoading(true);
    try {
      const { data } = await separationAPI.getMySeparation();
      setSeparation(data || null);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch separation data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMySeparation(); }, []);

  const handleResign = async (e) => {
    e.preventDefault();
    try {
      const { data } = await separationAPI.initiate(resignForm);
      setSeparation(data);
      toast.success('Resignation submitted');
      setShowResignModal(false);
      setResignForm({ resignationDate: '', lastWorkingDay: '', reason: '' });
      fetchMySeparation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resignation');
    }
  };

  const handleExitSubmit = async (e) => {
    e.preventDefault();
    if (!separation) return;
    try {
      await separationAPI.updateClearance(separation._id, { exitInterview: exitForm });
      toast.success('Exit interview submitted');
      setShowExitModal(false);
      fetchMySeparation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit exit interview');
    }
  };

  const handleCalculate = async () => {
    if (!separation) return;
    try {
      const { data } = await separationAPI.calculate(separation._id);
      setSettlement(data);
      setShowSettlementModal(true);
    } catch (err) {
      toast.error('Failed to calculate settlement');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Separation</h1>
        {!separation && (
          <button onClick={() => setShowResignModal(true)} className="btn-danger flex items-center gap-2">
            <UserX size={18} /> Resign
          </button>
        )}
      </div>

      {loading ? (
        <div className="card animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ) : !separation ? (
        <div className="card text-center py-12">
          <UserX size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">No Active Resignation</h2>
          <p className="text-gray-500 mb-6">You have not submitted any resignation request yet.</p>
          <button onClick={() => setShowResignModal(true)} className="btn-danger flex items-center gap-2 mx-auto"><UserX size={18} /> Submit Resignation</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-header mb-0">Resignation Status</h2>
              <span className={`badge ${separation.status === 'Completed' ? 'badge-success' : separation.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                {separation.status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Resignation Date</p>
                <p className="text-lg font-semibold text-gray-900">{separation.resignationDate ? new Date(separation.resignationDate).toLocaleDateString() : '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Last Working Day</p>
                <p className="text-lg font-semibold text-gray-900">{separation.lastWorkingDay ? new Date(separation.lastWorkingDay).toLocaleDateString() : '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-lg font-semibold text-gray-900">{separation.type || 'Resignation'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-header">Clearance Tracker</h2>
            <div className="space-y-3">
              {clearanceDepartments.map((dept) => {
                const c = separation.clearances?.find((cl) => cl.department === dept);
                const status = c?.status || 'Pending';
                return (
                  <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{dept}</span>
                    <div className="flex items-center gap-2">
                      {status === 'Cleared' ? <CheckCircle size={16} className="text-green-500" /> : status === 'Hold' ? <AlertCircle size={16} className="text-red-500" /> : <Clock size={16} className="text-yellow-500" />}
                      <span className={`badge ${clearanceColors[status] || 'badge-gray'}`}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowExitModal(true)} className="btn-primary flex items-center gap-2"><FileText size={16} /> Exit Interview</button>
            <button onClick={handleCalculate} className="btn-secondary flex items-center gap-2"><DollarSign size={16} /> View Settlement</button>
          </div>
        </div>
      )}

      <Modal isOpen={showResignModal} onClose={() => setShowResignModal(false)} title="Submit Resignation">
        <form onSubmit={handleResign} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resignation Date</label>
              <input type="date" className="input-field" value={resignForm.resignationDate} onChange={(e) => setResignForm({ ...resignForm, resignationDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Working Day</label>
              <input type="date" className="input-field" value={resignForm.lastWorkingDay} onChange={(e) => setResignForm({ ...resignForm, lastWorkingDay: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
            <textarea className="input-field" rows={3} value={resignForm.reason} onChange={(e) => setResignForm({ ...resignForm, reason: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowResignModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-danger flex items-center gap-2"><Send size={16} /> Submit Resignation</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Exit Interview" size="lg">
        <form onSubmit={handleExitSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Reason for Leaving</label>
            <select className="input-field" value={exitForm.reasonForLeaving} onChange={(e) => setExitForm({ ...exitForm, reasonForLeaving: e.target.value })} required>
              <option value="">Select Reason</option>
              <option value="Better Opportunity">Better Opportunity</option>
              <option value="Career Growth">Career Growth</option>
              <option value="Work-Life Balance">Work-Life Balance</option>
              <option value="Relocation">Relocation</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea className="input-field" rows={3} value={exitForm.feedback} onChange={(e) => setExitForm({ ...exitForm, feedback: e.target.value })} placeholder="Any feedback about the company..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions for Improvement</label>
            <textarea className="input-field" rows={3} value={exitForm.suggestions} onChange={(e) => setExitForm({ ...exitForm, suggestions: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Would you rejoin?</label>
            <select className="input-field" value={exitForm.wouldRejoin} onChange={(e) => setExitForm({ ...exitForm, wouldRejoin: e.target.value })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowExitModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Submit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSettlementModal} onClose={() => setShowSettlementModal(null)} title="FnF Settlement Details" size="lg">
        {settlement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Payable</p>
                <p className="text-2xl font-bold text-gray-900">${settlement.totalPayable || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">${settlement.totalDeductions || 0}</p>
              </div>
            </div>
            {settlement.breakdown && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(settlement.breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">${val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Net Payable</p>
              <p className="text-3xl font-bold text-green-700">${settlement.netPayable || 0}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SeparationMy;
