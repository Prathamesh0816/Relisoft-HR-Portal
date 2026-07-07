import { useState, useEffect } from 'react';
import { Plus, UserX, CheckCircle, XCircle, DollarSign, FileText, Clock } from 'lucide-react';
import { separationAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatsCard from '../../components/common/StatsCard';
import toast from 'react-hot-toast';

const clearanceDepartments = ['IT', 'HR', 'Finance', 'Admin', 'Operations'];

const statusColors = {
  Initiated: 'badge-warning',
  'In Progress': 'badge-info',
  Completed: 'badge-success',
};

const clearanceColors = {
  Pending: 'badge-warning',
  Cleared: 'badge-success',
  Hold: 'badge-danger',
};

const SeparationList = () => {
  const [separations, setSeparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(null);
  const [showSettlementModal, setShowSettlementModal] = useState(null);
  const [settlementData, setSettlementData] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', resignationDate: '', lastWorkingDay: '', type: '', reason: '',
  });
  const [clearanceUpdates, setClearanceUpdates] = useState({});

  const fetchSeparations = async () => {
    setLoading(true);
    try {
      const { data } = await separationAPI.getAll();
      setSeparations(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch separations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeparations(); }, []);

  const handleInitiate = async (e) => {
    e.preventDefault();
    try {
      await separationAPI.initiate(formData);
      toast.success('Separation initiated');
      setShowInitiateModal(false);
      setFormData({ employeeId: '', resignationDate: '', lastWorkingDay: '', type: '', reason: '' });
      fetchSeparations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate');
    }
  };

  const handleUpdateClearance = async () => {
    if (!showClearanceModal) return;
    try {
      await separationAPI.updateClearance(showClearanceModal._id, clearanceUpdates);
      toast.success('Clearance updated');
      setShowClearanceModal(null);
      setClearanceUpdates({});
      fetchSeparations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update clearance');
    }
  };

  const handleCalculate = async (id) => {
    try {
      const { data } = await separationAPI.calculate(id);
      setSettlementData(data);
      setShowSettlementModal(true);
    } catch (err) {
      toast.error('Failed to calculate settlement');
    }
  };

  const completeSeparation = async (id) => {
    if (!window.confirm('Complete this separation? This action is irreversible.')) return;
    try {
      await separationAPI.complete(id);
      toast.success('Separation completed');
      fetchSeparations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const getClearanceStatus = (sep, dept) => {
    const c = sep.clearances?.find((cl) => cl.department === dept);
    return c?.status || 'Pending';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Exit Management</h1>
        <button onClick={() => setShowInitiateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Initiate Separation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={separations.length} icon={UserX} color="relisoft" />
        <StatsCard title="Initiated" value={separations.filter((s) => s.status === 'Initiated').length} icon={Clock} color="yellow" />
        <StatsCard title="In Progress" value={separations.filter((s) => s.status === 'In Progress').length} icon={FileText} color="relisoft" />
        <StatsCard title="Completed" value={separations.filter((s) => s.status === 'Completed').length} icon={CheckCircle} color="green" />
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Employee</th>
                <th className="table-header">Resignation Date</th>
                <th className="table-header">Last Working Day</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Clearance</th>
                <th className="table-header">FnF</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : separations.length === 0 ? (
                <tr><td colSpan={8} className="table-cell text-center text-gray-500 py-8">No separations found</td></tr>
              ) : (
                separations.map((sep, i) => (
                  <tr key={sep._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{sep.employee?.name || '—'}</td>
                    <td className="table-cell">{sep.resignationDate ? new Date(sep.resignationDate).toLocaleDateString() : '—'}</td>
                    <td className="table-cell">{sep.lastWorkingDay ? new Date(sep.lastWorkingDay).toLocaleDateString() : '—'}</td>
                    <td className="table-cell">{sep.type || '—'}</td>
                    <td className="table-cell"><span className={`badge ${statusColors[sep.status] || 'badge-gray'}`}>{sep.status}</span></td>
                    <td className="table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {clearanceDepartments.map((dept) => {
                          const status = getClearanceStatus(sep, dept);
                          return (
                            <span key={dept} className={`badge ${clearanceColors[status] || 'badge-gray'} text-[10px]`} title={dept}>
                              {dept[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${sep.fnfStatus === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                        {sep.fnfStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setShowClearanceModal(sep); setClearanceUpdates({}); }} className="btn-secondary text-xs px-2 py-1">Clearance</button>
                        <button onClick={() => handleCalculate(sep._id)} className="btn-primary text-xs px-2 py-1 flex items-center gap-1"><DollarSign size={12} /> FnF</button>
                        {sep.status !== 'Completed' && (
                          <button onClick={() => completeSeparation(sep._id)} className="btn-success text-xs px-2 py-1"><CheckCircle size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showInitiateModal} onClose={() => setShowInitiateModal(false)} title="Initiate Separation" size="lg">
        <form onSubmit={handleInitiate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input type="text" className="input-field" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resignation Date</label>
              <input type="date" className="input-field" value={formData.resignationDate} onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Working Day</label>
              <input type="date" className="input-field" value={formData.lastWorkingDay} onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Resignation">Resignation</option>
                <option value="Retirement">Retirement</option>
                <option value="Termination">Termination</option>
                <option value="Mutual Separation">Mutual Separation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea className="input-field" rows={2} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowInitiateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Initiate Separation</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showClearanceModal} onClose={() => setShowClearanceModal(null)} title="Clearance Tracker" size="lg">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            Employee: <span className="text-gray-900">{showClearanceModal?.employee?.name}</span>
          </p>
          <div className="space-y-3">
            {clearanceDepartments.map((dept) => {
              const currentStatus = getClearanceStatus(showClearanceModal, dept);
              return (
                <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{dept}</p>
                    <span className={`badge ${clearanceColors[currentStatus] || 'badge-gray'}`}>{currentStatus}</span>
                  </div>
                  <select
                    className="input-field w-32"
                    value={clearanceUpdates[dept] || currentStatus}
                    onChange={(e) => setClearanceUpdates({ ...clearanceUpdates, [dept]: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Hold">Hold</option>
                  </select>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowClearanceModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleUpdateClearance} className="btn-primary">Update Clearance</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showSettlementModal} onClose={() => setShowSettlementModal(null)} title="Settlement Calculation" size="lg">
        {settlementData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Payable</p>
                <p className="text-2xl font-bold text-gray-900">${settlementData.totalPayable || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">${settlementData.totalDeductions || 0}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Net Payable</p>
              <p className="text-3xl font-bold text-green-700">${settlementData.netPayable || 0}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button className="btn-primary flex items-center gap-2"><FileText size={16} /> Generate Settlement Letter</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SeparationList;
