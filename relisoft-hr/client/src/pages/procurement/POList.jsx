import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Send, Truck, XCircle, FileText } from 'lucide-react';
import { purchaseOrderAPI, vendorAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Draft: 'badge-gray',
  Sent: 'badge-info',
  Accepted: 'badge-success',
  'Partially Received': 'badge-warning',
  'Fully Received': 'badge-success',
  Cancelled: 'badge-danger',
};

const POList = () => {
  const [pos, setPos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [receiveQty, setReceiveQty] = useState({});
  const [formData, setFormData] = useState({
    vendor: '', poNumber: '', deliveryDate: '', notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, unit: 'pcs' }],
    tax: 0, shipping: 0,
  });

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterVendor) params.vendor = filterVendor;
      const { data } = await purchaseOrderAPI.getAll(params);
      setPos(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data } = await vendorAPI.list();
      setVendors(Array.isArray(data) ? data : data.data || []);
    } catch {
      // vendor fetch is optional
    }
  };

  useEffect(() => { fetchPOs(); }, [filterStatus, filterVendor]);
  useEffect(() => { fetchVendors(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await purchaseOrderAPI.create(formData);
      toast.success('Purchase order created');
      setShowCreateModal(false);
      setFormData({ vendor: '', poNumber: '', deliveryDate: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, unit: 'pcs' }], tax: 0, shipping: 0 });
      fetchPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleSend = async (id) => {
    try {
      await purchaseOrderAPI.sendToVendor(id);
      toast.success('PO sent to vendor');
      fetchPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const handleReceive = async () => {
    if (!selectedPo) return;
    try {
      const items = selectedPo.items.map((item) => ({
        _id: item._id,
        receivedQty: Number(receiveQty[item._id] || 0),
      }));
      await purchaseOrderAPI.receiveItems(selectedPo._id, { items });
      toast.success('Items received');
      setShowReceiveModal(false);
      setSelectedPo(null);
      setReceiveQty({});
      fetchPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to receive items');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this purchase order?')) return;
    try {
      await purchaseOrderAPI.cancel(id);
      toast.success('PO cancelled');
      fetchPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const openReceive = (po) => {
    setSelectedPo(po);
    const initial = {};
    (po.items || []).forEach((item) => { initial[item._id] = item.receivedQty || 0; });
    setReceiveQty(initial);
    setShowReceiveModal(true);
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, unit: 'pcs' }] });
  };

  const removeItem = (idx) => {
    if (formData.items.length <= 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = value;
    setFormData({ ...formData, items });
  };

  const calcSubtotal = (items) => items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const calcTotal = (items, tax, shipping) => calcSubtotal(items) + Number(tax) + Number(shipping);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create PO
        </button>
      </div>

      <div className="card flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
            <option value="">All</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Fully Received">Fully Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Vendor:</label>
          <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="input-field w-44">
            <option value="">All Vendors</option>
            {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : pos.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No purchase orders found</div>
        ) : (
          pos.map((po, i) => {
            const isExpanded = expandedId === (po._id || i);
            const items = po.items || [];
            const subTotal = calcSubtotal(items);
            const total = calcTotal(items, po.tax || 0, po.shipping || 0);
            return (
              <div key={po._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (po._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{po.poNumber || po._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{po.vendor?.name || po.vendor || 'Unknown Vendor'}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{items.length} item(s)</span>
                        <span className="text-xs font-medium text-gray-700">${total.toFixed(2)}</span>
                        <span className={`badge ${statusColors[po.status] || 'badge-gray'}`}>{po.status || 'Draft'}</span>
                        {po.deliveryDate && <span className="text-xs text-gray-400">Delivery: {new Date(po.deliveryDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Line Items</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Qty Ordered</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Qty Received</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Unit Price</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">{item.receivedQty || 0}</td>
                              <td className="px-3 py-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-medium">${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-right mt-2 space-y-1 text-sm">
                        <div className="text-gray-600">Subtotal: ${subTotal.toFixed(2)}</div>
                        <div className="text-gray-600">Tax: ${Number(po.tax || 0).toFixed(2)}</div>
                        <div className="text-gray-600">Shipping: ${Number(po.shipping || 0).toFixed(2)}</div>
                        <div className="font-semibold text-gray-900">Total: ${total.toFixed(2)}</div>
                      </div>
                    </div>

                    {po.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{po.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {po.status === 'Draft' && (
                        <>
                          <button onClick={() => handleSend(po._id)} className="btn-primary text-xs flex items-center gap-1"><Send size={14} /> Send to Vendor</button>
                          <button onClick={() => handleCancel(po._id)} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Cancel</button>
                        </>
                      )}
                      {(po.status === 'Sent' || po.status === 'Accepted' || po.status === 'Partially Received') && (
                        <>
                          <button onClick={() => openReceive(po)} className="btn-success text-xs flex items-center gap-1"><Truck size={14} /> Receive Items</button>
                          <button onClick={() => handleCancel(po._id)} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Purchase Order" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
              <select className="input-field" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} required>
                <option value="">Select Vendor</option>
                {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
              <input type="text" className="input-field" value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} placeholder="Auto if empty" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" className="input-field" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button type="button" onClick={addItem} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Add Item</button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input type="text" placeholder="Description" className="input-field flex-1" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
                  <input type="number" placeholder="Qty" className="input-field w-16" value={item.quantity} min="1" onChange={(e) => updateItem(idx, 'quantity', Math.max(1, e.target.value))} required />
                  <input type="text" placeholder="Unit" className="input-field w-16" value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} />
                  <input type="number" placeholder="Unit Price" className="input-field w-24" value={item.unitPrice} min="0" step="0.01" onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} required />
                  <span className="text-sm font-medium text-gray-700 pt-2 w-20 text-right">${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</span>
                  <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ($)</label>
              <input type="number" className="input-field" value={formData.tax} min="0" step="0.01" onChange={(e) => setFormData({ ...formData, tax: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping ($)</label>
              <input type="number" className="input-field" value={formData.shipping} min="0" step="0.01" onChange={(e) => setFormData({ ...formData, shipping: e.target.value })} />
            </div>
          </div>
          <div className="text-right text-sm font-semibold text-gray-700">Total: ${calcTotal(formData.items, formData.tax, formData.shipping).toFixed(2)}</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create PO</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showReceiveModal} onClose={() => { setShowReceiveModal(false); setSelectedPo(null); setReceiveQty({}); }} title="Receive Items" size="lg">
        {selectedPo && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Receiving items for PO #{selectedPo.poNumber || selectedPo._id?.slice(-6)}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Item</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Ordered</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Received</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Now Receiving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(selectedPo.items || []).map((item) => (
                  <tr key={item._id}>
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.receivedQty || 0}</td>
                    <td className="px-3 py-2 text-right">
                      <input type="number" className="input-field w-20 text-right" min="0" max={item.quantity - (item.receivedQty || 0)} value={receiveQty[item._id] || 0} onChange={(e) => setReceiveQty({ ...receiveQty, [item._id]: Math.max(0, Math.min(Number(e.target.value), item.quantity - (item.receivedQty || 0))) })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowReceiveModal(false); setSelectedPo(null); setReceiveQty({}); }} className="btn-secondary">Cancel</button>
              <button onClick={handleReceive} className="btn-success flex items-center gap-1"><Truck size={16} /> Receive</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default POList;
