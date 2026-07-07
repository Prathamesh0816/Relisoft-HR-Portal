import { useState, useEffect } from 'react';
import { Package, Search, Clock, Layers, Send, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { serviceCatalogAPI, serviceCategoryAPI, serviceRequestAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const priorityConfig = {
  Urgent: { color: 'bg-red-100 text-red-800 border-red-300' },
  High: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  Medium: { color: 'bg-relisoft-100 text-relisoft-800 border-relisoft-300' },
  Low: { color: 'bg-gray-100 text-gray-800 border-gray-300' },
};

const statusColors = {
  Pending: 'badge-warning',
  Submitted: 'badge-info',
  Approved: 'badge-success',
  'In Progress': 'badge-info',
  Fulfilled: 'badge-success',
  Rejected: 'badge-danger',
  Cancelled: 'badge-gray',
};

const ServiceCatalogPage = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const fetchCatalog = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const { data } = await serviceCatalogAPI.getAll(params);
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch catalog');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await serviceCategoryAPI.getAll();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // silent
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data } = await serviceRequestAPI.getMy();
      setMyRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch requests');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'catalog') {
      setLoading(true);
      Promise.all([fetchCatalog()]).finally(() => setLoading(false));
    } else {
      setLoading(true);
      fetchMyRequests().finally(() => setLoading(false));
    }
  }, [activeTab, filterCategory]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    const initial = {};
    if (item.formFields && Array.isArray(item.formFields)) {
      item.formFields.forEach((f) => {
        initial[f.name] = f.type === 'checkbox' ? [] : '';
      });
    }
    setFormData(initial);
    setFormErrors({});
    setShowRequestModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (selectedItem?.formFields) {
      selectedItem.formFields.forEach((f) => {
        if (f.required && !formData[f.name]) {
          errors[f.name] = `${f.label} is required`;
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await serviceRequestAPI.create({
        serviceItem: selectedItem._id,
        fields: formData,
      });
      toast.success('Service request submitted');
      setShowRequestModal(false);
      setSelectedItem(null);
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await serviceRequestAPI.cancel(id);
      toast.success('Request cancelled');
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filteredItems = items.filter((item) => {
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredRequests = myRequests.filter((req) => {
    if (filterStatus && req.status !== filterStatus) return false;
    return true;
  });

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
      case 'dropdown':
        return (
          <select
            className="input-field"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            className="input-field"
            rows={3}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        );
      case 'checkbox':
        return (
          <div className="space-y-1">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(formData[field.name] || []).includes(opt)}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    if (e.target.checked) {
                      setFormData({ ...formData, [field.name]: [...current, opt] });
                    } else {
                      setFormData({ ...formData, [field.name]: current.filter((v) => v !== opt) });
                    }
                  }}
                  className="rounded border-gray-300"
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            className="input-field"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            className="input-field"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Service Catalog</h1>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-relisoft-500 text-relisoot-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={16} className="inline mr-1" /> Browse Catalog
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-relisoft-500 text-relisoft-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send size={16} className="inline mr-1" /> My Requests
        </button>
      </div>

      {activeTab === 'catalog' && (
        <>
          <div className="card flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field w-44"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name || cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">No services found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item)}
                  className="card cursor-pointer hover:border-relisoft-300 transition-all border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-relisoft-50 text-relisoft-600">
                      <Package size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category?.name || item.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                      item.active === false ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-green-100 text-green-700 border-green-300'
                    }`}>
                      {item.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    {item.priority && (
                      <span className={`px-2 py-0.5 rounded-full border ${priorityConfig[item.priority]?.color || priorityConfig.Medium.color}`}>
                        {item.priority}
                      </span>
                    )}
                    {item.slaHours && (
                      <span className="flex items-center gap-1"><Clock size={12} /> SLA: {item.slaHours}h</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <>
          <div className="card flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-36"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">No requests found</div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req, i) => {
                const isExpanded = expandedId === (req._id || i);
                return (
                  <div key={req._id || i} className="card">
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : (req._id || i))}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-400">#{req.requestId || req._id?.slice(-6)}</span>
                            <h3 className="font-medium text-gray-900 truncate">{req.serviceItem?.name || req.serviceItem}</h3>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`badge ${statusColors[req.status] || 'badge-gray'}`}>{req.status}</span>
                            <span className="text-xs text-gray-500">{req.serviceItem?.category?.name || req.category}</span>
                            <span className="text-xs text-gray-400">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Request Details</h4>
                          {req.fields && Object.entries(req.fields).map(([key, val]) => (
                            <div key={key} className="text-sm text-gray-600 mb-1">
                              <span className="font-medium text-gray-700">{key}:</span> {Array.isArray(val) ? val.join(', ') : String(val)}
                            </div>
                          ))}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Chain</h4>
                          {(req.approvals || []).length === 0 ? (
                            <p className="text-sm text-gray-400">No approvals yet</p>
                          ) : (
                            <div className="space-y-2">
                              {req.approvals.map((a, ai) => (
                                <div key={ai} className="flex items-center gap-2 text-sm">
                                  {a.status === 'Approved' ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                  ) : a.status === 'Rejected' ? (
                                    <XCircle size={16} className="text-red-500" />
                                  ) : (
                                    <AlertCircle size={16} className="text-yellow-500" />
                                  )}
                                  <span>{a.approver?.name || 'Pending Approver'}</span>
                                  <span className={`badge ${statusColors[a.status] || 'badge-gray'}`}>{a.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          {(req.status === 'Pending' || req.status === 'Submitted') && (
                            <button onClick={() => handleCancel(req._id)} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Cancel Request</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showRequestModal} onClose={() => { setShowRequestModal(false); setSelectedItem(null); }} title={selectedItem ? `Request: ${selectedItem.name}` : 'Create Request'} size="lg">
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {selectedItem?.description && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedItem.description}</p>
          )}
          {selectedItem?.formFields && selectedItem.formFields.length > 0 ? (
            selectedItem.formFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {formErrors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[field.name]}</p>
                )}
              </div>
            ))
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.details || ''}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Describe your request..."
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowRequestModal(false); setSelectedItem(null); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1"><Send size={16} /> Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceCatalogPage;
