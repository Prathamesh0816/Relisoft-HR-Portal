import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, User, Briefcase, UserPlus, BadgeCheck, Truck, LogIn, LogOut, XCircle, Eye, Calendar } from 'lucide-react';
import { gatePassAPI, employeeAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const typeIcons = {
  visitor: User,
  candidate: Briefcase,
  new_joinee: UserPlus,
  employee: BadgeCheck,
  vendor: Truck,
};

const typeLabels = {
  visitor: 'Visitor',
  candidate: 'Candidate',
  new_joinee: 'New Joinee',
  employee: 'Employee',
  vendor: 'Vendor',
};

const statusColors = {
  Active: 'badge-success',
  Expired: 'badge-gray',
  Used: 'badge-info',
  Cancelled: 'badge-danger',
  'Checked In': 'badge-warning',
  'Checked Out': 'badge-info',
};

const GatePassList = () => {
  const [passes, setPasses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [formData, setFormData] = useState({
    type: 'visitor', fullName: '', contactNumber: '', email: '', photoUrl: '',
    purpose: '', company: '', idProofType: '', idProofNumber: '',
    visitingTo: '', department: '', validFrom: '', validTo: '',
    assetBrought: '',
  });
  const [checkInData, setCheckInData] = useState({ timestamp: new Date().toISOString().slice(0, 16), remarks: '' });
  const [checkOutData, setCheckOutData] = useState({ timestamp: new Date().toISOString().slice(0, 16), remarks: '' });

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      let data;
      if (tab === 'active') {
        const res = await gatePassAPI.getActive();
        data = res.data;
      } else if (tab === 'today') {
        const res = await gatePassAPI.getToday();
        data = res.data;
      } else {
        const res = await gatePassAPI.getAll(params);
        data = res.data;
      }
      setPasses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch gate passes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeAPI.list({ limit: 500 });
      setEmployees(data.employees || data.data || []);
    } catch {
      // optional
    }
  };

  useEffect(() => { fetchPasses(); }, [tab, filterType, filterStatus]);
  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await gatePassAPI.create(formData);
      toast.success('Gate pass created');
      setShowCreateModal(false);
      setFormData({ type: 'visitor', fullName: '', contactNumber: '', email: '', photoUrl: '', purpose: '', company: '', idProofType: '', idProofNumber: '', visitingTo: '', department: '', validFrom: '', validTo: '', assetBrought: '' });
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedPass) return;
    try {
      await gatePassAPI.checkIn(selectedPass._id, checkInData);
      toast.success('Checked in successfully');
      setShowCheckInModal(false);
      setSelectedPass(null);
      setCheckInData({ timestamp: new Date().toISOString().slice(0, 16), remarks: '' });
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!selectedPass) return;
    try {
      await gatePassAPI.checkOut(selectedPass._id, checkOutData);
      toast.success('Checked out successfully');
      setShowCheckOutModal(false);
      setSelectedPass(null);
      setCheckOutData({ timestamp: new Date().toISOString().slice(0, 16), remarks: '' });
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check out');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this gate pass?')) return;
    try {
      await gatePassAPI.cancel(id);
      toast.success('Gate pass cancelled');
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const getTypeIcon = (type) => {
    const Icon = typeIcons[type] || User;
    return <Icon size={20} className="text-gray-400 flex-shrink-0" />;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gate Passes</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Gate Pass
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'active' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>Active Passes</button>
        <button onClick={() => setTab('today')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'today' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>Today's Passes</button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'all' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>All Passes</button>
      </div>

      <div className="card flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            {Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Expired">Expired</option>
            <option value="Used">Used</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : passes.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No gate passes found</div>
        ) : (
          passes.map((pass, i) => {
            const isExpanded = expandedId === (pass._id || i);
            return (
              <div key={pass._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (pass._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getTypeIcon(pass.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{pass.passNumber || pass._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{pass.fullName}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{typeLabels[pass.type] || pass.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{pass.contactNumber}</span>
                        <span className="text-xs text-gray-500">{pass.purpose}</span>
                        <span className={`badge ${statusColors[pass.status] || 'badge-gray'}`}>{pass.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Name:</span> <span className="font-medium">{pass.fullName}</span></div>
                      <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{pass.contactNumber}</span></div>
                      <div><span className="text-gray-500">Email:</span> <span className="font-medium">{pass.email || '—'}</span></div>
                      <div><span className="text-gray-500">Type:</span> <span className="font-medium">{typeLabels[pass.type] || pass.type}</span></div>
                      <div><span className="text-gray-500">Company:</span> <span className="font-medium">{pass.company || '—'}</span></div>
                      <div><span className="text-gray-500">Purpose:</span> <span className="font-medium">{pass.purpose}</span></div>
                      <div><span className="text-gray-500">Department:</span> <span className="font-medium">{pass.department || '—'}</span></div>
                      <div><span className="text-gray-500">Visiting To:</span> <span className="font-medium">{pass.visitingTo?.name || pass.visitingTo || '—'}</span></div>
                      {pass.idProofType && (
                        <>
                          <div><span className="text-gray-500">ID Proof:</span> <span className="font-medium">{pass.idProofType}</span></div>
                          <div><span className="text-gray-500">ID Number:</span> <span className="font-medium">{pass.idProofNumber}</span></div>
                        </>
                      )}
                      <div><span className="text-gray-500">Valid From:</span> <span className="font-medium">{pass.validFrom ? new Date(pass.validFrom).toLocaleString() : '—'}</span></div>
                      <div><span className="text-gray-500">Valid To:</span> <span className="font-medium">{pass.validTo ? new Date(pass.validTo).toLocaleString() : '—'}</span></div>
                      {pass.assetBrought && <div><span className="text-gray-500">Asset Brought:</span> <span className="font-medium">{pass.assetBrought}</span></div>}
                    </div>

                    {pass.photoUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Photo</h4>
                        <img src={pass.photoUrl} alt={pass.fullName} className="w-20 h-20 rounded-lg object-cover border" />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      {pass.status === 'Active' && (
                        <button onClick={() => { setSelectedPass(pass); setShowCheckInModal(true); }} className="btn-success text-xs flex items-center gap-1"><LogIn size={14} /> Check In</button>
                      )}
                      {(pass.status === 'Checked In') && (
                        <button onClick={() => { setSelectedPass(pass); setShowCheckOutModal(true); }} className="btn-primary text-xs flex items-center gap-1"><LogOut size={14} /> Check Out</button>
                      )}
                      {(pass.status === 'Active' || pass.status === 'Checked In') && (
                        <button onClick={() => handleCancel(pass._id)} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Cancel</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Gate Pass" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="visitor">Visitor</option>
                <option value="candidate">Candidate</option>
                <option value="new_joinee">New Joinee</option>
                <option value="employee">Employee</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input type="url" className="input-field" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" className="input-field" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" className="input-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
              <input type="text" className="input-field" value={formData.idProofType} onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })} placeholder="Driving License, Passport..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number</label>
              <input type="text" className="input-field" value={formData.idProofNumber} onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visiting To (Employee)</label>
            <select className="input-field" value={formData.visitingTo} onChange={(e) => setFormData({ ...formData, visitingTo: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From <span className="text-red-500">*</span></label>
              <input type="datetime-local" className="input-field" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To <span className="text-red-500">*</span></label>
              <input type="datetime-local" className="input-field" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Brought</label>
            <input type="text" className="input-field" value={formData.assetBrought} onChange={(e) => setFormData({ ...formData, assetBrought: e.target.value })} placeholder="Laptop, bag, etc." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Gate Pass</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCheckInModal} onClose={() => { setShowCheckInModal(false); setSelectedPass(null); }} title="Check In" size="sm">
        {selectedPass && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Check in <strong>{selectedPass.fullName}</strong> (Pass #{selectedPass.passNumber || selectedPass._id?.slice(-6)})</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
              <input type="datetime-local" className="input-field" value={checkInData.timestamp} onChange={(e) => setCheckInData({ ...checkInData, timestamp: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" className="input-field" value={checkInData.remarks} onChange={(e) => setCheckInData({ ...checkInData, remarks: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowCheckInModal(false); setSelectedPass(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handleCheckIn} className="btn-success flex items-center gap-1"><LogIn size={16} /> Check In</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCheckOutModal} onClose={() => { setShowCheckOutModal(false); setSelectedPass(null); }} title="Check Out" size="sm">
        {selectedPass && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Check out <strong>{selectedPass.fullName}</strong> (Pass #{selectedPass.passNumber || selectedPass._id?.slice(-6)})</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
              <input type="datetime-local" className="input-field" value={checkOutData.timestamp} onChange={(e) => setCheckOutData({ ...checkOutData, timestamp: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" className="input-field" value={checkOutData.remarks} onChange={(e) => setCheckOutData({ ...checkOutData, remarks: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowCheckOutModal(false); setSelectedPass(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handleCheckOut} className="btn-primary flex items-center gap-1"><LogOut size={16} /> Check Out</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GatePassList;
