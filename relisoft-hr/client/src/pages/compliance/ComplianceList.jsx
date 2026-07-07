import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, Calendar, Clock, FileText } from 'lucide-react';
import { complianceAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  Completed: 'badge-success',
  Overdue: 'badge-danger',
};

const ComplianceList = () => {
  const [compliances, setCompliances] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({ name: '', type: '', dueDate: '', description: '' });
  const [completeNotes, setCompleteNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const [complianceRes, upcomingRes] = await Promise.all([
        complianceAPI.getAll(params),
        complianceAPI.getUpcoming(),
      ]);
      const data = Array.isArray(complianceRes.data) ? complianceRes.data : complianceRes.data?.data || [];
      const upcomingData = Array.isArray(upcomingRes.data) ? upcomingRes.data : upcomingRes.data?.data || [];
      setCompliances(data);
      setUpcoming(upcomingData);
    } catch (err) {
      toast.error('Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterType, filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await complianceAPI.create(formData);
      toast.success('Compliance record created');
      setShowAddModal(false);
      setFormData({ name: '', type: '', dueDate: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleComplete = async () => {
    if (!showCompleteModal) return;
    try {
      await complianceAPI.complete(showCompleteModal._id, { notes: completeNotes });
      toast.success('Compliance marked as complete');
      setShowCompleteModal(null);
      setCompleteNotes('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const isOverdue = (item) => item.status !== 'Completed' && new Date(item.dueDate) < new Date();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Compliance Tracking</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Compliance
        </button>
      </div>

      {upcoming.length > 0 && (
        <div className="card border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Upcoming Compliances (Due within 30 days)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcoming.map((item, i) => (
              <div key={item._id || i} className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${isOverdue(item) ? 'badge-danger' : statusColors[item.status] || 'badge-gray'}`}>
                  {isOverdue(item) ? 'Overdue' : item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-40">
            <option value="">All Types</option>
            <option value="Statutory">Statutory</option>
            <option value="Tax">Tax</option>
            <option value="Legal">Legal</option>
            <option value="ISO">ISO</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : compliances.length === 0 ? (
                <tr><td colSpan={5} className="table-cell text-center text-gray-500 py-8">No compliance records found</td></tr>
              ) : (
                compliances.map((item, i) => {
                  const overdue = isOverdue(item);
                  return (
                    <tr key={item._id || i} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium">{item.name}</td>
                      <td className="table-cell"><span className="flex items-center gap-1"><FileText size={14} />{item.type}</span></td>
                      <td className="table-cell"><span className="flex items-center gap-1"><Calendar size={14} />{new Date(item.dueDate).toLocaleDateString()}</span></td>
                      <td className="table-cell">
                        <span className={`badge ${overdue ? 'badge-danger' : statusColors[item.status] || 'badge-gray'}`}>
                          {overdue ? 'Overdue' : item.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {item.status !== 'Completed' && (
                          <button onClick={() => { setShowCompleteModal(item); setCompleteNotes(''); }} className="btn-success text-xs px-2 py-1 flex items-center gap-1">
                            <CheckCircle size={14} /> Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Compliance">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Statutory">Statutory</option>
                <option value="Tax">Tax</option>
                <option value="Legal">Legal</option>
                <option value="ISO">ISO</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input-field" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showCompleteModal} onClose={() => setShowCompleteModal(null)} title="Mark Compliance Complete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Mark <strong>{showCompleteModal?.name}</strong> as completed?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
            <textarea className="input-field" rows={3} value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} placeholder="Add any notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCompleteModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleComplete} className="btn-success flex items-center gap-2"><CheckCircle size={16} /> Mark Complete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplianceList;
