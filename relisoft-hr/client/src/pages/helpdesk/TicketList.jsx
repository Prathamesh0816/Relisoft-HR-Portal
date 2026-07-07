import { useState, useEffect } from 'react';
import { Plus, MessageSquare, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ticketAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const priorityConfig = {
  Urgent: { color: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
  High: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
  Medium: { color: 'bg-relisoft-100 text-relisoft-800 border-relisoft-300', dot: 'bg-relisoft-500' },
  Low: { color: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-400' },
};

const categoryColors = {
  HR: 'border-l-4 border-l-pink-500',
  IT: 'border-l-4 border-l-relisoft-500',
  Admin: 'border-l-4 border-l-green-500',
};

const statusColors = {
  Open: 'badge-info',
  'In Progress': 'badge-warning',
  Resolved: 'badge-success',
  Closed: 'badge-gray',
};

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({ subject: '', category: '', priority: 'Medium', description: '' });
  const [comment, setComment] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;
      const { data } = await ticketAPI.getAll(params);
      setTickets(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filterCategory, filterPriority, filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ticketAPI.create(formData);
      toast.success('Ticket created');
      setShowCreateModal(false);
      setFormData({ subject: '', category: '', priority: 'Medium', description: '' });
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await ticketAPI.updateStatus(id, { status });
      toast.success(`Ticket ${status}`);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAddComment = async (ticketId) => {
    if (!comment.trim()) return;
    try {
      await ticketAPI.addComment(ticketId, { text: comment });
      toast.success('Comment added');
      setComment('');
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Helpdesk Tickets</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Ticket
        </button>
      </div>

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : tickets.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No tickets found</div>
        ) : (
          tickets.map((ticket, i) => {
            const isExpanded = expandedId === (ticket._id || i);
            const prio = priorityConfig[ticket.priority] || priorityConfig.Low;
            const catColor = categoryColors[ticket.category] || '';
            return (
              <div key={ticket._id || i} className={`card cursor-pointer transition-all ${catColor}`}>
                <div onClick={() => setExpandedId(isExpanded ? null : (ticket._id || i))} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${prio.dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{ticket.ticketId || ticket._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{ticket.category}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${prio.color}`}>{ticket.priority}</span>
                        <span className={`badge ${statusColors[ticket.status] || 'badge-gray'}`}>{ticket.status}</span>
                        <span className="text-xs text-gray-400">Assigned: {ticket.assignedTo?.name || ticket.assignedTo || '—'}</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{ticket.description || 'No description'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                      <div className="space-y-2 mb-3">
                        {(ticket.comments || []).length === 0 ? (
                          <p className="text-sm text-gray-400">No comments yet</p>
                        ) : (
                          ticket.comments.map((c, ci) => (
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
                      <div className="flex gap-2">
                        <input type="text" className="input-field flex-1" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                        <button onClick={() => handleAddComment(ticket._id)} className="btn-primary flex items-center gap-1"><MessageSquare size={16} /> Send</button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {ticket.status === 'Open' && (
                        <button onClick={() => handleStatus(ticket._id, 'In Progress')} className="btn-secondary text-xs flex items-center gap-1"><Clock size={14} /> Start Progress</button>
                      )}
                      {ticket.status === 'In Progress' && (
                        <button onClick={() => handleStatus(ticket._id, 'Resolved')} className="btn-success text-xs flex items-center gap-1"><CheckCircle size={14} /> Resolve</button>
                      )}
                      {(ticket.status === 'Resolved' || ticket.status === 'In Progress') && (
                        <button onClick={() => handleStatus(ticket._id, 'Closed')} className="btn-secondary text-xs flex items-center gap-1"><AlertCircle size={14} /> Close</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Ticket" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" className="input-field" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">Select</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Ticket</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketList;
