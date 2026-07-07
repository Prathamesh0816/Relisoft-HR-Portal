import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Package, Truck } from 'lucide-react';
import { goodsReceiptAPI, purchaseOrderAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  Completed: 'badge-success',
  'Partially Completed': 'badge-info',
};

const GRNList = () => {
  const [grns, setGrns] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState('');
  const [grnItems, setGrnItems] = useState([]);
  const [formData, setFormData] = useState({
    po: '', receivedBy: '', remarks: '', items: [],
  });

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const { data } = await goodsReceiptAPI.getAll();
      setGrns(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch goods receipt notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPOs = async () => {
    try {
      const { data } = await purchaseOrderAPI.getAll({ status: 'Partially Received,Fully Received' });
      setPos(Array.isArray(data) ? data : data.data || []);
    } catch {
      // optional
    }
  };

  useEffect(() => { fetchGRNs(); }, []);
  useEffect(() => { fetchPOs(); }, []);

  const handlePoSelect = async (poId) => {
    setSelectedPo(poId);
    if (!poId) {
      setGrnItems([]);
      return;
    }
    try {
      const { data } = await purchaseOrderAPI.getById(poId);
      const po = data.data || data;
      if (po && po.items) {
        const items = po.items.map((item) => ({
          purchaseOrderItem: item._id,
          description: item.description,
          orderedQty: item.quantity,
          receivedSoFar: item.receivedQty || 0,
          receivedQty: 0,
        }));
        setGrnItems(items);
        setFormData((prev) => ({ ...prev, po: poId }));
      }
    } catch {
      toast.error('Failed to load PO details');
    }
  };

  const updateGrnItem = (idx, value) => {
    const items = [...grnItems];
    items[idx].receivedQty = Math.max(0, Math.min(Number(value), items[idx].orderedQty - items[idx].receivedSoFar));
    setGrnItems(items);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        items: grnItems.filter((item) => item.receivedQty > 0),
      };
      await goodsReceiptAPI.create(payload);
      toast.success('Goods receipt note created');
      setShowCreateModal(false);
      setFormData({ po: '', receivedBy: '', remarks: '', items: [] });
      setGrnItems([]);
      setSelectedPo('');
      fetchGRNs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create GRN');
    }
  };

  const totalQty = (items) => items.reduce((sum, item) => sum + Number(item.receivedQty || item.quantity || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Goods Receipt Notes</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create GRN
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : grns.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No goods receipt notes found</div>
        ) : (
          grns.map((grn, i) => {
            const isExpanded = expandedId === (grn._id || i);
            const items = grn.items || [];
            return (
              <div key={grn._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (grn._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Package size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{grn.grnNumber || grn._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">PO #{grn.po?.poNumber || grn.po?._id?.slice(-6) || '—'}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{grn.receivedBy?.name || grn.receivedBy || '—'}</span>
                        <span className={`badge ${statusColors[grn.status] || 'badge-gray'}`}>{grn.status || 'Pending'}</span>
                        <span className="text-xs text-gray-400">{totalQty(items)} item(s)</span>
                        {grn.receivedDate && <span className="text-xs text-gray-400">{new Date(grn.receivedDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Received Items</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Qty Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-right">{item.receivedQty || item.quantity || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {grn.remarks && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Remarks</h4>
                        <p className="text-sm text-gray-600">{grn.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setGrnItems([]); setSelectedPo(''); }} title="Create Goods Receipt Note" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order <span className="text-red-500">*</span></label>
            <select className="input-field" value={selectedPo} onChange={(e) => handlePoSelect(e.target.value)} required>
              <option value="">Select PO</option>
              {pos.map((po) => (
                <option key={po._id} value={po._id}>PO #{po.poNumber || po._id?.slice(-6)} — {po.vendor?.name || 'Unknown'}</option>
              ))}
            </select>
          </div>
          {grnItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Ordered</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Received</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Now Receiving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grnItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-right">{item.orderedQty}</td>
                      <td className="px-3 py-2 text-right">{item.receivedSoFar}</td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" className="input-field w-20 text-right" min="0" max={item.orderedQty - item.receivedSoFar} value={item.receivedQty} onChange={(e) => updateGrnItem(idx, e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input type="text" className="input-field" value={formData.receivedBy} onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea className="input-field" rows={2} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); setGrnItems([]); setSelectedPo(''); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1"><Truck size={16} /> Create GRN</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GRNList;
