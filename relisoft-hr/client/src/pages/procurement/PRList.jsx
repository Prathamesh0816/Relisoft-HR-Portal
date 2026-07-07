import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Send, CheckCircle, XCircle, ShoppingCart, Trash2, FileText } from 'lucide-react';
import { purchaseRequisitionAPI, vendorAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Draft: 'badge-gray',
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  Ordered: 'badge-info',
};

const urgencyColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

const PRList = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);
  const [approveComment, setApproveComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [formData, setFormData] = useState({
    title: '', department: '', urgency: 'Medium', notes: '',
    items: [{ description: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }],
  });

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterUrgency) params.urgency = filterUrgency;
      if (filterDepartment) params.department = filterDepartment;
      const apiCall = tab === 'my' ? purchaseRequisitionAPI.getAll({ ...params, mine: true }) : purchaseRequisitionAPI.getAll(params);
      const { data } = await apiCall;
      setPrs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch purchase requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPRs(); }, [tab, filterStatus, filterUrgency, filterDepartment]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await purchaseRequisitionAPI.create(formData);
      toast.success('Purchase requisition created');
      setShowCreateModal(false);
      setFormData({ title: '', department: '', urgency: 'Medium', notes: '', items: [{ description: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }] });
      fetchPRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await purchaseRequisitionAPI.submit(id);
      toast.success('PR submitted for approval');
      fetchPRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const handleApprove = async () => {
    if (!selectedPr) return;
    try {
      await purchaseRequisitionAPI.approve(selectedPr._id, { comment: approveComment });
      toast.success('PR approved');
      setShowApproveModal(false);
      setSelectedPr(null);
      setApproveComment('');
      fetchPRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedPr) return;
    try {
      await purchaseRequisitionAPI.reject(selectedPr._id, { reason: rejectReason });
      toast.success('PR rejected');
      setShowRejectModal(false);
      setSelectedPr(null);
      setRejectReason('');
      fetchPRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleConvertToPO = async (id) => {
    try {
      await purchaseRequisitionAPI.convertToPO(id);
      toast.success('Converted to Purchase Order');
      fetchPRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert');
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }] });
  };

  const removeItem = (idx) => {
    if (formData.items.length <= 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = value;
    setFormData({ ...formData, items });
  };

  const totalCost = (items) => items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.estimatedCost)), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchase Requisitions</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create PR
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab('my')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'my' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>My Requisitions</button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'all' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>All Requisitions</button>
      </div>

      <div className="card flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Ordered">Ordered</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Urgency:</label>
          <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Department:</label>
          <input type="text" placeholder="Filter dept..." value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="input-field w-36" />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : prs.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No purchase requisitions found</div>
        ) : (
          prs.map((pr, i) => {
            const isExpanded = expandedId === (pr._id || i);
            const items = pr.items || [];
            return (
              <div key={pr._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (pr._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{pr.prNumber || pr._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{pr.title || `PR #${pr.prNumber || pr._id?.slice(-6)}`}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{pr.requestedBy?.name || pr.requestedBy || '—'}</span>
                        <span className="text-xs text-gray-500">{pr.department}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${urgencyColors[pr.urgency] || urgencyColors.Medium}`}>{pr.urgency || 'Medium'}</span>
                        <span className={`badge ${statusColors[pr.status] || 'badge-gray'}`}>{pr.status || 'Draft'}</span>
                        {items.length > 0 && <span className="text-xs text-gray-400">{items.length} item(s)</span>}
                        <span className="text-xs font-medium text-gray-700">${totalCost(items).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Line Items</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Qty</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Unit</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Unit Cost</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-center">{item.unit}</td>
                              <td className="px-3 py-2 text-right">${Number(item.estimatedCost).toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-medium">${(Number(item.quantity) * Number(item.estimatedCost)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-semibold">
                            <td colSpan={4} className="px-3 py-2 text-right">Total:</td>
                            <td className="px-3 py-2 text-right">${totalCost(items).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {pr.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{pr.notes}</p>
                      </div>
                    )}

                    {pr.approvalComment && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Approval Comment</h4>
                        <p className="text-sm text-gray-600">{pr.approvalComment}</p>
                      </div>
                    )}

                    {pr.rejectionReason && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-600">{pr.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {pr.status === 'Draft' && (
                        <button onClick={() => handleSubmit(pr._id)} className="btn-primary text-xs flex items-center gap-1"><Send size={14} /> Submit</button>
                      )}
                      {pr.status === 'Pending' && (
                        <>
                          <button onClick={() => { setSelectedPr(pr); setShowApproveModal(true); }} className="btn-success text-xs flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                          <button onClick={() => { setSelectedPr(pr); setShowRejectModal(true); }} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Reject</button>
                        </>
                      )}
                      {pr.status === 'Approved' && (
                        <button onClick={() => handleConvertToPO(pr._id)} className="btn-primary text-xs flex items-center gap-1"><ShoppingCart size={14} /> Convert to PO</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Purchase Requisition" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" className="input-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select className="input-field" value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button type="button" onClick={addItem} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Add Item</button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input type="text" placeholder="Description" className="input-field flex-1" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
                  <input type="number" placeholder="Qty" className="input-field w-16" value={item.quantity} min="1" onChange={(e) => updateItem(idx, 'quantity', Math.max(1, e.target.value))} required />
                  <select className="input-field w-20" value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)}>
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="hrs">hrs</option>
                    <option value="days">days</option>
                    <option value="months">months</option>
                    <option value="units">units</option>
                  </select>
                  <input type="number" placeholder="Cost" className="input-field w-24" value={item.estimatedCost} min="0" step="0.01" onChange={(e) => updateItem(idx, 'estimatedCost', e.target.value)} required />
                  <span className="text-sm font-medium text-gray-700 pt-2 w-20 text-right">${(Number(item.quantity) * Number(item.estimatedCost)).toFixed(2)}</span>
                  <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="text-right mt-2 text-sm font-semibold text-gray-700">Total: ${totalCost(formData.items).toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create PR</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showApproveModal} onClose={() => { setShowApproveModal(false); setSelectedPr(null); setApproveComment(''); }} title="Approve PR" size="md">
        {selectedPr && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Approve PR #{selectedPr.prNumber || selectedPr._id?.slice(-6)}?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea className="input-field" rows={3} value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Approval notes..." />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowApproveModal(false); setSelectedPr(null); setApproveComment(''); }} className="btn-secondary">Cancel</button>
              <button onClick={handleApprove} className="btn-success flex items-center gap-1"><CheckCircle size={16} /> Approve</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setSelectedPr(null); setRejectReason(''); }} title="Reject PR" size="md">
        {selectedPr && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Reject PR #{selectedPr.prNumber || selectedPr._id?.slice(-6)}?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
              <textarea className="input-field" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowRejectModal(false); setSelectedPr(null); setRejectReason(''); }} className="btn-secondary">Cancel</button>
              <button onClick={handleReject} className="btn-danger flex items-center gap-1" disabled={!rejectReason.trim()}><XCircle size={16} /> Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PRList;
