import { useEffect, useState } from 'react'
import useStore from '../store'
import { getResilienceFeedback, createResilienceFeedback } from '../api'
import { Shield, CheckCircle, XCircle, Edit3, ThumbsUp, MessageSquare } from 'lucide-react'

export default function GovernancePanel() {
  const { resilience, setResilience, setMessage } = useStore()
  const [form, setForm] = useState({ employeeName: '', action: '', decision: 'accept', reason: '' })
  const feedbacks = resilience.feedbacks || []

  useEffect(() => {
    getResilienceFeedback().then((d) => setResilience({ feedbacks: d.feedbacks || [] })).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await createResilienceFeedback(form)
      setMessage({ type: 'success', text: res.message || 'Feedback submitted.' })
      setForm({ employeeName: '', action: '', decision: 'accept', reason: '' })
      const d = await getResilienceFeedback()
      setResilience({ feedbacks: d.feedbacks || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface p-6">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Governance Panel</h2>
        <p className="text-muted text-sm mb-4">Submit feedback overrides and review past decisions.</p>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3 mb-6">
          <input value={form.employeeName} onChange={(e) => setForm((s) => ({ ...s, employeeName: e.target.value }))} required placeholder="Employee Name" className="input" />
          <input value={form.action} onChange={(e) => setForm((s) => ({ ...s, action: e.target.value }))} required placeholder="Action" className="input" />
          <select value={form.decision} onChange={(e) => setForm((s) => ({ ...s, decision: e.target.value }))} className="input">
            <option value="accept">Accept</option>
            <option value="veto">Veto</option>
            <option value="modify">Modify</option>
          </select>
          <button type="submit" className="btn-primary text-xs"><Shield size={14} className="inline mr-1" />Submit Feedback</button>
          <textarea value={form.reason} onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))} rows={2} required placeholder="Reason for decision" className="input col-span-full" />
        </form>
      </div>

      <div className="card-surface p-6">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Past Decisions</h2>
        <p className="text-muted text-sm mb-4">Review previous feedback and governance decisions.</p>
        {resilience.feedbacks.length === 0 ? (
          <p className="text-muted text-sm">No feedback records yet.</p>
        ) : (
          <div className="space-y-3">
            {resilience.feedbacks.map((fb, i) => (
              <div key={fb.id || i} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{fb.employeeName}</div>
                    <div className="text-xs text-muted mt-1">{fb.action} · {new Date(fb.createdOn || fb.createdAt).toLocaleDateString()}</div>
                    {fb.reason && <div className="text-xs text-muted mt-1">Reason: {fb.reason}</div>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${fb.decision === 'accept' ? 'bg-emerald-50 text-emerald-700' : fb.decision === 'veto' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {fb.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}