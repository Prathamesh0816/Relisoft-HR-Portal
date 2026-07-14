import { useEffect, useState } from 'react'
import useStore from '../store'
import { getExpenseCategories, getMyExpenseClaims, createExpenseClaim, getPendingExpenseClaims, approveExpenseClaim, rejectExpenseClaim, reimburseExpenseClaim } from '../api'
import { DollarSign, Plus, CheckCircle, X, Clock, Search, Filter } from 'lucide-react'

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700'
  if (s === 'reimbursed') return 'bg-blue-50 text-blue-700'
  if (s === 'rejected') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

export default function ExpenseManagement() {
  const { expenses, setExpenses, setMessage, currentUser } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState(isHr ? 'approvals' : 'claims')
  const [form, setForm] = useState({ categoryId: '', title: '', description: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10) })
  const [submitting, setSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState({})

  useEffect(() => {
    Promise.all([getExpenseCategories(), getMyExpenseClaims()]).then(([cats, cl]) =>
      setExpenses({ categories: cats, claims: cl.claims || [], loading: false })
    )
    if (isHr) getPendingExpenseClaims().then((r) => setExpenses({ pendingClaims: r.claims || [] }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await createExpenseClaim({ ...form, amount: Number(form.amount), employeeId: currentUser?.employeeId })
      setMessage({ type: 'success', text: res.message || 'Claim submitted.' })
      setForm({ categoryId: '', title: '', description: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10) })
      const cl = await getMyExpenseClaims()
      setExpenses({ claims: cl.claims || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit claim.' })
    } finally { setSubmitting(false) }
  }

  const handleApprove = async (id) => {
    try { await approveExpenseClaim(id); setMessage({ type: 'success', text: 'Claim approved.' }); refreshPending() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleReject = async (id) => {
    const reason = rejectReason[id] || 'No reason provided'
    try { await rejectExpenseClaim(id, reason); setMessage({ type: 'success', text: 'Claim rejected.' }); refreshPending() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleReimburse = async (id) => {
    try { await reimburseExpenseClaim(id); setMessage({ type: 'success', text: 'Claim reimbursed.' }); refreshPending() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const refreshPending = async () => {
    const [cl, pd] = await Promise.all([getMyExpenseClaims(), getPendingExpenseClaims()])
    setExpenses({ claims: cl.claims || [], pendingClaims: pd.claims || [] })
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('claims')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'claims' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Claims</button>
            <button onClick={() => setTab('submit')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'submit' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Submit Claim</button>
            {isHr && <button onClick={() => setTab('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'approvals' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Approvals</button>}
          </div>
        </div>
      </div>

      {tab === 'claims' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Claims</h2>
          <p className="text-muted text-sm mb-4">Track your expense claims and reimbursements.</p>
          {expenses.claims.length === 0 ? (
            <p className="text-muted text-sm">No claims submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {expenses.claims.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-navy dark:text-white text-sm">{c.title}</div>
                    <div className="text-xs text-muted mt-1">{c.categoryName} · {new Date(c.expenseDate).toLocaleDateString()} · ${Number(c.amount).toFixed(2)}</div>
                    {c.description && <div className="text-xs text-muted mt-1">{c.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(c.status)}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'submit' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Submit Expense Claim</h2>
          <p className="text-muted text-sm mb-4">Provide details for reimbursement.</p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))} required className="input w-full">
                <option value="">Select category...</option>
                {expenses.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required placeholder="e.g. Client lunch" className="input w-full" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} rows={3} placeholder="Optional details..." className="input w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount ($)</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} required placeholder="0.00" className="input w-full" />
              </div>
              <div>
                <label className="label">Expense Date</label>
                <input type="date" value={form.expenseDate} onChange={(e) => setForm((s) => ({ ...s, expenseDate: e.target.value }))} required className="input w-full" />
              </div>
            </div>
            {submitting && <div className="text-xs text-muted">Submitting...</div>}
            <button type="submit" disabled={submitting} className="btn-primary"><DollarSign size={16} /> {submitting ? 'Submitting...' : 'Submit Claim'}</button>
          </form>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Pending Approvals</h2>
          <p className="text-muted text-sm mb-4">Review and process expense claims.</p>
          {expenses.pendingClaims.length === 0 ? (
            <p className="text-muted text-sm">No pending claims.</p>
          ) : (
            <div className="space-y-3">
              {expenses.pendingClaims.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{c.title}</div>
                      <div className="text-xs text-muted mt-1">{c.employeeName} · {c.categoryName} · ${Number(c.amount).toFixed(2)} · {new Date(c.expenseDate).toLocaleDateString()}</div>
                      {c.description && <div className="text-xs text-muted mt-1">{c.description}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(c.id)} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Approve</button>
                    <button onClick={() => handleReimburse(c.id)} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100"><DollarSign size={14} className="inline mr-1" />Reimburse</button>
                    <div className="flex gap-1 items-center">
                      <input value={rejectReason[c.id] || ''} onChange={(e) => setRejectReason((s) => ({ ...s, [c.id]: e.target.value }))} placeholder="Reject reason..." className="input text-xs w-40" />
                      <button onClick={() => handleReject(c.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
