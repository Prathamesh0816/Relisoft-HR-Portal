import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Monitor, CheckCircle, XCircle, AlertTriangle, Package, ClipboardList, Wrench } from 'lucide-react';
import { assetAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatsCard from '../../components/common/StatsCard';
import toast from 'react-hot-toast';

const statusColors = {
  Available: 'badge-success',
  Issued: 'badge-info',
  Lost: 'badge-danger',
  Damaged: 'badge-warning',
};

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '', type: '', brand: '', model: '', serialNo: '',
    purchaseDate: '', cost: '', warrantyExpiry: '',
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const { data } = await assetAPI.getAll(params);
      setAssets(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await assetAPI.update(editingAsset._id, formData);
        toast.success('Asset updated successfully');
      } else {
        await assetAPI.create(formData);
        toast.success('Asset created successfully');
      }
      setShowAddModal(false);
      setEditingAsset(null);
      setFormData({ name: '', type: '', brand: '', model: '', serialNo: '', purchaseDate: '', cost: '', warrantyExpiry: '' });
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleAssign = async (id, employeeId) => {
    try {
      await assetAPI.assign(id, { assignedTo: employeeId });
      toast.success('Asset assigned successfully');
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleReturn = async (id) => {
    try {
      await assetAPI.return(id);
      toast.success('Asset returned successfully');
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await assetAPI.delete(id);
      toast.success('Asset deleted successfully');
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name || '',
      type: asset.type || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serialNo: asset.serialNo || '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      cost: asset.cost || '',
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
    });
    setShowAddModal(true);
  };

  const stats = {
    total: assets.length,
    available: assets.filter((a) => a.status === 'Available').length,
    issued: assets.filter((a) => a.status === 'Issued').length,
    damaged: assets.filter((a) => a.status === 'Damaged').length,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Asset Management</h1>
        <button onClick={() => { setEditingAsset(null); setFormData({ name: '', type: '', brand: '', model: '', serialNo: '', purchaseDate: '', cost: '', warrantyExpiry: '' }); setShowAddModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Assets" value={stats.total} icon={Package} color="relisoft" />
        <StatsCard title="Available" value={stats.available} icon={CheckCircle} color="green" />
        <StatsCard title="Issued" value={stats.issued} icon={ClipboardList} color="relisoft" />
        <StatsCard title="Damaged" value={stats.damaged} icon={Wrench} color="orange" />
      </div>

      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-40">
            <option value="">All Types</option>
            <option value="Laptop">Laptop</option>
            <option value="Monitor">Monitor</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Mouse">Mouse</option>
            <option value="Phone">Phone</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Asset Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Brand</th>
                <th className="table-header">Serial No.</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center text-gray-500 py-8">No assets found</td></tr>
              ) : (
                assets.map((asset, i) => (
                  <tr key={asset._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{asset.name}</td>
                    <td className="table-cell">{asset.type}</td>
                    <td className="table-cell">{asset.brand}</td>
                    <td className="table-cell">{asset.serialNo || '—'}</td>
                    <td className="table-cell"><span className={`badge ${statusColors[asset.status] || 'badge-gray'}`}>{asset.status}</span></td>
                    <td className="table-cell">{asset.assignedTo?.name || asset.assignedTo || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {asset.status === 'Available' ? (
                          <button onClick={() => { const e = prompt('Enter employee ID/name:'); if (e) handleAssign(asset._id, e); }} className="btn-success text-xs px-2 py-1">Assign</button>
                        ) : (
                          <button onClick={() => handleReturn(asset._id)} className="btn-secondary text-xs px-2 py-1">Return</button>
                        )}
                        <button onClick={() => openEdit(asset)} className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(asset._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingAsset ? 'Edit Asset' : 'Add New Asset'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
              <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Mouse">Mouse</option>
                <option value="Phone">Phone</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" className="input-field" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" className="input-field" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial No.</label>
              <input type="text" className="input-field" value={formData.serialNo} onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input type="number" className="input-field" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
              <input type="date" className="input-field" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingAsset ? 'Update' : 'Create'} Asset</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetList;
