import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, FileText, Search, CheckCircle, XCircle, Archive, Eye, Download, CheckSquare } from 'lucide-react';
import { policyAPI, policyAcknowledgmentAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusBadges = {
  Active: 'badge-success',
  Draft: 'badge-warning',
  Archived: 'badge-gray',
};

const categoryColors = {
  HR: 'bg-pink-100 text-pink-700',
  IT: 'bg-relisoft-100 text-relisoft-700',
  Finance: 'bg-green-100 text-green-700',
  Compliance: 'bg-purple-100 text-purple-700',
  Operations: 'bg-blue-100 text-blue-700',
  Security: 'bg-red-100 text-red-700',
};

const PolicyList = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [acknowledgments, setAcknowledgments] = useState({ stats: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'HR', content: '', documentUrl: '',
    effectiveDate: '', expiryDate: '', applicableRoles: '',
    requiresAcknowledgment: false, status: 'Draft', version: '1.0',
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await policyAPI.getAll(params);
      setPolicies(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcknowledgmentData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        policyAcknowledgmentAPI.getStats(),
        policyAcknowledgmentAPI.getPending(),
      ]);
      setAcknowledgments({
        stats: Array.isArray(statsRes.data) ? statsRes.data : statsRes.data?.data || [],
        pending: Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.data || [],
      });
    } catch (err) {
      toast.error('Failed to fetch acknowledgment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'policies') {
      fetchPolicies();
    } else {
      fetchAcknowledgmentData();
    }
  }, [activeTab, filterCategory, filterStatus, search]);

  const resetForm = () => {
    setFormData({
      title: '', category: 'HR', content: '', documentUrl: '',
      effectiveDate: '', expiryDate: '', applicableRoles: '',
      requiresAcknowledgment: false, status: 'Draft', version: '1.0',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await policyAPI.create({
        ...formData,
        applicableRoles: formData.applicableRoles ? formData.applicableRoles.split(',').map((r) => r.trim()) : [],
      });
      toast.success('Policy created');
      setShowCreateModal(false);
      resetForm();
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await policyAPI.update(editingPolicy._id, {
        ...formData,
        applicableRoles: formData.applicableRoles ? formData.applicableRoles.split(',').map((r) => r.trim()) : [],
      });
      toast.success('Policy updated');
      setShowEditModal(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Are you sure you want to archive this policy?')) return;
    try {
      await policyAPI.archive(id);
      toast.success('Policy archived');
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this policy?')) return;
    try {
      await policyAPI.delete(id);
      toast.success('Policy deleted');
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAcknowledge = async (ackId) => {
    try {
      await policyAcknowledgmentAPI.acknowledge(ackId, {});
      toast.success('Policy acknowledged');
      fetchAcknowledgmentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge');
    }
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title || '',
      category: policy.category || 'HR',
      content: policy.content || '',
      documentUrl: policy.documentUrl || '',
      effectiveDate: policy.effectiveDate ? policy.effectiveDate.slice(0, 10) : '',
      expiryDate: policy.expiryDate ? policy.expiryDate.slice(0, 10) : '',
      applicableRoles: Array.isArray(policy.applicableRoles) ? policy.applicableRoles.join(', ') : (policy.applicableRoles || ''),
      requiresAcknowledgment: policy.requiresAcknowledgment || false,
      status: policy.status || 'Draft',
      version: policy.version || '1.0',
    });
    setShowEditModal(true);
  };

  const openViewModal = (policy) => {
    setViewingPolicy(policy);
    setShowViewModal(true);
  };

  const filteredPolicies = policies.filter((p) => {
    if (search) {
      const term = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(term) && !p.category?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Policies & Acknowledgments</h1>
        {activeTab === 'policies' && (
          <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Policy
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'policies'
              ? 'border-relisoft-500 text-relisoft-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} className="inline mr-1" /> Policies
        </button>
        <button
          onClick={() => setActiveTab('acknowledgments')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'acknowledgments'
              ? 'border-relisoft-500 text-relisoft-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckSquare size={16} className="inline mr-1" /> Acknowledgments
        </button>
      </div>

      {activeTab === 'policies' && (
        <>
          <div className="card flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search size={18} className="text-gray-400" />
              <input type="text" className="input-field flex-1" placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Category:</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-32">
                <option value="">All</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Compliance">Compliance</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-28">
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
              ))
            ) : filteredPolicies.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">No policies found</div>
            ) : (
              filteredPolicies.map((policy) => (
                <div key={policy._id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${categoryColors[policy.category] || 'bg-gray-100 text-gray-700'}`}>
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{policy.title}</h3>
                          <span className={`badge ${statusBadges[policy.status] || 'badge-gray'}`}>{policy.status}</span>
                          {policy.requiresAcknowledgment && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Requires Ack</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${categoryColors[policy.category] || 'bg-gray-100 text-gray-700'}`}>
                            {policy.category}
                          </span>
                          <span>v{policy.version || '1.0'}</span>
                          <span>Effective: {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : '—'}</span>
                          {policy.expiryDate && <span>Expires: {new Date(policy.expiryDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openViewModal(policy)} className="btn-secondary btn-sm" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEditModal(policy)} className="btn-secondary btn-sm" title="Edit"><Edit3 size={14} /></button>
                      {policy.status !== 'Archived' && (
                        <button onClick={() => handleArchive(policy._id)} className="btn-secondary btn-sm" title="Archive"><Archive size={14} /></button>
                      )}
                      <button onClick={() => handleDelete(policy._id)} className="btn-secondary btn-sm text-red-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'acknowledgments' && (
        <>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
            ))
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Acknowledgment Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acknowledgments.stats.length === 0 ? (
                    <div className="card text-center text-gray-500 py-6 col-span-full">No stats available</div>
                  ) : (
                    acknowledgments.stats.map((stat) => {
                      const pct = stat.total > 0 ? Math.round((stat.acknowledged / stat.total) * 100) : 0;
                      return (
                        <div key={stat._id || stat.policy?._id} className="card">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{stat.policy?.title || stat.policy}</h3>
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="text-gray-500">Pending: <span className="font-semibold text-yellow-600">{stat.total - stat.acknowledged}</span></span>
                            <span className="text-gray-500">Acknowledged: <span className="font-semibold text-green-600">{stat.acknowledged}/{stat.total}</span></span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block">{pct}% acknowledged</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Pending Acknowledgments</h2>
                {acknowledgments.pending.length === 0 ? (
                  <div className="card text-center text-gray-500 py-8">No pending acknowledgments</div>
                ) : (
                  <div className="space-y-3">
                    {acknowledgments.pending.map((ack) => (
                      <div key={ack._id} className="card flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{ack.policy?.title || ack.policy}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {ack.policy?.category && <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${categoryColors[ack.policy.category] || 'bg-gray-100 text-gray-700'}`}>{ack.policy.category}</span>}
                              {ack.policy?.version && <span className="ml-2">v{ack.policy.version}</span>}
                              {ack.createdAt && <span className="ml-2">Assigned: {new Date(ack.createdAt).toLocaleDateString()}</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAcknowledge(ack._id)}
                          className="btn-success flex items-center gap-1 text-sm"
                        >
                          <CheckCircle size={16} /> Acknowledge
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Policy" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Compliance">Compliance</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input type="text" className="input-field" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input type="date" className="input-field" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="input-field" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
              <input type="url" className="input-field" value={formData.documentUrl} onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Roles (comma separated)</label>
              <input type="text" className="input-field" value={formData.applicableRoles} onChange={(e) => setFormData({ ...formData, applicableRoles: e.target.value })} placeholder="e.g. Employee, Manager, HR" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea className="input-field" rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresAcknowledgment}
                  onChange={(e) => setFormData({ ...formData, requiresAcknowledgment: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Requires Employee Acknowledgment</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Policy</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingPolicy(null); resetForm(); }} title="Edit Policy" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Compliance">Compliance</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input type="text" className="input-field" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input type="date" className="input-field" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="input-field" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
              <input type="url" className="input-field" value={formData.documentUrl} onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Roles (comma separated)</label>
              <input type="text" className="input-field" value={formData.applicableRoles} onChange={(e) => setFormData({ ...formData, applicableRoles: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea className="input-field" rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresAcknowledgment}
                  onChange={(e) => setFormData({ ...formData, requiresAcknowledgment: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Requires Employee Acknowledgment</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowEditModal(false); setEditingPolicy(null); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Update Policy</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setViewingPolicy(null); }} title={viewingPolicy?.title || 'Policy'} size="lg">
        {viewingPolicy && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${statusBadges[viewingPolicy.status] || 'badge-gray'}`}>{viewingPolicy.status}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[viewingPolicy.category] || 'bg-gray-100 text-gray-700'}`}>{viewingPolicy.category}</span>
              <span className="text-xs text-gray-500">v{viewingPolicy.version || '1.0'}</span>
              {viewingPolicy.requiresAcknowledgment && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Requires Acknowledgment</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-medium text-gray-500">Effective Date</span>
                <p className="text-gray-900">{viewingPolicy.effectiveDate ? new Date(viewingPolicy.effectiveDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Expiry Date</span>
                <p className="text-gray-900">{viewingPolicy.expiryDate ? new Date(viewingPolicy.expiryDate).toLocaleDateString() : '—'}</p>
              </div>
              {viewingPolicy.applicableRoles && viewingPolicy.applicableRoles.length > 0 && (
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-500">Applicable Roles</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(Array.isArray(viewingPolicy.applicableRoles) ? viewingPolicy.applicableRoles : [viewingPolicy.applicableRoles]).map((role, ri) => (
                      <span key={ri} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{role}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {viewingPolicy.content || 'No content'}
              </div>
            </div>

            {viewingPolicy.documentUrl && (
              <div>
                <a href={viewingPolicy.documentUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm inline-flex items-center gap-1">
                  <Download size={14} /> Download Document
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PolicyList;
