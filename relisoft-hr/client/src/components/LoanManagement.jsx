import { useEffect, useState } from 'react'
import useStore from '../store'
import { getLoanTypes, getMyLoans, applyForLoan, getPendingLoans, approveLoan, rejectLoan } from '../api'
import { DollarSign, Plus, CheckCircle, X, Clock, Banknote, Percent } from 'lucide-react'

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700'
  if (s === 'rejected') return 'bg-red-50 text-red-600'
  if (s === 'disbursed') return 'bg-blue-50 text-blue-700'
  return 'bg-amber-50 text-amber-700'
}

export default function LoanManagement() {
  const { loans, setLoans, setMessage, currentUser } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState(isHr ? 'approvals' : 'my')
  const [form, setForm] = useState({ loanTypeId: '', amount: '', purpose: '' })
  const [submitting, setSubmitting] = useState(false)
  const [calculatedEmi, setCalculatedEmi] = useState(null)

  useEffect(() => {
    Promise.all([getLoanTypes(), getMyLoans()]).then(([t, m]) =>
      setLoans({ types: t.types || [], myLoans: m.loans || [], loading: false })
    )
    if (isHr) getPendingLoans().then((r) => setLoans({ pendingLoans: r.loans || [] }))
  }, [])

  useEffect(() => {
    if (form.loanTypeId && form.amount && Number(form.amount) > 0) {
      const lt = loans.types.find((t) => String(t.id) === String(form.loanTypeId))
      if (lt && lt.interestRate) {
        const principal = Number(form.amount)
        const rate = Number(lt.interestRate) / 100 / 12
        const tenure = lt.maxTenureMonths || 12
        const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1)
        setCalculatedEmi({ emi: Math.round(emi * 100) / 100, tenure, rate: lt.interestRate })
      } else setCalculatedEmi(null)
    } else setCalculatedEmi(null)
  }, [form.loanTypeId, form.amount, loans.types])

  const handleApply = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await applyForLoan({ ...form, amount: Number(form.amount), employeeId: currentUser?.employeeId })
      setMessage({ type: 'success', text: res.message || 'Loan application submitted.' })
      setForm({ loanTypeId: '', amount: '', purpose: '' })
      setCalculatedEmi(null)
      const m = await getMyLoans()
      setLoans({ myLoans: m.loans || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    } finally { setSubmitting(false) }
  }

  const handleApprove = async (id) => {
    try { await approveLoan(id); setMessage({ type: 'success', text: 'Loan approved.' }); refreshPending() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleReject = async (id) => {
    try { await rejectLoan(id); setMessage({ type: 'success', text: 'Loan rejected.' }); refreshPending() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const refreshPending = async () => {
    const [m, p] = await Promise.all([getMyLoans(), getPendingLoans()])
    setLoans({ myLoans: m.loans || [], pendingLoans: p.loans || [] })
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'my' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Loans</button>
            <button onClick={() => setTab('apply')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'apply' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Apply</button>
            {isHr && <button onClick={() => setTab('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'approvals' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Approvals</button>}
          </div>
        </div>
      </div>

      {tab === 'my' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Loans</h2>
          <p className="text-muted text-sm mb-4">View your loan applications and status.</p>
          {loans.myLoans.length === 0 ? (
            <p className="text-muted text-sm">No loans yet.</p>
          ) : (
            <div className="space-y-3">
              {loans.myLoans.map((l) => (
                <div key={l.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{l.loanTypeName}</div>
                      <div className="text-xs text-muted mt-1">Amount: ${Number(l.amount).toFixed(2)} · {l.purpose}</div>
                      {l.balance > 0 && <div className="text-xs text-muted">Balance: ${Number(l.balance).toFixed(2)} · EMI: ${Number(l.emiAmount || 0).toFixed(2)}</div>}
                      <div className="text-xs text-muted">{new Date(l.createdOn).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(l.status)}`}>{l.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'apply' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Apply for Loan</h2>
          <p className="text-muted text-sm mb-4">Select a loan type and submit your application.</p>
          <form onSubmit={handleApply} className="space-y-4 max-w-2xl">
            <div>
              <label className="label">Loan Type</label>
              <select value={form.loanTypeId} onChange={(e) => setForm((s) => ({ ...s, loanTypeId: e.target.value }))} required className="input w-full">
                <option value="">Select type...</option>
                {loans.types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.interestRate}% · {t.maxTenureMonths} months)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount ($)</label>
              <input type="number" min={1} value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} required placeholder="0.00" className="input w-full" />
            </div>
            <div>
              <label className="label">Purpose</label>
              <textarea value={form.purpose} onChange={(e) => setForm((s) => ({ ...s, purpose: e.target.value }))} required rows={3} placeholder="Why do you need this loan?" className="input w-full" />
            </div>
            {calculatedEmi && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="text-sm font-bold text-navy dark:text-white">Estimated EMI</div>
                <div className="text-2xl font-bold text-emerald-700">${calculatedEmi.emi.toFixed(2)} / month</div>
                <div className="text-xs text-muted mt-1">{calculatedEmi.tenure} months at {calculatedEmi.rate}% interest</div>
              </div>
            )}
            {submitting && <div className="text-xs text-muted">Submitting...</div>}
            <button type="submit" disabled={submitting} className="btn-primary"><Plus size={16} /> {submitting ? 'Submitting...' : 'Apply for Loan'}</button>
          </form>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Loan Approvals</h2>
          <p className="text-muted text-sm mb-4">Review pending loan applications.</p>
          {loans.pendingLoans.length === 0 ? (
            <p className="text-muted text-sm">No pending loans.</p>
          ) : (
            <div className="space-y-3">
              {loans.pendingLoans.map((l) => (
                <div key={l.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{l.employeeName} · {l.loanTypeName}</div>
                      <div className="text-xs text-muted mt-1">${Number(l.amount).toFixed(2)} · {l.purpose}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(l.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Approve</button>
                      <button onClick={() => handleReject(l.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Reject</button>
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
