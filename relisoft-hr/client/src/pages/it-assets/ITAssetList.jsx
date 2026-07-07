import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Monitor, AlertTriangle, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { itAssetAPI, employeeAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusBadges = {
  Available: 'badge-success',
  Issued: 'badge-info',
  Maintenance: 'badge-warning',
  Disposed: 'badge-gray',
};

const typeColors = {
  Laptop: 'bg-blue-100 text-blue-700',
  Desktop: 'bg-gray-100 text-gray-700',
  Monitor: 'bg-indigo-100 text-indigo-700',
  Printer: 'bg-purple-100 text-purple-700',
  Server: 'bg-red-100 text-red-700',
  Network: 'bg-yellow-100 text-yellow-700',
  Phone: 'bg-green-100 text-green-700',
  Tablet: 'bg-teal-100 text-teal-700',
  Accessory: 'bg-pink-100 text-pink-700',
};

const ITAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [warrantyExpiring, setWarrantyExpiring] = useState([]);
  const [formData, setFormData] = useState({
    assetTag: '', type: 'Laptop', brand: '', model: '', serialNumber: '',
    processor: '', ram: '', storage: '', os: '', macAddress: '', ipAddress: '',
    status: 'Available', purchaseDate: '', warrantyExpiry: '', notes: '',
  });
  const [assignData, setAssignData] = useState({ employee: '', expectedReturnDate: '', notes: '' });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await itAssetAPI.getAll(params);
      setAssets(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch assets');
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

  const fetchWarrantyExpiring = async () => {
    try {
      const { data } = await itAssetAPI.getWarrantyExpiring();
      setWarrantyExpiring(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    fetchWarrantyExpiring();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [filterType, filterStatus, search]);

  const resetForm = () => {
    setFormData({
      assetTag: '', type: 'Laptop', brand: '', model: '', serialNumber: '',
      processor: '', ram: '', storage: '', os: '', macAddress: '', ipAddress: '',
      status: 'Available', purchaseDate: '', warrantyExpiry: '', notes: '',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await itAssetAPI.create(formData);
      toast.success('Asset created');
      setShowCreateModal(false);
      resetForm();
      fetchAssets();
      fetchWarrantyExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await itAssetAPI.update(editingAsset._id, formData);
      toast.success('Asset updated');
      setShowEditModal(false);
      setEditingAsset(null);
      resetForm();
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await itAssetAPI.delete(id);
      toast.success('Asset deleted');
      fetchAssets();
      fetchWarrantyExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetTag: asset.assetTag || '',
      type: asset.type || 'Laptop',
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      processor: asset.processor || '',
      ram: asset.ram || '',
      storage: asset.storage || '',
      os: asset.os || '',
      macAddress: asset.macAddress || '',
      ipAddress: asset.ipAddress || '',
      status: asset.status || 'Available',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : '',
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.slice(0, 10) : '',
      notes: asset.notes || '',
    });
    setShowEditModal(true);
  };

  const openAssignModal = (asset) => {
    setAssigningAsset(asset);
    setAssignData({ employee: '', expectedReturnDate: '', notes: '' });
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await itAssetAPI.assign(assigningAsset._id, assignData);
      toast.success('Asset assigned');
      setShowAssignModal(false);
      setAssigningAsset(null);
      fetchAssets();
      fetchWarrantyExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleReturn = async (id) => {
    try {
      await itAssetAPI.returnAsset(id, {});
      toast.success('Asset returned');
      fetchAssets();
      fetchWarrantyExpiring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (search) {
      const term = search.toLowerCase();
      if (!a.assetTag?.toLowerCase().includes(term) && !a.serialNumber?.toLowerCase().includes(term) && !a.brand?.toLowerCase().includes(term) && !a.model?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">IT Assets</h1>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Asset
        </button>
      </div>

      {warrantyExpiring.length > 0 && (
        <div className="card border-l-4 border-l-yellow-500 bg-yellow-50 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Warranty Expiring Within 30 Days</h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {warrantyExpiring.map((asset) => (
              <span key={asset._id} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {asset.assetTag} — {asset.brand} {asset.model} (expires {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input type="text" className="input-field flex-1" placeholder="Search by asset tag, serial, brand..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-32">
            <option value="">All</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Monitor">Monitor</option>
            <option value="Printer">Printer</option>
            <option value="Server">Server</option>
            <option value="Network">Network</option>
            <option value="Phone">Phone</option>
            <option value="Tablet">Tablet</option>
            <option value="Accessory">Accessory</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-32">
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : filteredAssets.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No assets found</div>
        ) : (
          filteredAssets.map((asset, i) => {
            const isExpanded = expandedId === (asset._id || i);
            return (
              <div key={asset._id || i} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg text-xs font-medium ${typeColors[asset.type] || 'bg-gray-100 text-gray-700'}`}>
                      <Monitor size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{asset.assetTag}</span>
                        <h3 className="font-medium text-gray-900 truncate">{asset.brand} {asset.model}</h3>
                        <span className={`badge ${statusBadges[asset.status] || 'badge-gray'}`}>{asset.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{asset.type}</span>
                        <span>SN: {asset.serialNumber || '—'}</span>
                        <span>Assigned: {asset.assignedTo?.name || asset.assignedTo || '—'}</span>
                        {asset.warrantyExpiry && (
                          <span className={new Date(asset.warrantyExpiry) < new Date() ? 'text-red-500 font-medium' : ''}>
                            Warranty: {new Date(asset.warrantyExpiry).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.status === 'Available' && (
                      <button onClick={() => openAssignModal(asset)} className="btn-secondary btn-sm text-xs">Assign</button>
                    )}
                    {asset.status === 'Issued' && (
                      <button onClick={() => handleReturn(asset._id)} className="btn-secondary btn-sm text-xs">Return</button>
                    )}
                    <button onClick={() => openEditModal(asset)} className="btn-secondary btn-sm"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(asset._id)} className="btn-secondary btn-sm text-red-500"><Trash2 size={14} /></button>
                    <button onClick={() => setExpandedId(isExpanded ? null : (asset._id || i))} className="btn-secondary btn-sm">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Processor</span>
                        <p className="text-gray-900">{asset.processor || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">RAM</span>
                        <p className="text-gray-900">{asset.ram || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Storage</span>
                        <p className="text-gray-900">{asset.storage || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">OS</span>
                        <p className="text-gray-900">{asset.os || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">MAC Address</span>
                        <p className="text-gray-900">{asset.macAddress || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">IP Address</span>
                        <p className="text-gray-900">{asset.ipAddress || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Purchase Date</span>
                        <p className="text-gray-900">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Warranty Expiry</span>
                        <p className={`${asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date() ? 'text-red-500' : 'text-gray-900'}`}>
                          {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    {asset.notes && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-500">Notes</span>
                        <p className="text-sm text-gray-600 mt-1">{asset.notes}</p>
                      </div>
                    )}
                    {asset.assignedTo && (
                      <div className="mt-3 text-xs text-gray-500">
                        Assigned to: <span className="font-medium text-gray-700">{asset.assignedTo?.name || asset.assignedTo}</span>
                        {asset.assignedDate && <> on {new Date(asset.assignedDate).toLocaleDateString()}</>}
                        {asset.expectedReturnDate && <> — Expected return: {new Date(asset.expectedReturnDate).toLocaleDateString()}</>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Asset" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
              <input type="text" className="input-field" value={formData.assetTag} onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
                <option value="Server">Server</option>
                <option value="Network">Network</option>
                <option value="Phone">Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input type="text" className="input-field" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" className="input-field" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input type="text" className="input-field" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processor</label>
              <input type="text" className="input-field" value={formData.processor} onChange={(e) => setFormData({ ...formData, processor: e.target.value })} placeholder="e.g. Intel i7-12700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
              <input type="text" className="input-field" value={formData.ram} onChange={(e) => setFormData({ ...formData, ram: e.target.value })} placeholder="e.g. 16GB DDR4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
              <input type="text" className="input-field" value={formData.storage} onChange={(e) => setFormData({ ...formData, storage: e.target.value })} placeholder="e.g. 512GB SSD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OS</label>
              <input type="text" className="input-field" value={formData.os} onChange={(e) => setFormData({ ...formData, os: e.target.value })} placeholder="e.g. Windows 11 Pro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
              <input type="text" className="input-field" value={formData.macAddress} onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })} placeholder="e.g. 00:1A:2B:3C:4D:5E" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input type="text" className="input-field" value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} placeholder="e.g. 192.168.1.100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
              <input type="date" className="input-field" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Asset</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingAsset(null); resetForm(); }} title="Edit Asset" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
              <input type="text" className="input-field" value={formData.assetTag} onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
                <option value="Server">Server</option>
                <option value="Network">Network</option>
                <option value="Phone">Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input type="text" className="input-field" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" className="input-field" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input type="text" className="input-field" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processor</label>
              <input type="text" className="input-field" value={formData.processor} onChange={(e) => setFormData({ ...formData, processor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
              <input type="text" className="input-field" value={formData.ram} onChange={(e) => setFormData({ ...formData, ram: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
              <input type="text" className="input-field" value={formData.storage} onChange={(e) => setFormData({ ...formData, storage: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OS</label>
              <input type="text" className="input-field" value={formData.os} onChange={(e) => setFormData({ ...formData, os: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
              <input type="text" className="input-field" value={formData.macAddress} onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input type="text" className="input-field" value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
              <input type="date" className="input-field" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowEditModal(false); setEditingAsset(null); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Update Asset</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setAssigningAsset(null); }} title={`Assign Asset: ${assigningAsset?.assetTag || ''}`} size="md">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select className="input-field" value={assignData.employee} onChange={(e) => setAssignData({ ...assignData, employee: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId || emp.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
            <input type="date" className="input-field" value={assignData.expectedReturnDate} onChange={(e) => setAssignData({ ...assignData, expectedReturnDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={assignData.notes} onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowAssignModal(false); setAssigningAsset(null); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Assign Asset</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ITAssetList;
