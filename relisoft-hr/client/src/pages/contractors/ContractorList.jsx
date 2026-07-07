import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Building2, User, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractorAPI } from '../../services/api';

const tabs = ['Vendors', 'Contractors', 'Time Logs'];
const billingFrequencies = ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Fixed'];
const statuses = ['Active', 'Inactive', 'Onboarding'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];

const emptyVendor = { name: '', contactPerson: '', email: '', phone: '', services: '' };
const emptyContractor = { vendor: '', firstName: '', lastName: '', email: '', phone: '', role: '', department: '', reportingManager: '', contractStart: '', contractEnd: '', billingRate: 0, billingFrequency: 'Hourly', status: 'Active' };
const emptyTimeLog = { date: new Date().toISOString().slice(0, 10), hours: 0, description: '', billable: true };

export default function ContractorList() {
  const [activeTab, setActiveTab] = useState('Vendors');
  const [vendors, setVendors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showTimeLogModal, setShowTimeLogModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingContractor, setEditingContractor] = useState(null);
  const [form, setForm] = useState(emptyVendor);
  const [contractorForm, setContractorForm] = useState(emptyContractor);
  const [timeLogForm, setTimeLogForm] = useState(emptyTimeLog);
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Vendors') {
        const { data } = await contractorAPI.listVendors();
        setVendors(data.vendors || data.data || data || []);
      } else if (activeTab === 'Contractors') {
        const [contractorsRes, vendorsRes] = await Promise.all([
          contractorAPI.listContractors(),
          contractorAPI.listVendors(),
        ]);
        setContractors(contractorsRes.data.contractors || contractorsRes.data.data || contractorsRes.data || []);
        setVendors(vendorsRes.data.vendors || vendorsRes.data.data || vendorsRes.data || []);
      } else {
        if (selectedContractor) {
          const { data } = await contractorAPI.listTimeLogs(selectedContractor._id);
          setTimeLogs(data.timeLogs || data.data || data || []);
        } else {
          setTimeLogs([]);
        }
      }
    } catch (err) {
      if (activeTab === 'Vendors') setVendors([]);
      else if (activeTab === 'Contractors') { setContractors([]); setVendors([]); }
      else setTimeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Time Logs' && selectedContractor) {
      loadTimeLogs();
    }
  }, [selectedContractor, activeTab]);

  const loadTimeLogs = async () => {
    if (!selectedContractor) return;
    setLoading(true);
    try {
      const { data } = await contractorAPI.listTimeLogs(selectedContractor._id);
      setTimeLogs(data.timeLogs || data.data || data || []);
    } catch (err) {
      setTimeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await contractorAPI.updateVendor(editing, form);
        toast.success('Vendor updated');
      } else {
        await contractorAPI.createVendor(form);
        toast.success('Vendor created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyVendor);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContractor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContractor) {
        await contractorAPI.updateContractor(editingContractor, contractorForm);
        toast.success('Contractor updated');
      } else {
        await contractorAPI.createContractor(contractorForm);
        toast.success('Contractor created');
      }
      setShowContractorModal(false);
      setEditingContractor(null);
      setContractorForm(emptyContractor);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save contractor');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    if (!selectedContractor) return;
    setSaving(true);
    try {
      await contractorAPI.createTimeLog(selectedContractor._id, timeLogForm);
      toast.success('Time log added');
      setShowTimeLogModal(false);
      setTimeLogForm(emptyTimeLog);
      loadTimeLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add time log');
    } finally {
      setSaving(false);
    }
  };

  const openEditVendor = (v) => {
    setEditing(v._id);
    setForm({ name: v.name, contactPerson: v.contactPerson || '', email: v.email || '', phone: v.phone || '', services: (v.services || []).join(', ') });
    setShowModal(true);
  };

  const openEditContractor = (c) => {
    setEditingContractor(c._id);
    setContractorForm({
      vendor: c.vendor?._id || c.vendor || '',
      firstName: c.firstName, lastName: c.lastName, email: c.email || '', phone: c.phone || '',
      role: c.role || '', department: c.department || '', reportingManager: c.reportingManager || '',
      contractStart: c.contractStart ? c.contractStart.slice(0, 10) : '',
      contractEnd: c.contractEnd ? c.contractEnd.slice(0, 10) : '',
      billingRate: c.billingRate || 0, billingFrequency: c.billingFrequency || 'Hourly', status: c.status || 'Active',
    });
    setShowContractorModal(true);
  };

  const filteredContractors = contractors.filter((c) => !statusFilter || c.status === statusFilter);

  const statusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Onboarding: 'bg-amber-100 text-amber-800',
    };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const totalHours = timeLogs.reduce((s, t) => s + (t.hours || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contractor Management</h1>
            <p className="text-gray-500 mt-1">Manage vendors, contractors, and time logs</p>
          </div>
          {activeTab === 'Vendors' && (
            <button onClick={() => { setEditing(null); setForm(emptyVendor); setShowModal(true); }}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Add Vendor
            </button>
          )}
          {activeTab === 'Contractors' && (
            <button onClick={() => { setEditingContractor(null); setContractorForm(emptyContractor); setShowContractorModal(true); }}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Add Contractor
            </button>
          )}
          {activeTab === 'Time Logs' && selectedContractor && (
            <button onClick={() => { setTimeLogForm(emptyTimeLog); setShowTimeLogModal(true); }}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Add Time Log
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

        {activeTab === 'Contractors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                <option value="">All Statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'Time Logs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Select Contractor:</label>
              <select value={selectedContractor?._id || ''} onChange={(e) => {
                const c = contractors.find((ct) => ct._id === e.target.value);
                setSelectedContractor(c || null);
              }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none min-w-[200px]">
                <option value="">Choose a contractor</option>
                {contractors.map((c) => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName} - {c.vendor?.name || c.vendorName || 'N/A'}</option>
                ))}
              </select>
              {selectedContractor && (
                <div className="text-sm text-gray-500 ml-auto">
                  Total Hours: <span className="font-semibold text-gray-900">{totalHours}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
        ) : activeTab === 'Vendors' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Services</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No vendors found</td></tr>
                  ) : vendors.map((v, i) => (
                    <tr key={v._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.contactPerson || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.email || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.phone || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{(v.services || []).join(', ') || '--'}</td>
                      <td className="px-6 py-4">{statusBadge(v.status || 'Active')}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditVendor(v)} className="text-relisoft-600 hover:text-relisoft-800 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'Contractors' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Billing Rate</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredContractors.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-12 text-gray-400">No contractors found</td></tr>
                  ) : filteredContractors.map((c, i) => (
                    <tr key={c._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.vendor?.name || c.vendorName || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.email || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.role || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.department || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(c.billingRate || 0).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{c.billingFrequency}</span></td>
                      <td className="px-6 py-4">{statusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditContractor(c)} className="text-relisoft-600 hover:text-relisoft-800 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {!selectedContractor ? (
              <div className="text-center py-16 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a contractor to view time logs</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hours</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Billable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timeLogs.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-gray-400">No time logs for this contractor</td></tr>
                    ) : timeLogs.map((t, i) => (
                      <tr key={t._id || i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{t.date ? new Date(t.date).toLocaleDateString() : '--'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.hours}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{t.description || '--'}</td>
                        <td className="px-6 py-4">
                          {t.billable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Billable</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Non-billable</span>
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">{editing ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddVendor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input type="text" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
                <input type="text" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })}
                  placeholder="e.g. IT Consulting, Staffing, Development"
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

      {showContractorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">{editingContractor ? 'Edit Contractor' : 'Add Contractor'}</h3>
              <button onClick={() => { setShowContractorModal(false); setEditingContractor(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddContractor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select value={contractorForm.vendor} onChange={(e) => setContractorForm({ ...contractorForm, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                  <option value="">Select vendor</option>
                  {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={contractorForm.firstName} onChange={(e) => setContractorForm({ ...contractorForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={contractorForm.lastName} onChange={(e) => setContractorForm({ ...contractorForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={contractorForm.email} onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={contractorForm.phone} onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={contractorForm.role} onChange={(e) => setContractorForm({ ...contractorForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={contractorForm.department} onChange={(e) => setContractorForm({ ...contractorForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    <option value="">Select</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                <input type="text" value={contractorForm.reportingManager} onChange={(e) => setContractorForm({ ...contractorForm, reportingManager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start</label>
                  <input type="date" value={contractorForm.contractStart} onChange={(e) => setContractorForm({ ...contractorForm, contractStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract End</label>
                  <input type="date" value={contractorForm.contractEnd} onChange={(e) => setContractorForm({ ...contractorForm, contractEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Rate ($)</label>
                  <input type="number" step="0.01" value={contractorForm.billingRate} onChange={(e) => setContractorForm({ ...contractorForm, billingRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Frequency</label>
                  <select value={contractorForm.billingFrequency} onChange={(e) => setContractorForm({ ...contractorForm, billingFrequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    {billingFrequencies.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={contractorForm.status} onChange={(e) => setContractorForm({ ...contractorForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowContractorModal(false); setEditingContractor(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {editingContractor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimeLogModal && selectedContractor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Time Log</h3>
              <button onClick={() => setShowTimeLogModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddTimeLog} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={timeLogForm.date} onChange={(e) => setTimeLogForm({ ...timeLogForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input type="number" step="0.5" min="0" value={timeLogForm.hours} onChange={(e) => setTimeLogForm({ ...timeLogForm, hours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={timeLogForm.description} onChange={(e) => setTimeLogForm({ ...timeLogForm, description: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="billable" checked={timeLogForm.billable} onChange={(e) => setTimeLogForm({ ...timeLogForm, billable: e.target.checked })}
                  className="h-4 w-4 text-relisoft-600 focus:ring-relisoft-500 border-gray-300 rounded" />
                <label htmlFor="billable" className="text-sm text-gray-700">Billable</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowTimeLogModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Time Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
