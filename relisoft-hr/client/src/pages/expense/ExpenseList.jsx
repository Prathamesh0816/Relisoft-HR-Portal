import { useState, useEffect } from 'react';
import { Plus, Download, IndianRupee, Calendar, Filter } from 'lucide-react';
import { expenseAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  reimbursed: { label: 'Reimbursed', color: 'bg-relisoft-100 text-relisoft-800' },
};

const categoryOptions = [
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
  { value: 'office', label: 'Office' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'communication', label: 'Communication' },
  { value: 'health', label: 'Health' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    category: '', amount: '', expenseDate: '', description: '', billNumber: '', project: '',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data: expensesData } = await expenseAPI.getAll(params);
      setExpenses(Array.isArray(expensesData) ? expensesData : expensesData.data || []);
      const { data: summaryData } = await expenseAPI.getSummary(params);
      setSummary(summaryData?.summary || null);
    } catch (err) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filterCategory, startDate, endDate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.create(formData);
      toast.success('Expense submitted');
      setShowModal(false);
      setFormData({ category: '', amount: '', expenseDate: '', description: '', billNumber: '', project: '' });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expense Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-relisoft-50 to-relisoft-100 border-relisoft-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-relisoft-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-relisoft-900">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-relisoft-200 text-relisoft-700"><IndianRupee size={24} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(summary.pendingAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-200 text-yellow-700"><Filter size={24} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.approvedAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-200 text-green-700"><Calendar size={24} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-relisoft-50 to-relisoft-100 border-relisoft-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-relisoft-600 font-medium">Reimbursed</p>
                <p className="text-2xl font-bold text-relisoft-900">{formatCurrency(summary.reimbursedAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-relisoft-200 text-relisoft-700"><Download size={24} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-40">
            <option value="">All Categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-40" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">To:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field w-40" />
        </div>
        {(filterCategory || startDate || endDate) && (
          <button onClick={() => { setFilterCategory(''); setStartDate(''); setEndDate(''); }} className="btn-secondary text-sm">
            Clear Filters
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No expenses found</td></tr>
              ) : (
                expenses.map((expense) => {
                  const cfg = statusConfig[expense.approvalStatus] || statusConfig.pending;
                  return (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {expense.employee?.firstName} {expense.employee?.lastName}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">#{expense.employee?.employeeId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm capitalize text-gray-700">{expense.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 truncate block max-w-xs">{expense.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${cfg.color}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">Select Category</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input type="number" className="input-field" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
              <input type="date" className="input-field" value={formData.expenseDate} onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
              <input type="text" className="input-field" placeholder="Optional" value={formData.billNumber} onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
            <input type="text" className="input-field" placeholder="Project name" value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bill</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Drag & drop or click to upload bill image</p>
              <input type="file" accept="image/*,.pdf" className="hidden" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseList;
