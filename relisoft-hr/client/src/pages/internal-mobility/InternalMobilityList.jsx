import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Briefcase, FileText, Send, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { internalMobilityAPI } from '../../services/api';

const tabs = ['Postings', 'My Applications'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];
const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Temporary'];

const emptyPosting = { title: '', department: '', location: '', employmentType: 'Full-Time', description: '', requirements: '', closingDate: '', status: 'Open' };

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800',
  Reviewed: 'bg-purple-100 text-purple-800',
  Interview: 'bg-amber-100 text-amber-800',
  Offered: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-800',
  Accepted: 'bg-teal-100 text-teal-800',
};

export default function InternalMobilityList() {
  const [activeTab, setActiveTab] = useState('Postings');
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPosting);
  const [applyForm, setApplyForm] = useState({ coverNote: '', resumeUrl: '' });
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Postings') {
        const { data } = await internalMobilityAPI.listPostings();
        setPostings(data.postings || data.data || data || []);
      } else {
        const { data } = await internalMobilityAPI.listMyApplications();
        setApplications(data.applications || data.data || data || []);
      }
    } catch (err) {
      if (activeTab === 'Postings') setPostings([]);
      else setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosting = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await internalMobilityAPI.updatePosting(editing, form);
        toast.success('Posting updated');
      } else {
        await internalMobilityAPI.createPosting(form);
        toast.success('Posting created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyPosting);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save posting');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedPosting) return;
    setSaving(true);
    try {
      await internalMobilityAPI.applyToPosting(selectedPosting._id, applyForm);
      toast.success('Application submitted');
      setShowApplyModal(false);
      setApplyForm({ coverNote: '', resumeUrl: '' });
      setSelectedPosting(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setSaving(false);
    }
  };

  const openEditPosting = (posting) => {
    setEditing(posting._id);
    setForm({ title: posting.title, department: posting.department, location: posting.location, employmentType: posting.employmentType, description: posting.description || '', requirements: posting.requirements || '', closingDate: posting.closingDate ? posting.closingDate.slice(0, 10) : '', status: posting.status });
    setShowModal(true);
  };

  const openApply = (posting) => {
    setSelectedPosting(posting);
    setApplyForm({ coverNote: '', resumeUrl: '' });
    setShowApplyModal(true);
  };

  const filteredPostings = postings.filter((p) => !departmentFilter || p.department === departmentFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Internal Mobility</h1>
            <p className="text-gray-500 mt-1">Job postings and internal applications</p>
          </div>
          {activeTab === 'Postings' && (
            <button onClick={() => { setEditing(null); setForm(emptyPosting); setShowModal(true); }}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> New Posting
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 inline-flex">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-relisoft-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Postings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
        ) : activeTab === 'Postings' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Closing Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPostings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No postings found</td></tr>
                  ) : filteredPostings.map((p, i) => (
                    <tr key={p._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.location}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{p.employmentType}</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.closingDate ? new Date(p.closingDate).toLocaleDateString() : '--'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openApply(p)} className="flex items-center px-3 py-1.5 bg-relisoft-600 text-white rounded-lg text-sm hover:bg-relisoft-700">
                            <Send className="h-3.5 w-3.5 mr-1" /> Apply
                          </button>
                          <button onClick={() => openEditPosting(p)} className="text-relisoft-600 hover:text-relisoft-800 text-sm font-medium">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Posting</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Submitted Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-400">No applications yet</td></tr>
                  ) : applications.map((a, i) => (
                    <tr key={a._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.posting?.title || a.title || '--'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-100 text-gray-800'}`}>{a.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.submittedDate ? new Date(a.submittedDate).toLocaleDateString() : '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.currentStatus || a.status || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">{editing ? 'Edit Posting' : 'New Posting'}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddPosting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                    <option value="">Select</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                  <input type="date" value={form.closingDate} onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplyModal && selectedPosting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Apply: {selectedPosting.title}</h3>
              <button onClick={() => { setShowApplyModal(false); setSelectedPosting(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Note</label>
                <textarea value={applyForm.coverNote} onChange={(e) => setApplyForm({ ...applyForm, coverNote: e.target.value })} rows={4} placeholder="Why are you a good fit for this role?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input type="url" value={applyForm.resumeUrl} onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })} placeholder="Link to your resume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Provide a URL to your resume (Google Drive, Dropbox, etc.)</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowApplyModal(false); setSelectedPosting(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
