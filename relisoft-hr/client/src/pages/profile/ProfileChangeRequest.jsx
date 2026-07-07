import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, CheckCircle, XCircle, Edit3, Eye } from 'lucide-react';
import { profileChangeRequestAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
};

const sectionFields = {
  personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'nationality'],
  contact: ['email', 'phone', 'workPhone', 'personalEmail'],
  bank: ['accountNumber', 'bankName', 'ifscCode', 'panNumber', 'uanNumber'],
  emergency: ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'],
  address: ['residentialAddress', 'permanentAddress', 'city', 'state', 'pincode', 'country'],
};

const fieldLabels = {
  firstName: 'First Name', lastName: 'Last Name', dateOfBirth: 'Date of Birth',
  gender: 'Gender', maritalStatus: 'Marital Status', nationality: 'Nationality',
  email: 'Email', phone: 'Phone', workPhone: 'Work Phone', personalEmail: 'Personal Email',
  accountNumber: 'Account Number', bankName: 'Bank Name', ifscCode: 'IFSC Code',
  panNumber: 'PAN Number', uanNumber: 'UAN Number',
  emergencyContactName: 'Emergency Contact Name', emergencyContactPhone: 'Emergency Contact Phone',
  emergencyContactRelation: 'Relation',
  residentialAddress: 'Residential Address', permanentAddress: 'Permanent Address',
  city: 'City', state: 'State', pincode: 'Pincode', country: 'Country',
};

const ProfileChangeRequest = () => {
  const [requests, setRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [formData, setFormData] = useState({ section: 'personal', field: '', newValue: '' });
  const [currentValue, setCurrentValue] = useState('');

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const { data } = await profileChangeRequestAPI.getMy();
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch your requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const { data } = await profileChangeRequestAPI.getAll({ status: 'Pending' });
      setPendingApprovals(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'my') fetchMyRequests();
    else fetchPendingApprovals();
  }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await profileChangeRequestAPI.create(formData);
      toast.success('Profile change request submitted');
      setShowCreateModal(false);
      setFormData({ section: 'personal', field: '', newValue: '' });
      setCurrentValue('');
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await profileChangeRequestAPI.approve(selectedRequest._id, { notes: reviewerNotes });
      toast.success('Request approved');
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewerNotes('');
      fetchPendingApprovals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await profileChangeRequestAPI.reject(selectedRequest._id, { notes: reviewerNotes });
      toast.success('Request rejected');
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewerNotes('');
      fetchPendingApprovals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const openCreateModal = () => {
    setFormData({ section: 'personal', field: '', newValue: '' });
    setCurrentValue('');
    setShowCreateModal(true);
  };

  const availableFields = sectionFields[formData.section] || [];

  const handleSectionChange = (section) => {
    setFormData({ section, field: '', newValue: '' });
    setCurrentValue('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile Change Requests</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Request Profile Change
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab('my')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'my' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>My Requests</button>
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'pending' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>Pending Approvals</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : tab === 'my' && requests.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No profile change requests</div>
        ) : tab === 'pending' && pendingApprovals.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No pending approvals</div>
        ) : (
          (tab === 'my' ? requests : pendingApprovals).map((req, i) => {
            const isExpanded = expandedId === (req._id || i);
            return (
              <div key={req._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (req._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Edit3 size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{fieldLabels[req.field] || req.field}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize">{req.section}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{req.employee?.name || req.employee || '—'}</span>
                        <span className={`badge ${statusColors[req.status] || 'badge-gray'}`}>{req.status || 'Pending'}</span>
                        {req.createdAt && <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                      <div>
                        <span className="text-gray-500">Section:</span>
                        <span className="font-medium ml-2 capitalize">{req.section}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Field:</span>
                        <span className="font-medium ml-2">{fieldLabels[req.field] || req.field}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Current Value:</span>
                        <span className="font-medium ml-2">{req.oldValue || req.currentValue || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">New Value:</span>
                        <span className="font-medium ml-2 text-relisoft-700">{req.newValue}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{req.notes}</p>
                      </div>
                    )}

                    {tab === 'pending' && req.status === 'Pending' && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => { setSelectedRequest(req); setReviewerNotes(''); setShowReviewModal(true); }} className="btn-success text-xs flex items-center gap-1"><Eye size={14} /> Review</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Request Profile Change" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
            <select className="input-field" value={formData.section} onChange={(e) => handleSectionChange(e.target.value)} required>
              <option value="personal">Personal</option>
              <option value="contact">Contact</option>
              <option value="bank">Bank</option>
              <option value="emergency">Emergency</option>
              <option value="address">Address</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field <span className="text-red-500">*</span></label>
            <select className="input-field" value={formData.field} onChange={(e) => {
              setFormData({ ...formData, field: e.target.value });
              setCurrentValue(`Current ${fieldLabels[e.target.value] || e.target.value} value`);
            }} required>
              <option value="">Select Field</option>
              {availableFields.map((f) => <option key={f} value={f}>{fieldLabels[f] || f}</option>)}
            </select>
          </div>
          {currentValue && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <div className="input-field bg-gray-50 text-gray-500">{currentValue}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Value <span className="text-red-500">*</span></label>
            <input type="text" className="input-field" value={formData.newValue} onChange={(e) => setFormData({ ...formData, newValue: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setSelectedRequest(null); setReviewerNotes(''); }} title="Review Change Request" size="md">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Field:</span> <span className="font-medium ml-2">{fieldLabels[selectedRequest.field] || selectedRequest.field}</span></p>
              <p><span className="text-gray-500">Section:</span> <span className="font-medium ml-2 capitalize">{selectedRequest.section}</span></p>
              <p><span className="text-gray-500">Current:</span> <span className="font-medium ml-2">{selectedRequest.oldValue || selectedRequest.currentValue || '—'}</span></p>
              <p><span className="text-gray-500">New:</span> <span className="font-medium ml-2 text-relisoft-700">{selectedRequest.newValue}</span></p>
              <p><span className="text-gray-500">Requested by:</span> <span className="font-medium ml-2">{selectedRequest.employee?.name || selectedRequest.employee || '—'}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Notes</label>
              <textarea className="input-field" rows={3} value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} placeholder="Optional notes..." />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={handleReject} className="btn-secondary flex items-center gap-1"><XCircle size={16} /> Reject</button>
              <button onClick={handleApprove} className="btn-success flex items-center gap-1"><CheckCircle size={16} /> Approve</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileChangeRequest;
