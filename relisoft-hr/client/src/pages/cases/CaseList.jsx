import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Search, AlertTriangle, Shield, Search as SearchIcon, Users, Eye, ChevronDown, ChevronRight, FileText, UserCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { caseAPI } from '../../services/api';

const typeIcons = {
  Grievance: AlertTriangle,
  Disciplinary: Shield,
  Investigation: SearchIcon,
  Conflict: Users,
  Whistleblower: Eye,
};

const typeColors = {
  Grievance: 'bg-red-100 text-red-800',
  Disciplinary: 'bg-orange-100 text-orange-800',
  Investigation: 'bg-blue-100 text-blue-800',
  Conflict: 'bg-amber-100 text-amber-800',
  Whistleblower: 'bg-purple-100 text-purple-800',
};

const severityColors = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-amber-100 text-amber-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-blue-100 text-blue-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  Open: 'bg-green-100 text-green-800',
  UnderInvestigation: 'bg-blue-100 text-blue-800',
  PendingDecision: 'bg-amber-100 text-amber-800',
  Resolved: 'bg-gray-100 text-gray-800',
  Closed: 'bg-gray-100 text-gray-800',
  Dismissed: 'bg-red-100 text-red-800',
};

const caseTypes = ['Grievance', 'Disciplinary', 'Investigation', 'Conflict', 'Whistleblower'];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Open', 'UnderInvestigation', 'PendingDecision', 'Resolved', 'Closed', 'Dismissed'];

export default function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '', type: '', category: '', severity: 'Medium', priority: 'Medium',
    description: '', confidential: false, allowAnonymous: false, reportedEmployee: '',
  });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', type: '', severity: '' });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [investigatorInput, setInvestigatorInput] = useState('');
  const [resolveForm, setResolveForm] = useState({ resolution: '', action: '' });

  useEffect(() => { loadCases(); }, [filters]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      const { data } = await caseAPI.list(params);
      setCases(data?.cases || data?.data || data || []);
    } catch (err) {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await caseAPI.getById(id);
      setDetail(data?.case || data?.data || data);
      const timelineRes = await caseAPI.getTimeline(id);
      const docsRes = await caseAPI.getDocuments(id);
      setDetail(prev => ({
        ...(prev || {}),
        timeline: timelineRes.data?.timeline || timelineRes.data?.data || [],
        documents: docsRes.data?.documents || docsRes.data?.data || [],
      }));
    } catch {
      toast.error('Failed to load case details');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
    } else {
      setExpandedId(id);
      await loadDetail(id);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await caseAPI.create(form);
      toast.success('Case created');
      setShowAddModal(false);
      setForm({ title: '', type: '', category: '', severity: 'Medium', priority: 'Medium', description: '', confidential: false, allowAnonymous: false, reportedEmployee: '' });
      loadCases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create case');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!investigatorInput.trim()) { toast.error('Enter investigator name'); return; }
    try {
      await caseAPI.assignInvestigator(expandedId, { investigator: investigatorInput });
      toast.success('Investigator assigned');
      setShowAssignModal(false);
      setInvestigatorInput('');
      loadDetail(expandedId);
    } catch {
      toast.error('Failed to assign');
    }
  };

  const handleResolve = async () => {
    try {
      await caseAPI.resolve(expandedId, resolveForm);
      toast.success('Case resolved');
      setShowResolveModal(false);
      setResolveForm({ resolution: '', action: '' });
      loadDetail(expandedId);
      loadCases();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  const filtered = cases;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Case Management</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Case
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-44">
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input-field w-44">
            <option value="">All Types</option>
            {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="input-field w-44">
            <option value="">All Severities</option>
            {severities.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-10"></th>
                  <th className="table-header">Case No.</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Severity</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Reported By</th>
                  <th className="table-header">Investigator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No cases found</td></tr>
                ) : filtered.map((c, i) => {
                  const TypeIcon = typeIcons[c.type] || AlertTriangle;
                  return (
                    <tr key={c._id || i} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(c._id)}>
                      <td className="table-cell">{expandedId === c._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td className="table-cell font-mono text-xs">{c.caseNumber || '--'}</td>
                      <td className="table-cell font-medium text-gray-900">{c.title}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[c.type] || 'bg-gray-100'}`}>
                          <TypeIcon size={12} /> {c.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[c.severity] || 'bg-gray-100'}`}>{c.severity}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[c.priority] || 'bg-gray-100'}`}>{c.priority}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                      </td>
                      <td className="table-cell">{c.reportedBy || '--'}</td>
                      <td className="table-cell">{c.assignedInvestigator || '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {expandedId && detail && (
        <div className="card">
          {detailLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{detail.title}</h3>
                  <p className="text-sm text-gray-500">{detail.caseNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAssignModal(true)} className="btn-secondary flex items-center gap-1 text-xs">
                    <UserCheck size={14} /> Assign
                  </button>
                  <button onClick={() => setShowResolveModal(true)} className="btn-primary flex items-center gap-1 text-xs">
                    <CheckCircle size={14} /> Resolve
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[detail.type] || 'bg-gray-100'}`}>
                    {(typeIcons[detail.type] || AlertTriangle)({ size: 12 })} {detail.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severity</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[detail.severity] || 'bg-gray-100'}`}>{detail.severity}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[detail.priority] || 'bg-gray-100'}`}>{detail.priority}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[detail.status] || 'bg-gray-100'}`}>{detail.status}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reported By</p>
                  <p className="text-sm font-medium">{detail.reportedBy || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Investigator</p>
                  <p className="text-sm font-medium">{detail.assignedInvestigator || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Confidential</p>
                  <p className="text-sm font-medium">{detail.confidential ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Anonymous</p>
                  <p className="text-sm font-medium">{detail.allowAnonymous ? 'Allowed' : 'Not Allowed'}</p>
                </div>
              </div>
              {detail.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detail.description}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" /> Timeline ({detail.timeline?.length || 0})
                </h4>
                <div className="space-y-2">
                  {(detail.timeline || []).length === 0 ? (
                    <p className="text-xs text-gray-400">No timeline entries</p>
                  ) : (detail.timeline || []).map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-relisoft-600 rounded-full mt-1.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <span className="text-xs text-gray-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '--'}</span>
                        </div>
                        <p className="text-xs text-gray-500">{entry.actor}</p>
                        {entry.details && <p className="text-xs text-gray-600 mt-1">{entry.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" /> Documents ({detail.documents?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(detail.documents || []).length === 0 ? (
                    <p className="text-xs text-gray-400">No documents</p>
                  ) : (detail.documents || []).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-gray-700">{doc.name || doc.fileName || `Document ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Case</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                    <option value="">Select Type</option>
                    {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    {severities.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Employee</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" className="input-field pl-10" value={form.reportedEmployee} onChange={(e) => setForm({ ...form, reportedEmployee: e.target.value })} placeholder="Search employee..." />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.confidential} onChange={(e) => setForm({ ...form, confidential: e.target.checked })} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Confidential</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.allowAnonymous} onChange={(e) => setForm({ ...form, allowAnonymous: e.target.checked })} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Allow Anonymous</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAssignModal(false); }}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assign Investigator</h2>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investigator Name</label>
                <input type="text" className="input-field" value={investigatorInput} onChange={(e) => setInvestigatorInput(e.target.value)} placeholder="Enter name..." />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAssign} className="btn-primary">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResolveModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowResolveModal(false); }}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Resolve Case</h2>
              <button onClick={() => setShowResolveModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                <textarea className="input-field" rows={4} value={resolveForm.resolution} onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select className="input-field" value={resolveForm.action} onChange={(e) => setResolveForm({ ...resolveForm, action: e.target.value })}>
                  <option value="">Select Action</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowResolveModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleResolve} className="btn-primary">Submit Resolution</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
