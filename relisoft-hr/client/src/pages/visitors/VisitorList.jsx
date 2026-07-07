import { useState, useEffect } from 'react';
import { Users, Calendar, LogIn, History, Plus, X, Loader2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { visitorAPI } from '../../services/api';

const tabs = [
  { key: 'visitors', label: 'Visitors', icon: Users },
  { key: 'visits', label: 'Scheduled Visits', icon: Calendar },
  { key: 'checkin', label: 'Check-In/Out', icon: LogIn },
  { key: 'history', label: 'History', icon: History },
];

const visitStatusColors = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  CheckedIn: 'bg-blue-100 text-blue-800',
  CheckedOut: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function VisitorList() {
  const [activeTab, setActiveTab] = useState('visitors');
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [visits, setVisits] = useState([]);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', idProof: '', idProofNumber: '' });
  const [saving, setSaving] = useState(false);
  const [selectedHost, setSelectedHost] = useState('');
  const [hosts, setHosts] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (activeTab === 'visitors') loadVisitors();
    else if (activeTab === 'visits') loadVisits();
    else if (activeTab === 'checkin') { loadVisits(); loadHosts(); }
  }, [activeTab]);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const { data } = await visitorAPI.list();
      setVisitors(data?.visitors || data?.data || data || []);
    } catch (err) {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      const { data } = await visitorAPI.getVisits();
      setVisits(data?.visits || data?.data || data || []);
    } catch (err) {
      // ignore
    }
  };

  const loadHosts = async () => {
    try {
      const { data } = await visitorAPI.list();
      const all = data?.visitors || data?.data || data || [];
      setHosts(all);
    } catch {
      setHosts([]);
    }
  };

  const loadHistory = async () => {
    if (!historySearch.trim()) { setHistoryData([]); return; }
    setLoading(true);
    try {
      const { data } = await visitorAPI.getVisitHistory({ email: historySearch });
      setHistoryData(data?.visits || data?.data || data || []);
    } catch {
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, historySearch]);

  const openAddModal = () => {
    setEditVisitor(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', idProof: '', idProofNumber: '' });
    setShowVisitorModal(true);
  };

  const openEditModal = (v) => {
    setEditVisitor(v);
    setForm({ firstName: v.firstName || '', lastName: v.lastName || '', email: v.email || '', phone: v.phone || '', company: v.company || '', idProof: v.idProof || '', idProofNumber: v.idProofNumber || '' });
    setShowVisitorModal(true);
  };

  const handleSaveVisitor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editVisitor) {
        await visitorAPI.update(editVisitor._id, form);
        toast.success('Visitor updated');
      } else {
        await visitorAPI.create(form);
        toast.success('Visitor added');
      }
      setShowVisitorModal(false);
      loadVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVisitStatus = async (id, status) => {
    try {
      await visitorAPI.updateVisitStatus(id, status);
      toast.success(`Visit ${status}`);
      loadVisits();
    } catch (err) {
      toast.error('Failed to update visit');
    }
  };

  const filteredPendingVisits = selectedHost
    ? visits.filter((v) => v.host === selectedHost)
    : visits;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Visitor Management</h1>
        {activeTab === 'visitors' && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Visitor
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

      {activeTab === 'visitors' && (
        <div className="table-container">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitors.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No visitors found</td></tr>
                  ) : visitors.map((v, i) => (
                    <tr key={v._id || i} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEditModal(v)}>
                      <td className="table-cell font-medium text-gray-900">{v.firstName} {v.lastName}</td>
                      <td className="table-cell">{v.email}</td>
                      <td className="table-cell">{v.phone}</td>
                      <td className="table-cell">{v.company}</td>
                      <td className="table-cell">
                        {v.isBlacklisted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ShieldAlert size={12} /> Blacklisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <ShieldCheck size={12} /> Clear
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(v); }} className="text-relisoft-600 hover:underline text-xs">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="table-container">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Visitor</th>
                    <th className="table-header">Host</th>
                    <th className="table-header">Purpose</th>
                    <th className="table-header">Expected Date</th>
                    <th className="table-header">Expected Time</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visits.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No scheduled visits</td></tr>
                  ) : visits.map((v, i) => (
                    <tr key={v._id || i} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{v.visitorName || v.visitor?.firstName + ' ' + v.visitor?.lastName || '--'}</td>
                      <td className="table-cell">{v.host}</td>
                      <td className="table-cell">{v.purpose}</td>
                      <td className="table-cell">{v.expectedDate ? new Date(v.expectedDate).toLocaleDateString() : '--'}</td>
                      <td className="table-cell">{v.expectedTime || '--'}</td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${visitStatusColors[v.status] || 'bg-gray-100'}`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Host</label>
            <select value={selectedHost} onChange={(e) => setSelectedHost(e.target.value)}
              className="input-field max-w-xs">
              <option value="">All Hosts</option>
              {hosts.map((h, i) => (
                <option key={h._id || i} value={h.firstName + ' ' + h.lastName}>{h.firstName} {h.lastName}</option>
              ))}
            </select>
          </div>
          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Visitor</th>
                    <th className="table-header">Host</th>
                    <th className="table-header">Purpose</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPendingVisits.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No visits found</td></tr>
                  ) : filteredPendingVisits.map((v, i) => (
                    <tr key={v._id || i} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{v.visitorName || '--'}</td>
                      <td className="table-cell">{v.host}</td>
                      <td className="table-cell">{v.purpose}</td>
                      <td className="table-cell">{v.expectedDate ? new Date(v.expectedDate).toLocaleDateString() : '--'}</td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${visitStatusColors[v.status] || 'bg-gray-100'}`}>{v.status}</span>
                      </td>
                      <td className="table-cell text-right">
                        {v.status === 'Pending' && (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleUpdateVisitStatus(v._id, 'Approved')} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">Approve</button>
                            <button onClick={() => handleUpdateVisitStatus(v._id, 'Cancelled')} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Reject</button>
                          </div>
                        )}
                        {v.status === 'Approved' && (
                          <button onClick={() => handleUpdateVisitStatus(v._id, 'CheckedIn')} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Check In</button>
                        )}
                        {v.status === 'CheckedIn' && (
                          <button onClick={() => handleUpdateVisitStatus(v._id, 'CheckedOut')} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Check Out</button>
                        )}
                        {(v.status === 'CheckedOut' || v.status === 'Cancelled') && (
                          <span className="text-xs text-gray-400">Complete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-gray-400" />
              <input type="text" className="input-field max-w-sm" placeholder="Search by visitor email..."
                value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
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
                      <th className="table-header">Visitor</th>
                      <th className="table-header">Host</th>
                      <th className="table-header">Purpose</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Time</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!historySearch.trim() ? (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-400">Enter an email to search</td></tr>
                    ) : historyData.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-400">No history found</td></tr>
                    ) : historyData.map((v, i) => (
                      <tr key={v._id || i} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{v.visitorName || '--'}</td>
                        <td className="table-cell">{v.host}</td>
                        <td className="table-cell">{v.purpose}</td>
                        <td className="table-cell">{v.expectedDate ? new Date(v.expectedDate).toLocaleDateString() : '--'}</td>
                        <td className="table-cell">{v.expectedTime || '--'}</td>
                        <td className="table-cell">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${visitStatusColors[v.status] || 'bg-gray-100'}`}>{v.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showVisitorModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowVisitorModal(false); }}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editVisitor ? 'Edit Visitor' : 'Add Visitor'}</h2>
              <button onClick={() => setShowVisitorModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveVisitor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                <input type="text" className="input-field" value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} placeholder="e.g. Passport, Driver License" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number</label>
                <input type="text" className="input-field" value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowVisitorModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editVisitor ? 'Update' : 'Add'} Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
