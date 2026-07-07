import { useState, useEffect } from 'react';
import { Plus, Plane, CheckCircle, XCircle, Clock, DollarSign, Upload } from 'lucide-react';
import { travelAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  Reimbursed: 'badge-info',
};

const TravelList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(null);
  const [formData, setFormData] = useState({
    type: '', fromDate: '', toDate: '', from: '', to: '',
    purpose: '', mode: '', estimatedAmount: '', notes: '',
  });
  const [expenseData, setExpenseData] = useState({ amount: '', description: '', bill: null });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'my') {
        const res = await travelAPI.getMyRequests();
        data = res.data;
      } else {
        const res = await travelAPI.getAll();
        data = res.data;
      }
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch travel requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await travelAPI.create(formData);
      toast.success('Travel request created');
      setShowCreateModal(false);
      setFormData({ type: '', fromDate: '', toDate: '', from: '', to: '', purpose: '', mode: '', estimatedAmount: '', notes: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await travelAPI.updateStatus(id, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!showExpenseModal) return;
    try {
      const form = new FormData();
      form.append('amount', expenseData.amount);
      form.append('description', expenseData.description);
      if (expenseData.bill) form.append('bill', expenseData.bill);
      await travelAPI.submitExpense(showExpenseModal._id, form);
      toast.success('Expense submitted');
      setShowExpenseModal(null);
      setExpenseData({ amount: '', description: '', bill: null });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit expense');
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'my', label: 'My Requests' },
    { key: 'pending', label: 'Pending Approval' },
  ];

  const filtered = activeTab === 'pending'
    ? requests.filter((r) => r.status === 'Pending')
    : requests;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Travel & Expense</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Travel Request
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Employee</th>
                <th className="table-header">Type</th>
                <th className="table-header">From → To</th>
                <th className="table-header">Dates</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center text-gray-500 py-8">No requests found</td></tr>
              ) : (
                filtered.map((req, i) => (
                  <tr key={req._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{req.employee?.name || '—'}</td>
                    <td className="table-cell"><span className="flex items-center gap-1"><Plane size={14} />{req.type}</span></td>
                    <td className="table-cell">{req.from} → {req.to}</td>
                    <td className="table-cell">{req.fromDate ? new Date(req.fromDate).toLocaleDateString() : ''} - {req.toDate ? new Date(req.toDate).toLocaleDateString() : ''}</td>
                    <td className="table-cell font-medium">${req.estimatedAmount || req.expenseAmount || 0}</td>
                    <td className="table-cell"><span className={`badge ${statusColors[req.status] || 'badge-gray'}`}>{req.status}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {req.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatus(req._id, 'Approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle size={16} /></button>
                            <button onClick={() => handleStatus(req._id, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XCircle size={16} /></button>
                          </>
                        )}
                        {req.status === 'Approved' && !req.expenseSubmitted && (
                          <button onClick={() => { setShowExpenseModal(req); setExpenseData({ amount: '', description: '', bill: null }); }} className="btn-success text-xs px-2 py-1 flex items-center gap-1"><DollarSign size={14} /> Expense</button>
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Travel Request" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select className="input-field" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })}>
                <option value="">Select Mode</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Cab">Cab</option>
                <option value="Own Vehicle">Own Vehicle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="text" className="input-field" value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="text" className="input-field" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input type="date" className="input-field" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input type="date" className="input-field" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <textarea className="input-field" rows={2} value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount ($)</label>
              <input type="number" className="input-field" value={formData.estimatedAmount} onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Request</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showExpenseModal} onClose={() => setShowExpenseModal(null)} title="Submit Expense">
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" className="input-field" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bill</label>
            <input type="file" className="input-field" onChange={(e) => setExpenseData({ ...expenseData, bill: e.target.files[0] })} accept="image/*,.pdf" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowExpenseModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Upload size={16} /> Submit Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TravelList;
