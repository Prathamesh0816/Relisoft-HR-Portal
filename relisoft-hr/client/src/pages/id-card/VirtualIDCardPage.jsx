import { useState, useEffect } from 'react';
import { Plus, Search, ShieldAlert, CheckCircle, XCircle, CreditCard, Users, Loader2 } from 'lucide-react';
import { virtualIdCardAPI, employeeAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const VirtualIDCardPage = () => {
  const [cards, setCards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [myCard, setMyCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('my');
  const [search, setSearch] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({ employee: '', expiryDate: '' });

  const fetchMyCard = async () => {
    try {
      const { data } = await virtualIdCardAPI.getMy();
      const card = data.data || data;
      setMyCard(card || null);
    } catch {
      setMyCard(null);
    }
  };

  const fetchAllCards = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await virtualIdCardAPI.getAll(params);
      setCards(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch ID cards');
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

  useEffect(() => {
    setLoading(true);
    if (view === 'my') {
      Promise.all([fetchMyCard(), fetchEmployees()]).finally(() => setLoading(false));
    } else {
      Promise.all([fetchAllCards(), fetchEmployees()]).finally(() => setLoading(false));
    }
  }, [view]);

  useEffect(() => {
    if (view === 'all') fetchAllCards();
  }, [search]);

  const handleIssueCard = async (e) => {
    e.preventDefault();
    try {
      await virtualIdCardAPI.create(formData);
      toast.success('ID card issued');
      setShowIssueModal(false);
      setFormData({ employee: '', expiryDate: '' });
      if (view === 'all') fetchAllCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue card');
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedCard || !confirmAction) return;
    try {
      if (confirmAction === 'suspend') {
        await virtualIdCardAPI.suspend(selectedCard._id);
        toast.success('Card suspended');
      } else if (confirmAction === 'activate') {
        await virtualIdCardAPI.activate(selectedCard._id);
        toast.success('Card activated');
      } else if (confirmAction === 'delete') {
        await virtualIdCardAPI.delete(selectedCard._id);
        toast.success('Card deleted');
      }
      setShowConfirmModal(false);
      setSelectedCard(null);
      setConfirmAction(null);
      if (view === 'my') fetchMyCard(); else fetchAllCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openConfirm = (card, action) => {
    setSelectedCard(card);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const EmployeeIDCard = ({ card, showActions }) => {
    const emp = card?.employee || {};
    return (
      <div className="bg-gradient-to-br from-relisoft-700 via-relisoft-600 to-relisoft-800 rounded-xl p-6 text-white shadow-lg max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide">ReliSoft HR</h2>
            <p className="text-xs text-relisoft-200">Employee ID Card</p>
          </div>
          <CreditCard size={28} className="text-relisoft-200" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {card?.photoUrl ? (
              <img src={card.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white/80">
                {(emp?.name || card?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate">{emp?.name || card?.name || card?.fullName || '—'}</h3>
            <p className="text-sm text-relisoft-200">{emp?.designation || card?.designation || '—'}</p>
            <p className="text-xs text-relisoft-200">{emp?.department || card?.department || '—'}</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-relisoft-200">Employee ID</span>
            <span className="font-medium">{emp?.employeeId || card?.employeeId || card?.cardNumber || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-relisoft-200">Blood Group</span>
            <span className="font-medium">{card?.bloodGroup || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-relisoft-200">Emergency Contact</span>
            <span className="font-medium">{card?.emergencyContact || '—'}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="bg-white rounded-lg p-1.5 w-16 h-10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-7 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] text-gray-500 font-mono">QR</span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs" style={{ color: 'color-mix(in srgb, var(--moss) 50%, white)' }}>
            <div>Card #: {card?.cardNumber || '—'}</div>
            <div>Exp: {card?.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <div className={`mt-3 text-center text-xs font-medium ${card?.status === 'Active' ? 'text-green-300' : card?.status === 'Suspended' ? 'text-red-300' : 'text-yellow-300'}`}>
          {card?.status || 'Active'}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/20">
            {card?.status === 'Suspended' && (
              <button onClick={() => openConfirm(card, 'activate')} className="flex-1 bg-green-500/80 hover:bg-green-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1"><CheckCircle size={14} /> Activate</button>
            )}
            {card?.status === 'Active' && (
              <button onClick={() => openConfirm(card, 'suspend')} className="flex-1 bg-yellow-500/80 hover:bg-yellow-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1"><ShieldAlert size={14} /> Suspend</button>
            )}
            <button onClick={() => openConfirm(card, 'delete')} className="flex-1 bg-red-500/80 hover:bg-red-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1"><XCircle size={14} /> Delete</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Virtual ID Cards</h1>
        {view === 'all' && (
          <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Issue New Card
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setView('my')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'my' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>My ID Card</button>
        <button onClick={() => setView('all')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'all' ? 'bg-relisoft-100 text-relisoft-700' : 'text-gray-600 hover:bg-gray-100'}`}>All ID Cards</button>
      </div>

      {view === 'all' && (
        <div className="card flex items-center gap-3 mb-4">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by name, employee ID, department..." className="input-field flex-1" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
        </div>
      ) : view === 'my' ? (
        myCard ? (
          <div className="flex justify-center py-4">
            <EmployeeIDCard card={myCard} showActions={false} />
          </div>
        ) : (
          <div className="card text-center text-gray-500 py-8">No ID card found for you. Contact admin to issue one.</div>
        )
      ) : cards.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">
          <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No ID cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <EmployeeIDCard key={card._id} card={card} showActions={true} />
          ))}
        </div>
      )}

      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue New ID Card" size="md">
        <form onSubmit={handleIssueCard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee <span className="text-red-500">*</span></label>
            <select className="input-field" value={formData.employee} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId}) — {emp.department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input type="date" className="input-field" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Issue Card</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showConfirmModal} onClose={() => { setShowConfirmModal(false); setSelectedCard(null); setConfirmAction(null); }} title={confirmAction === 'suspend' ? 'Suspend Card' : confirmAction === 'activate' ? 'Activate Card' : 'Delete Card'} size="sm">
        {selectedCard && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {confirmAction === 'suspend' && 'Are you sure you want to suspend this ID card?'}
              {confirmAction === 'activate' && 'Are you sure you want to activate this ID card?'}
              {confirmAction === 'delete' && 'Are you sure you want to permanently delete this ID card? This cannot be undone.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p><span className="text-gray-500">Employee:</span> <span className="font-medium">{selectedCard.employee?.name || selectedCard.name}</span></p>
              <p><span className="text-gray-500">Card #:</span> <span className="font-medium">{selectedCard.cardNumber}</span></p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowConfirmModal(false); setSelectedCard(null); setConfirmAction(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handleConfirmAction} className={`flex items-center gap-1 ${confirmAction === 'delete' ? 'btn-danger' : confirmAction === 'suspend' ? 'btn-secondary' : 'btn-success'}`}>
                {confirmAction === 'suspend' && <><ShieldAlert size={16} /> Suspend</>}
                {confirmAction === 'activate' && <><CheckCircle size={16} /> Activate</>}
                {confirmAction === 'delete' && <><XCircle size={16} /> Delete</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VirtualIDCardPage;
