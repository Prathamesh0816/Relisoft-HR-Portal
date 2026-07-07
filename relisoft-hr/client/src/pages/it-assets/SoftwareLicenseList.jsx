import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Key, Search, ChevronDown, ChevronUp, AlertTriangle, Users, UserPlus } from 'lucide-react';
import { softwareLicenseAPI, licenseAllocationAPI, employeeAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusBadges = {
  Active: 'badge-success',
  Expiring: 'badge-warning',
  Expired: 'badge-danger',
};

const licenseTypeColors = {
  Perpetual: 'bg-blue-100 text-blue-700',
  Subscription: 'bg-purple-100 text-purple-700',
  'Per User': 'bg-green-100 text-green-700',
  'Per Device': 'bg-orange-100 text-orange-700',
  Concurrent: 'bg-teal-100 text-teal-700',
};

const SoftwareLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [allocatingLicense, setAllocatingLicense] = useState(null);
  const [expiringLicenses, setExpiringLicenses] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [formData, setFormData] = useState({
    name: '', publisher: '', licenseType: 'Subscription', totalSeats: 1,
    productKey: '', cost: '', vendor: '', purchaseDate: '', expiryDate: '',
    status: 'Active', notes: '',
  });
  const [allocateData, setAllocateData] = useState({ employee: '', deviceName: '' });

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.licenseType = filterType;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await softwareLicenseAPI.getAll(params);
      setLicenses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeAPI.list();
      setEmployees(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // silent
    }
  };

  const fetchExpiring = async () => {
    try {
      const { data } = await softwareLicenseAPI.getExpiring();
      setExpiringLicenses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // silent
    }
  };

  const fetchAllocationsForLicense = async (licenseId) => {
    try {
      const { data } = await licenseAllocationAPI.getByLicense(licenseId);
      setAllocations((prev) => ({ ...prev, [licenseId]: Array.isArray(data) ? data : data.data || [] }));
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchLicenses();
    fetchEmployees();
    fetchExpiring();
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [filterType, filterStatus, search]);

  const resetForm = () => {
    setFormData({
      name: '', publisher: '', licenseType: 'Subscription', totalSeats: 1,
      productKey: '', cost: '', vendor: '', purchaseDate: '', expiryDate: '',
      status: 'Active', notes: '',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await softwareLicenseAPI.create(formData);
      toast.success('License created');
      setShowCreateModal(false);
      resetForm();
      fetchLicenses();
      fetchExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await softwareLicenseAPI.update(editingLicense._id, formData);
      toast.success('License updated');
      setShowEditModal(false);
      setEditingLicense(null);
      resetForm();
      fetchLicenses();
      fetchExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this license?')) return;
    try {
      await softwareLicenseAPI.delete(id);
      toast.success('License deleted');
      fetchLicenses();
      fetchExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (license) => {
    setEditingLicense(license);
    setFormData({
      name: license.name || '',
      publisher: license.publisher || '',
      licenseType: license.licenseType || 'Subscription',
      totalSeats: license.totalSeats || 1,
      productKey: license.productKey || '',
      cost: license.cost || '',
      vendor: license.vendor || '',
      purchaseDate: license.purchaseDate ? license.purchaseDate.slice(0, 10) : '',
      expiryDate: license.expiryDate ? license.expiryDate.slice(0, 10) : '',
      status: license.status || 'Active',
      notes: license.notes || '',
    });
    setShowEditModal(true);
  };

  const openAllocateModal = (license) => {
    setAllocatingLicense(license);
    setAllocateData({ employee: '', deviceName: '' });
    setShowAllocateModal(true);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await licenseAllocationAPI.allocate({
        license: allocatingLicense._id,
        employee: allocateData.employee,
        deviceName: allocateData.deviceName,
      });
      toast.success('License allocated');
      setShowAllocateModal(false);
      setAllocatingLicense(null);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate');
    }
  };

  const handleRevoke = async (allocationId) => {
    try {
      await licenseAllocationAPI.revoke(allocationId, {});
      toast.success('License revoked');
      if (allocatingLicense) fetchAllocationsForLicense(allocatingLicense._id);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke');
    }
  };

  const getSeatUsageColor = (used, total) => {
    const pct = total > 0 ? (used / total) * 100 : 0;
    if (pct >= 95) return 'bg-red-500';
    if (pct >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeatUsageTextColor = (used, total) => {
    const pct = total > 0 ? (used / total) * 100 : 0;
    if (pct >= 95) return 'text-red-600';
    if (pct >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredLicenses = licenses.filter((l) => {
    if (search) {
      const term = search.toLowerCase();
      if (!l.name?.toLowerCase().includes(term) && !l.publisher?.toLowerCase().includes(term) && !l.vendor?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Software Licenses</h1>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add License
        </button>
      </div>

      {expiringLicenses.length > 0 && (
        <div className="card border-l-4 border-l-yellow-500 bg-yellow-50 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Licenses Expiring Within 30 Days</h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {expiringLicenses.map((lic) => (
              <span key={lic._id} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {lic.name} ({lic.publisher}) — expires {lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : 'N/A'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input type="text" className="input-field flex-1" placeholder="Search by name, publisher, vendor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-32">
            <option value="">All</option>
            <option value="Perpetual">Perpetual</option>
            <option value="Subscription">Subscription</option>
            <option value="Per User">Per User</option>
            <option value="Per Device">Per Device</option>
            <option value="Concurrent">Concurrent</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-32">
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : filteredLicenses.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No licenses found</div>
        ) : (
          filteredLicenses.map((license, i) => {
            const isExpanded = expandedId === (license._id || i);
            const usedSeats = license.usedSeats || license.allocations?.length || 0;
            const totalSeats = license.totalSeats || 1;
            const usagePct = Math.round((usedSeats / totalSeats) * 100);
            return (
              <div key={license._id || i} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${licenseTypeColors[license.licenseType] || 'bg-gray-100 text-gray-700'}`}>
                      <Key size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{license.name}</h3>
                        <span className={`badge ${statusBadges[license.status] || 'badge-gray'}`}>{license.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{license.publisher}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${licenseTypeColors[license.licenseType] || 'bg-gray-100 text-gray-700'}`}>
                          {license.licenseType}
                        </span>
                        <span className="flex items-center gap-1"><Users size={12} /> {usedSeats}/{totalSeats}</span>
                        {license.expiryDate && (
                          <span className={new Date(license.expiryDate) < new Date() ? 'text-red-500 font-medium' : ''}>
                            Expires: {new Date(license.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getSeatUsageColor(usedSeats, totalSeats)}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getSeatUsageTextColor(usedSeats, totalSeats)}`}>
                          {usagePct}% used
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {license.status === 'Active' && usedSeats < totalSeats && (
                      <button onClick={() => openAllocateModal(license)} className="btn-secondary btn-sm text-xs flex items-center gap-1"><UserPlus size={12} /> Allocate</button>
                    )}
                    <button onClick={() => openEditModal(license)} className="btn-secondary btn-sm"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(license._id)} className="btn-secondary btn-sm text-red-500"><Trash2 size={14} /></button>
                    <button onClick={() => {
                      const newId = isExpanded ? null : (license._id || i);
                      setExpandedId(newId);
                      if (newId) fetchAllocationsForLicense(license._id);
                    }} className="btn-secondary btn-sm">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Vendor</span>
                        <p className="text-gray-900">{license.vendor || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Product Key</span>
                        <p className="text-gray-900 font-mono">{license.productKey || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Cost</span>
                        <p className="text-gray-900">{license.cost ? `$${license.cost}` : '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Purchase Date</span>
                        <p className="text-gray-900">{license.purchaseDate ? new Date(license.purchaseDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Expiry Date</span>
                        <p className={`${license.expiryDate && new Date(license.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-900'}`}>
                          {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Total Seats</span>
                        <p className="text-gray-900">{totalSeats}</p>
                      </div>
                    </div>
                    {license.notes && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-500">Notes</span>
                        <p className="text-sm text-gray-600 mt-1">{license.notes}</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Users size={14} /> Allocated Employees ({usedSeats})
                      </h4>
                      {(allocations[license._id] || []).length === 0 ? (
                        <p className="text-sm text-gray-400">No allocations yet</p>
                      ) : (
                        <div className="space-y-2">
                          {(allocations[license._id] || []).map((alloc) => (
                            <div key={alloc._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">{alloc.employee?.name || alloc.employee}</span>
                                {alloc.deviceName && <span className="text-xs text-gray-500 ml-2">— {alloc.deviceName}</span>}
                                {alloc.allocatedAt && (
                                  <span className="text-xs text-gray-400 ml-2">({new Date(alloc.allocatedAt).toLocaleDateString()})</span>
                                )}
                              </div>
                              <button onClick={() => handleRevoke(alloc._id)} className="text-xs text-red-500 hover:text-red-700">Revoke</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create License" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input type="text" className="input-field" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Type *</label>
              <select className="input-field" value={formData.licenseType} onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}>
                <option value="Perpetual">Perpetual</option>
                <option value="Subscription">Subscription</option>
                <option value="Per User">Per User</option>
                <option value="Per Device">Per Device</option>
                <option value="Concurrent">Concurrent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
              <input type="number" min="1" className="input-field" value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 1 })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Key</label>
              <input type="text" className="input-field" value={formData.productKey} onChange={(e) => setFormData({ ...formData, productKey: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input type="number" step="0.01" className="input-field" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input type="text" className="input-field" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="input-field" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create License</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingLicense(null); resetForm(); }} title="Edit License" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input type="text" className="input-field" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
              <select className="input-field" value={formData.licenseType} onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}>
                <option value="Perpetual">Perpetual</option>
                <option value="Subscription">Subscription</option>
                <option value="Per User">Per User</option>
                <option value="Per Device">Per Device</option>
                <option value="Concurrent">Concurrent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
              <input type="number" min="1" className="input-field" value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 1 })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Key</label>
              <input type="text" className="input-field" value={formData.productKey} onChange={(e) => setFormData({ ...formData, productKey: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input type="number" step="0.01" className="input-field" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input type="text" className="input-field" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="input-field" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowEditModal(false); setEditingLicense(null); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Update License</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAllocateModal} onClose={() => { setShowAllocateModal(false); setAllocatingLicense(null); }} title={`Allocate License: ${allocatingLicense?.name || ''}`} size="md">
        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select className="input-field" value={allocateData.employee} onChange={(e) => setAllocateData({ ...allocateData, employee: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId || emp.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <input type="text" className="input-field" value={allocateData.deviceName} onChange={(e) => setAllocateData({ ...allocateData, deviceName: e.target.value })} placeholder="e.g. Work Laptop - ABC123" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowAllocateModal(false); setAllocatingLicense(null); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Allocate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SoftwareLicenseList;
