import { useState, useEffect } from 'react';
import { Plus, X, Loader2, FileText, BarChart3, ClipboardList, Eye, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { smartFormAPI } from '../../services/api';

const tabs = [
  { key: 'forms', label: 'Forms', icon: FileText },
  { key: 'submissions', label: 'Submissions', icon: ClipboardList },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const statusColors = {
  Draft: 'bg-gray-100 text-gray-800',
  Published: 'bg-green-100 text-green-800',
  Archived: 'bg-amber-100 text-amber-800',
};

export default function SmartFormList() {
  const [activeTab, setActiveTab] = useState('forms');
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formDetail, setFormDetail] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [formData, setFormData] = useState({ title: '', description: '', fields: [] });
  const [newField, setNewField] = useState({ type: 'text', label: '', required: false, options: '' });

  useEffect(() => {
    if (activeTab === 'forms') loadForms();
  }, [activeTab]);

  const loadForms = async () => {
    setLoading(true);
    try {
      const { data } = await smartFormAPI.list();
      setForms(data?.forms || data?.data || data || []);
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const loadFormDetail = async (id) => {
    setSelectedForm(id);
    setSelectedSubmission(null);
    setAnalytics(null);
    setSubmissions([]);
    try {
      const { data } = await smartFormAPI.getById(id);
      setFormDetail(data?.form || data?.data || data);
    } catch {
      toast.error('Failed to load form details');
    }
  };

  const loadSubmissions = async (formId) => {
    setLoading(true);
    try {
      const { data } = await smartFormAPI.getSubmissions(formId);
      setSubmissions(data?.submissions || data?.data || data || []);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (formId) => {
    setLoading(true);
    try {
      const { data } = await smartFormAPI.getAnalytics(formId);
      setAnalytics(data?.analytics || data?.data || data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions' && selectedForm) loadSubmissions(selectedForm);
  }, [activeTab, selectedForm]);

  useEffect(() => {
    if (activeTab === 'analytics' && selectedForm) loadAnalytics(selectedForm);
  }, [activeTab, selectedForm]);

  const handleCreateForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await smartFormAPI.create(formData);
      toast.success('Form created');
      setShowAddModal(false);
      setFormData({ title: '', description: '', fields: [] });
      loadForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create form');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await smartFormAPI.publish(id);
      toast.success('Form published');
      loadForms();
      if (selectedForm === id) loadFormDetail(id);
    } catch {
      toast.error('Failed to publish');
    }
  };

  const addField = () => {
    if (!newField.label.trim()) { toast.error('Field label is required'); return; }
    setFormData({ ...formData, fields: [...formData.fields, { ...newField, options: newField.options.split(',').map(o => o.trim()).filter(Boolean) }] });
    setNewField({ type: 'text', label: '', required: false, options: '' });
  };

  const removeField = (idx) => {
    setFormData({ ...formData, fields: formData.fields.filter((_, i) => i !== idx) });
  };

  const viewSubmission = async (id) => {
    try {
      const { data } = await smartFormAPI.getSubmission(id);
      setSelectedSubmission(data?.submission || data?.data || data);
    } catch {
      toast.error('Failed to load submission');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Smart Forms</h1>
        {activeTab === 'forms' && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Form
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'forms' && (
        <div className="table-container">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Title</th>
                    <th className="table-header">Fields</th>
                    <th className="table-header">Version</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Created By</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forms.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No forms found</td></tr>
                  ) : forms.map((f, i) => (
                    <tr key={f._id || i} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">
                        <button onClick={() => loadFormDetail(f._id)} className="text-relisoft-600 hover:underline">{f.title}</button>
                      </td>
                      <td className="table-cell">{f.fields?.length || 0}</td>
                      <td className="table-cell">v{f.version || 1}</td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[f.status] || 'bg-gray-100'}`}>{f.status}</span>
                      </td>
                      <td className="table-cell">{f.createdBy || '--'}</td>
                      <td className="table-cell text-right">
                        {f.status === 'Draft' && (
                          <button onClick={() => handlePublish(f._id)} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 flex items-center gap-1 ml-auto">
                            <Send size={12} /> Publish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedForm && formDetail && activeTab === 'forms' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{formDetail.title}</h3>
            {formDetail.status === 'Draft' && (
              <button onClick={() => handlePublish(formDetail._id)} className="btn-primary flex items-center gap-1 text-xs">
                <Send size={14} /> Publish
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">{formDetail.description}</p>
          <div className="space-y-2">
            {(formDetail.fields || []).map((field, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-400 w-6">{i + 1}.</span>
                <span className="text-sm font-medium text-gray-900">{field.label}</span>
                <span className="text-xs text-gray-500">({field.type})</span>
                {field.required && <span className="text-xs text-red-500">*</span>}
              </div>
            ))}
            {(formDetail.fields || []).length === 0 && (
              <p className="text-xs text-gray-400">No fields defined</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Form</label>
            <select value={selectedForm || ''} onChange={(e) => loadFormDetail(e.target.value)}
              className="input-field max-w-xs">
              <option value="">Choose a form</option>
              {forms.map((f) => <option key={f._id} value={f._id}>{f.title}</option>)}
            </select>
          </div>

          {selectedForm && !selectedSubmission && (
            <div className="table-container">
              {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header">Employee</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Submitted Date</th>
                        <th className="table-header text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {submissions.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-12 text-gray-400">No submissions</td></tr>
                      ) : submissions.map((s, i) => (
                        <tr key={s._id || i} className="hover:bg-gray-50">
                          <td className="table-cell font-medium">{s.employeeName || s.employee?.firstName + ' ' + s.employee?.lastName || '--'}</td>
                          <td className="table-cell">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              s.status === 'Submitted' ? 'bg-green-100 text-green-800' :
                              s.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>{s.status}</span>
                          </td>
                          <td className="table-cell">{s.submittedDate ? new Date(s.submittedDate).toLocaleDateString() : '--'}</td>
                          <td className="table-cell text-right">
                            <button onClick={() => viewSubmission(s._id)} className="text-relisoft-600 hover:underline text-xs flex items-center gap-1 ml-auto">
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {selectedSubmission && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Submission Details</h3>
                <button onClick={() => setSelectedSubmission(null)} className="text-sm text-relisoft-600 hover:underline">Back</button>
              </div>
              <div className="space-y-3">
                {(selectedSubmission.responses || []).map((r, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{r.label || `Field ${i + 1}`}</p>
                    <p className="text-sm font-medium text-gray-900">{Array.isArray(r.value) ? r.value.join(', ') : r.value || '--'}</p>
                  </div>
                ))}
                {(selectedSubmission.responses || []).length === 0 && (
                  <p className="text-xs text-gray-400">No response data</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Form</label>
            <select value={selectedForm || ''} onChange={(e) => loadFormDetail(e.target.value)}
              className="input-field max-w-xs">
              <option value="">Choose a form</option>
              {forms.map((f) => <option key={f._id} value={f._id}>{f.title}</option>)}
            </select>
          </div>

          {selectedForm && analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-xs text-gray-500">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions || 0}</p>
              </div>
              {analytics.submissionsByStatus && Object.entries(analytics.submissionsByStatus).map(([status, count]) => (
                <div key={status} className="card">
                  <p className="text-xs text-gray-500">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          )}

          {selectedForm && analytics?.fieldValueCounts && (
            <div className="card">
              <h3 className="card-header">Field Value Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(analytics.fieldValueCounts).map(([field, values]) => (
                  <div key={field}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{field}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(values).map(([val, count]) => (
                        <span key={val} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                          <span className="font-medium">{val}</span>
                          <span className="text-gray-400">({count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedForm && !loading && !analytics && (
            <div className="card">
              <p className="text-center text-gray-400 py-8">No analytics data available</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Smart Form</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Fields</h4>
                <div className="space-y-2 mb-4">
                  {formData.fields.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                      <span className="text-sm font-medium flex-1">{f.label}</span>
                      <span className="text-xs text-gray-500">({f.type})</span>
                      {f.required && <span className="text-xs text-red-500">*</span>}
                      <button type="button" onClick={() => removeField(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={14} /></button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                      className="input-field text-xs">
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                    <input type="text" className="input-field text-xs" value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })} />
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <input type="checkbox" checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} className="rounded border-gray-300" />
                    <span className="text-xs text-gray-600">Required</span>
                  </div>
                  <div className="col-span-3">
                    <button type="button" onClick={addField} className="btn-primary text-xs w-full">+ Add</button>
                  </div>
                  {(newField.type === 'dropdown' || newField.type === 'checkbox') && (
                    <div className="col-span-12 mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Options (comma separated)</label>
                      <input type="text" className="input-field text-xs" value={newField.options} onChange={(e) => setNewField({ ...newField, options: e.target.value })} placeholder="Option 1, Option 2, Option 3" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
