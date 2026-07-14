import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMyTimesheets, createTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry, getTimesheetPeriods, submitTimesheetPeriod, getTimesheetApprovals, approveTimesheet, rejectTimesheet } from '../api'
import { Clock, Plus, CheckCircle, X, Edit3, Trash2, Send, Calendar } from 'lucide-react'

export default function TimesheetTracker() {
  const { timesheets, setTimesheets, setMessage, currentUser } = useStore()
  const isManager = currentUser?.role === 'Manager' || currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('entries')
  const [filterDate, setFilterDate] = useState('')
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), hours: '', project: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [periodForm, setPeriodForm] = useState({ weekStart: '' })

  useEffect(() => {
    getMyTimesheets().then((r) => setTimesheets({ entries: r.entries || [], loading: false }))
    getTimesheetPeriods().then((r) => setTimesheets({ periods: r.periods || [] }))
    if (isManager) getTimesheetApprovals().then((r) => setTimesheets({ approvals: r.entries || [] }))
  }, [])

  const refreshEntries = async () => {
    const r = await getMyTimesheets(filterDate || undefined)
    setTimesheets({ entries: r.entries || [] })
  }

  const handleSubmitEntry = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      if (editingId) {
        await updateTimesheetEntry(editingId, { ...form, hours: Number(form.hours) })
        setMessage({ type: 'success', text: 'Entry updated.' })
      } else {
        await createTimesheetEntry({ ...form, hours: Number(form.hours) })
        setMessage({ type: 'success', text: 'Entry added.' })
      }
      setForm({ date: new Date().toISOString().slice(0, 10), hours: '', project: '', description: '' })
      setEditingId(null)
      await refreshEntries()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteTimesheetEntry(id); setMessage({ type: 'success', text: 'Entry deleted.' }); await refreshEntries() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleEdit = (entry) => {
    setForm({ date: entry.date?.slice(0, 10), hours: String(entry.hours), project: entry.project, description: entry.description || '' })
    setEditingId(entry.id)
  }

  const handleSubmitPeriod = async () => {
    if (!periodForm.weekStart) return
    try {
      const res = await submitTimesheetPeriod({ weekStart: periodForm.weekStart })
      setMessage({ type: 'success', text: res.message || 'Period submitted.' })
      setPeriodForm({ weekStart: '' })
      const p = await getTimesheetPeriods()
      setTimesheets({ periods: p.periods || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleApprove = async (id) => {
    try { await approveTimesheet(id); setMessage({ type: 'success', text: 'Approved.' }); const a = await getTimesheetApprovals(); setTimesheets({ approvals: a.entries || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const handleReject = async (id) => {
    try { await rejectTimesheet(id); setMessage({ type: 'success', text: 'Rejected.' }); const a = await getTimesheetApprovals(); setTimesheets({ approvals: a.entries || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const totalHours = timesheets.entries.reduce((s, e) => s + Number(e.hours), 0)

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('entries')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'entries' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Timesheet</button>
            <button onClick={() => setTab('submit')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'submit' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Submit Period</button>
            {isManager && <button onClick={() => setTab('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'approvals' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Approvals</button>}
          </div>
        </div>
      </div>

      {tab === 'entries' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">My Timesheet</h2>
              <p className="text-muted text-sm mt-1">Total: {totalHours}h</p>
            </div>
            <div className="flex gap-2 items-center">
              <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); getMyTimesheets(e.target.value || undefined).then((r) => setTimesheets({ entries: r.entries || [] })) }} className="input w-40" />
            </div>
          </div>

          <form onSubmit={handleSubmitEntry} className="grid grid-cols-5 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
            <input type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} required className="input" />
            <input type="number" min={0} max={24} step="0.5" value={form.hours} onChange={(e) => setForm((s) => ({ ...s, hours: e.target.value }))} required placeholder="Hours" className="input" />
            <input value={form.project} onChange={(e) => setForm((s) => ({ ...s, project: e.target.value }))} required placeholder="Project" className="input" />
            <input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="input" />
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{editingId ? <Edit3 size={14} className="inline mr-1" /> : <Plus size={14} className="inline mr-1" />}{submitting ? '...' : editingId ? 'Update' : 'Add'}</button>
          </form>

          {timesheets.entries.length === 0 ? (
            <p className="text-muted text-sm">No entries yet.</p>
          ) : (
            <div className="space-y-2">
              {timesheets.entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex-1">
                    <div className="font-bold text-navy dark:text-white text-sm">{new Date(e.date).toLocaleDateString()} · {e.project}</div>
                    <div className="text-xs text-muted mt-0.5">{e.hours}h {e.description && `· ${e.description}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : e.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{e.status || 'Draft'}</span>
                    {(!e.status || e.status === 'Draft') && (
                      <>
                        <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg bg-navy/5 text-navy/70 hover:bg-navy/10"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'submit' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Submit Timesheet Period</h2>
          <p className="text-muted text-sm mb-4">Select a week start date and submit all entries for that period.</p>
          <div className="flex gap-3 items-end max-w-md">
            <div className="flex-1">
              <label className="label">Week Start</label>
              <input type="date" value={periodForm.weekStart} onChange={(e) => setPeriodForm({ weekStart: e.target.value })} className="input w-full" />
            </div>
            <button onClick={handleSubmitPeriod} className="btn-primary"><Send size={16} /> Submit</button>
          </div>
          <div className="mt-4 text-sm text-muted">Total entries: {timesheets.entries.length} · Total hours: {totalHours}h</div>
          {timesheets.periods.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-bold text-navy dark:text-white text-sm">Submitted Periods</h3>
              {timesheets.periods.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div className="text-sm text-navy dark:text-white font-bold">Week of {new Date(p.weekStart).toLocaleDateString()}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'approvals' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Timesheet Approvals</h2>
          <p className="text-muted text-sm mb-4">Review team timesheet entries.</p>
          {timesheets.approvals.length === 0 ? (
            <p className="text-muted text-sm">No pending approvals.</p>
          ) : (
            <div className="space-y-3">
              {timesheets.approvals.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{e.employeeName} · {e.project}</div>
                    <div className="text-xs text-muted mt-1">{new Date(e.date).toLocaleDateString()} · {e.hours}h {e.description && `· ${e.description}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(e.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Approve</button>
                    <button onClick={() => handleReject(e.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Reject</button>
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
