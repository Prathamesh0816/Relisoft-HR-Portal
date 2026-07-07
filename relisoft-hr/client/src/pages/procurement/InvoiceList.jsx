import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, DollarSign, Upload, Search } from 'lucide-react';
import { invoiceAPI, vendorAPI, purchaseOrderAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-gray',
  'Under Review': 'badge-info',
  Matched: 'badge-success',
  Approved: 'badge-success',
  Paid: 'badge-success',
  Disputed: 'badge-danger',
};

const matchStatusColors = {
  Unmatched: 'badge-gray',
  Matched: 'badge-success',
  Partial: 'badge-warning',
  Discrepancy: 'badge-danger',
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterMatch, setFilterMatch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '', vendor: '', purchaseOrder: '', amount: '', dueDate: '', notes: '',
  });
  const [matchData, setMatchData] = useState({
    purchaseOrder: '', goodsReceipt: '', notes: '',
  });
  const [payData, setPayData] = useState({
    paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '',
  });
  const [disputeReason, setDisputeReason] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterVendor) params.vendor = filterVendor;
      if (filterMatch) params.matchStatus = filterMatch;
      const { data } = await invoiceAPI.getAll(params);
      setInvoices(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorsAndPOs = async () => {
    try {
      const [vRes, pRes] = await Promise.allSettled([vendorAPI.list(), purchaseOrderAPI.getAll()]);
      if (vRes.status === 'fulfilled') {
        const vData = vRes.value.data;
        setVendors(Array.isArray(vData) ? vData : vData.data || []);
      }
      if (pRes.status === 'fulfilled') {
        const pData = pRes.value.data;
        setPos(Array.isArray(pData) ? pData : pData.data || []);
      }
    } catch {
      // optional
    }
  };

  useEffect(() => { fetchInvoices(); }, [filterStatus, filterVendor, filterMatch]);
  useEffect(() => { fetchVendorsAndPOs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await invoiceAPI.create(formData);
      toast.success('Invoice created');
      setShowCreateModal(false);
      setFormData({ invoiceNumber: '', vendor: '', purchaseOrder: '', amount: '', dueDate: '', notes: '' });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleMatch = async () => {
    if (!selectedInvoice) return;
    try {
      await invoiceAPI.matchInvoice(selectedInvoice._id, matchData);
      toast.success('Invoice matched');
      setShowMatchModal(false);
      setSelectedInvoice(null);
      setMatchData({ purchaseOrder: '', goodsReceipt: '', notes: '' });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to match');
    }
  };

  const handleApprove = async (id) => {
    try {
      await invoiceAPI.approveInvoice(id);
      toast.success('Invoice approved');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handlePay = async () => {
    if (!selectedInvoice) return;
    try {
      await invoiceAPI.payInvoice(selectedInvoice._id, payData);
      toast.success('Invoice marked as paid');
      setShowPayModal(false);
      setSelectedInvoice(null);
      setPayData({ paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '' });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pay');
    }
  };

  const handleDispute = async () => {
    if (!selectedInvoice || !disputeReason.trim()) return;
    try {
      await invoiceAPI.disputeInvoice(selectedInvoice._id, { reason: disputeReason });
      toast.success('Invoice disputed');
      setShowDisputeModal(false);
      setSelectedInvoice(null);
      setDisputeReason('');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispute');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="card flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Matched">Matched</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Disputed">Disputed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Vendor:</label>
          <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="input-field w-44">
            <option value="">All Vendors</option>
            {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Match Status:</label>
          <select value={filterMatch} onChange={(e) => setFilterMatch(e.target.value)} className="input-field w-36">
            <option value="">All</option>
            <option value="Unmatched">Unmatched</option>
            <option value="Matched">Matched</option>
            <option value="Partial">Partial</option>
            <option value="Discrepancy">Discrepancy</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
          ))
        ) : invoices.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No invoices found</div>
        ) : (
          invoices.map((inv, i) => {
            const isExpanded = expandedId === (inv._id || i);
            return (
              <div key={inv._id || i} className="card">
                <div onClick={() => setExpandedId(isExpanded ? null : (inv._id || i))} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{inv.invoiceNumber || inv._id?.slice(-6)}</span>
                        <h3 className="font-medium text-gray-900 truncate">{inv.vendor?.name || inv.vendor || 'Unknown Vendor'}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">${Number(inv.amount).toFixed(2)}</span>
                        <span className="text-xs text-gray-400">PO #{inv.purchaseOrder?.poNumber || inv.purchaseOrder?._id?.slice(-6) || '—'}</span>
                        <span className={`badge ${statusColors[inv.status] || 'badge-gray'}`}>{inv.status || 'Pending'}</span>
                        {inv.matchStatus && <span className={`badge ${matchStatusColors[inv.matchStatus] || 'badge-gray'}`}>{inv.matchStatus}</span>}
                        {inv.dueDate && <span className="text-xs text-gray-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Invoice #:</span> <span className="font-medium">{inv.invoiceNumber}</span></div>
                      <div><span className="text-gray-500">Vendor:</span> <span className="font-medium">{inv.vendor?.name || inv.vendor}</span></div>
                      <div><span className="text-gray-500">Amount:</span> <span className="font-medium">${Number(inv.amount).toFixed(2)}</span></div>
                      <div><span className="text-gray-500">Due Date:</span> <span className="font-medium">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</span></div>
                      <div><span className="text-gray-500">PO:</span> <span className="font-medium">#{inv.purchaseOrder?.poNumber || inv.purchaseOrder?._id?.slice(-6) || '—'}</span></div>
                      <div><span className="text-gray-500">Match Status:</span> <span className={`badge ${matchStatusColors[inv.matchStatus] || 'badge-gray'}`}>{inv.matchStatus || 'Unmatched'}</span></div>
                    </div>

                    {inv.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{inv.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      {(inv.status === 'Pending' || inv.status === 'Under Review') && (
                        <button onClick={() => { setSelectedInvoice(inv); setShowMatchModal(true); }} className="btn-primary text-xs flex items-center gap-1"><Search size={14} /> Match to PO/GRN</button>
                      )}
                      {(inv.status === 'Matched' || inv.status === 'Under Review') && (
                        <button onClick={() => handleApprove(inv._id)} className="btn-success text-xs flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                      )}
                      {inv.status === 'Approved' && (
                        <button onClick={() => { setSelectedInvoice(inv); setShowPayModal(true); }} className="btn-primary text-xs flex items-center gap-1"><DollarSign size={14} /> Mark as Paid</button>
                      )}
                      {(inv.status === 'Pending' || inv.status === 'Under Review' || inv.status === 'Matched') && (
                        <button onClick={() => { setSelectedInvoice(inv); setShowDisputeModal(true); }} className="btn-secondary text-xs flex items-center gap-1"><XCircle size={14} /> Dispute</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Invoice" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" value={formData.amount} min="0" step="0.01" onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select className="input-field" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} required>
              <option value="">Select Vendor</option>
              {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order</label>
            <select className="input-field" value={formData.purchaseOrder} onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}>
              <option value="">Select PO (optional)</option>
              {pos.map((po) => <option key={po._id} value={po._id}>PO #{po.poNumber || po._id?.slice(-6)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" className="input-field" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Invoice</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-relisoft-500">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload invoice file</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Invoice</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMatchModal} onClose={() => { setShowMatchModal(false); setSelectedInvoice(null); }} title="Match Invoice" size="md">
        {selectedInvoice && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Match invoice <strong>#{selectedInvoice.invoiceNumber || selectedInvoice._id?.slice(-6)}</strong> (${Number(selectedInvoice.amount).toFixed(2)})</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order</label>
              <select className="input-field" value={matchData.purchaseOrder} onChange={(e) => setMatchData({ ...matchData, purchaseOrder: e.target.value })}>
                <option value="">Select PO</option>
                {pos.map((po) => <option key={po._id} value={po._id}>PO #{po.poNumber || po._id?.slice(-6)} — ${po.totalAmount || '—'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goods Receipt</label>
              <input type="text" className="input-field" value={matchData.goodsReceipt} onChange={(e) => setMatchData({ ...matchData, goodsReceipt: e.target.value })} placeholder="GRN ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={matchData.notes} onChange={(e) => setMatchData({ ...matchData, notes: e.target.value })} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Invoice amount: <strong>${Number(selectedInvoice.amount).toFixed(2)}</strong></p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowMatchModal(false); setSelectedInvoice(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handleMatch} className="btn-primary flex items-center gap-1"><Search size={16} /> Match</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showPayModal} onClose={() => { setShowPayModal(false); setSelectedInvoice(null); }} title="Pay Invoice" size="md">
        {selectedInvoice && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Pay invoice <strong>#{selectedInvoice.invoiceNumber || selectedInvoice._id?.slice(-6)}</strong> (${Number(selectedInvoice.amount).toFixed(2)})</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" className="input-field" value={payData.paymentDate} onChange={(e) => setPayData({ ...payData, paymentDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select className="input-field" value={payData.paymentMethod} onChange={(e) => setPayData({ ...payData, paymentMethod: e.target.value })}>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={payData.notes} onChange={(e) => setPayData({ ...payData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowPayModal(false); setSelectedInvoice(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handlePay} className="btn-success flex items-center gap-1"><DollarSign size={16} /> Pay ${Number(selectedInvoice.amount).toFixed(2)}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showDisputeModal} onClose={() => { setShowDisputeModal(false); setSelectedInvoice(null); setDisputeReason(''); }} title="Dispute Invoice" size="md">
        {selectedInvoice && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Dispute invoice <strong>#{selectedInvoice.invoiceNumber || selectedInvoice._id?.slice(-6)}</strong>?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
              <textarea className="input-field" rows={3} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Reason for dispute..." required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowDisputeModal(false); setSelectedInvoice(null); setDisputeReason(''); }} className="btn-secondary">Cancel</button>
              <button onClick={handleDispute} className="btn-danger flex items-center gap-1" disabled={!disputeReason.trim()}><XCircle size={16} /> Dispute</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceList;
