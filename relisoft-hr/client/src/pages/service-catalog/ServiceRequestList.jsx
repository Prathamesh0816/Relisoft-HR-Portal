import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, AlertTriangle, Send, MessageSquare, Eye } from 'lucide-react';
import { serviceRequestAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  Submitted: 'badge-info',
  Approved: 'badge-success',
  'In Progress': 'badge-info',
  Fulfilled: 'badge-success',
  Rejected: 'badge-danger',
  Cancelled: 'badge-gray',
};

const priorityColors = {
  Urgent: 'bg-red-100 text-red-800 border-red-300',
  High: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Medium: 'bg-relisoft-100 text-relisoft-800 border-relisoft-300',
  Low: 'bg-gray-100 text-gray-800 border-gray-300',
};

const ServiceRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentRequestId, setCommentRequestId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      const { data } = await serviceRequestAPI.getAll(params);
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filterStatus, filterPriority, filterCategory]);

  const isSLABreached = (req) => {
    if (!req.slaDeadline) return false;
    return new Date(req.slaDeadline) < new Date() && req.status !== 'Fulfilled' && req.status !== 'Cancelled' && req.status !== 'Rejected';
  };

  const getSLATimeLeft = (req) => {
    if (!req.slaDeadline) return null;
    const diff = new Date(req.slaDeadline) - new Date();
    if (diff <= 0) return 'Breached';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const handleAction = async (id, action) => {
    try {
      const actionMap = {
        approve: () => serviceRequestAPI.approve(id, {}),
        reject: () => serviceRequestAPI.reject(id, { reason: prompt('Reason for rejection:') || 'No reason' }),
        fulfill: () => serviceRequestAPI.fulfill(id),
        cancel: () => serviceRequestAPI.cancel(id),
      };
      await actionMap[action]();
      toast.success(`Request ${action}d`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !commentRequestId) return;
    try {
      await serviceRequestAPI.addComment(commentRequestId, { text: commentText });
      toast.success('Comment added');
      setCommentText('');
      setShowCommentModal(false);
      setCommentRequestId(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const openCommentModal = (id) => {
    setCommentRequestId(id);
    setCommentText('');
    setShowCommentModal(true);
  };

  const openDetailModal = (req) => {
    setDetailRequest(req);
    setShowDetailModal(true);
  };

  const canApprove = (req) => req.status === 'Submitted';
  const canReject = (req) => req.status === 'Submitted' || req.status === 'Pending' || req.status === 'Approved';
  const canFulfill = (req) => req.status === 'Approved' || req.status === 'In Progress';
  const canCancel = (req) => req.status === 'Pending' || req.status === 'Submitted';

  const filteredRequests = requests.filter((req) => {
    if (search) {
      const term = search.toLowerCase();
      if (!req.requestId?.toLowerCase().includes(term) && !req.serviceItem?.name?.toLowerCase().includes(term) && !req.employee?.name?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Service Requests</h1>
        <span className="text-sm text-gray-500">{requests.length} total</span>
      </div>

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input type="text" className="input-field flex-1" placeholder="Search by ID, service, employee..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-32">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-28">
            <option value="">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No requests found</div>
        ) : (
          filteredRequests.map((req, i) => {
            const isExpanded = expandedId === (req._id || i);
            const breached = isSLABreached(req);
            const slaTime = getSLATimeLeft(req);
            return (
              <div key={req._id || i} className={`card transition-all ${breached ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{req.requestId || req._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{req.serviceItem?.name || req.serviceItem}</h3>
                        {breached && <AlertTriangle size={16} className="text-red-500 flex-shrink-0" title="SLA Breached" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">{req.employee?.name || req.employee || '—'}</span>
                        <span className={`badge ${statusColors[req.status] || 'badge-gray'}`}>{req.status}</span>
                        {req.priority && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[req.priority] || priorityColors.Medium}`}>{req.priority}</span>
                        )}
                        <span className="text-xs text-gray-500">{req.serviceItem?.category?.name || req.category}</span>
                        {slaTime && (
                          <span className={`text-xs flex items-center gap-1 ${breached ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            <Clock size={12} /> {slaTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetailModal(req)} className="btn-secondary btn-sm flex items-center gap-1" title="View Detail"><Eye size={14} /></button>
                    <button onClick={() => openCommentModal(req._id)} className="btn-secondary btn-sm flex items-center gap-1" title="Add Comment"><MessageSquare size={14} /></button>
                    <button onClick={() => setExpandedId(isExpanded ? null : (req._id || i))} className="btn-secondary btn-sm">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Chain</h4>
                      {(req.approvals || []).length === 0 ? (
                        <p className="text-sm text-gray-400">No approvals configured</p>
                      ) : (
                        <div className="space-y-2">
                          {req.approvals.map((a, ai) => (
                            <div key={ai} className="flex items-center gap-2 text-sm">
                              {a.status === 'Approved' ? <CheckCircle size={16} className="text-green-500" /> :
                               a.status === 'Rejected' ? <XCircle size={16} className="text-red-500" /> :
                               <Clock size={16} className="text-yellow-500" />}
                              <span className="font-medium">{a.approver?.name || 'Pending'}</span>
                              <span className={`badge ${statusColors[a.status] || 'badge-gray'}`}>{a.status || 'Pending'}</span>
                              {a.comment && <span className="text-xs text-gray-400">— {a.comment}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                      <div className="space-y-2 mb-3">
                        {(req.comments || []).length === 0 ? (
                          <p className="text-sm text-gray-400">No comments</p>
                        ) : (
                          req.comments.map((c, ci) => (
                            <div key={ci} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">{c.user?.name || 'User'}</span>
                                <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                              </div>
                              <p className="text-sm text-gray-600">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 flex-wrap">
                      {canApprove(req) && <button onClick={() => handleAction(req._id, 'approve')} className="btn-success text-xs flex items-center gap-1"><CheckCircle size={14} /> Approve</button>}
                      {canReject(req) && <button onClick={() => handleAction(req._id, 'reject')} className="btn-danger text-xs flex items-center gap-1"><XCircle size={14} /> Reject</button>}
                      {canFulfill(req) && <button onClick={() => handleAction(req._id, 'fulfill')} className="btn-primary text-xs flex items-center gap-1"><CheckCircle size={14} /> Fulfill</button>}
                      {canCancel(req) && <button onClick={() => handleAction(req._id, 'cancel')} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Cancel</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCommentModal} onClose={() => { setShowCommentModal(false); setCommentRequestId(null); }} title="Add Comment" size="md">
        <div className="space-y-4">
          <textarea className="input-field" rows={4} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Type your comment..." />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowCommentModal(false); setCommentRequestId(null); }} className="btn-secondary">Cancel</button>
            <button onClick={handleAddComment} className="btn-primary flex items-center gap-1"><Send size={16} /> Send</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setDetailRequest(null); }} title={`Request #${detailRequest?.requestId || detailRequest?._id?.slice(-6) || ''}`} size="lg">
        {detailRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Service Item</label>
                <p className="text-sm text-gray-900">{detailRequest.serviceItem?.name || detailRequest.serviceItem}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Employee</label>
                <p className="text-sm text-gray-900">{detailRequest.employee?.name || detailRequest.employee}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <p><span className={`badge ${statusColors[detailRequest.status] || 'badge-gray'}`}>{detailRequest.status}</span></p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Priority</label>
                <p className="text-sm text-gray-900">{detailRequest.priority || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Created</label>
                <p className="text-sm text-gray-900">{detailRequest.createdAt ? new Date(detailRequest.createdAt).toLocaleString() : '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">SLA Deadline</label>
                <p className={`text-sm ${isSLABreached(detailRequest) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {detailRequest.slaDeadline ? new Date(detailRequest.slaDeadline).toLocaleString() : '—'}
                  {isSLABreached(detailRequest) && <AlertTriangle size={14} className="inline ml-1 text-red-500" />}
                </p>
              </div>
            </div>

            {detailRequest.fields && Object.keys(detailRequest.fields).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Request Fields</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  {Object.entries(detailRequest.fields).map(([key, val]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-700">{key}:</span> {Array.isArray(val) ? val.join(', ') : String(val)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Chain</h4>
              <div className="space-y-2">
                {(detailRequest.approvals || []).length === 0 ? (
                  <p className="text-sm text-gray-400">No approvals configured</p>
                ) : (
                  detailRequest.approvals.map((a, ai) => (
                    <div key={ai} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
                      {a.status === 'Approved' ? <CheckCircle size={16} className="text-green-500" /> :
                       a.status === 'Rejected' ? <XCircle size={16} className="text-red-500" /> :
                       <Clock size={16} className="text-yellow-500" />}
                      <span className="font-medium">{a.approver?.name || 'Pending'}</span>
                      <span className={`badge ${statusColors[a.status] || 'badge-gray'}`}>{a.status || 'Pending'}</span>
                      {a.comment && <span className="text-xs text-gray-400 ml-2">— {a.comment}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
              <div className="space-y-2">
                {(detailRequest.comments || []).length === 0 ? (
                  <p className="text-sm text-gray-400">No comments</p>
                ) : (
                  detailRequest.comments.map((c, ci) => (
                    <div key={ci} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{c.user?.name || 'User'}</span>
                        <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceRequestList;
