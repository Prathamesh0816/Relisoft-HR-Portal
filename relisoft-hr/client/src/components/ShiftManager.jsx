import { useEffect, useState } from 'react'
import useStore from '../store'
import { getShiftTemplates, createShiftTemplate, getShiftAssignments, createShiftAssignment, deleteShiftAssignment, getShiftSwaps, requestShiftSwap, respondToShiftSwap } from '../api'
import { Clock, Plus, CheckCircle, X, Users, Building, RefreshCw } from 'lucide-react'

export default function ShiftManager() {
  const { shifts, setShifts, setMessage, currentUser, data } = useStore()
  const isAdmin = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('assignments')
  const [templateForm, setTemplateForm] = useState({ name: '', startTime: '', endTime: '', isNightShift: false })
  const [swapForm, setSwapForm] = useState({ targetEmployeeId: '', swapDate: '', reason: '' })
  const [showSwapForm, setShowSwapForm] = useState(false)

  useEffect(() => {
    Promise.all([getShiftTemplates(), getShiftAssignments(currentUser?.employeeId), getShiftSwaps()]).then(([t, a, s]) =>
      setShifts({ templates: t.templates || [], assignments: a.assignments || [], swaps: s.swaps || [], loading: false })
    )
  }, [])

  const refreshAll = async () => {
    const [t, a, s] = await Promise.all([getShiftTemplates(), getShiftAssignments(currentUser?.employeeId), getShiftSwaps()])
    setShifts({ templates: t.templates || [], assignments: a.assignments || [], swaps: s.swaps || [] })
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    try {
      const res = await createShiftTemplate(templateForm)
      setMessage({ type: 'success', text: res.message || 'Template created.' })
      setTemplateForm({ name: '', startTime: '', endTime: '', isNightShift: false })
      const t = await getShiftTemplates()
      setShifts({ templates: t.templates || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleRequestSwap = async (e) => {
    e.preventDefault()
    try {
      const res = await requestShiftSwap({ ...swapForm, requesterId: currentUser?.employeeId })
      setMessage({ type: 'success', text: res.message || 'Swap requested.' })
      setSwapForm({ targetEmployeeId: '', swapDate: '', reason: '' })
      setShowSwapForm(false)
      const s = await getShiftSwaps()
      setShifts({ swaps: s.swaps || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleRespond = async (id, action) => {
    try { await respondToShiftSwap(id, action); setMessage({ type: 'success', text: `Swap ${action}d.` }); const s = await getShiftSwaps(); setShifts({ swaps: s.swaps || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const myAssignment = shifts.assignments?.[0]
  const myTemplate = myAssignment ? shifts.templates.find((t) => t.id === myAssignment.templateId) : null
  const incomingSwaps = shifts.swaps.filter((s) => String(s.targetEmployeeId) === String(currentUser?.employeeId) && s.status === 'Pending')
  const myOutgoingSwaps = shifts.swaps.filter((s) => String(s.requesterId) === String(currentUser?.employeeId))

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('assignments')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'assignments' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Assignments</button>
            <button onClick={() => setTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'templates' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Templates</button>
            <button onClick={() => setTab('swaps')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'swaps' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Swaps</button>
          </div>
        </div>
      </div>

      {tab === 'assignments' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Shift Assignment</h2>
          <p className="text-muted text-sm mb-4">View your current shift details.</p>
          {myAssignment ? (
            <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center"><Clock size={22} className="text-navy-dark" /></div>
                <div>
                  <div className="font-bold text-navy dark:text-white text-lg">{myTemplate?.name || 'Shift'}</div>
                  <div className="text-xs text-muted">Assigned to you</div>
                </div>
              </div>
              {myTemplate && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted">Start:</span> <span className="font-bold text-navy dark:text-white">{myTemplate.startTime?.slice(0, 5)}</span></div>
                  <div><span className="text-muted">End:</span> <span className="font-bold text-navy dark:text-white">{myTemplate.endTime?.slice(0, 5)}</span></div>
                  <div className="col-span-2"><span className="text-muted">Type:</span> <span className="font-bold text-navy dark:text-white">{myTemplate.isNightShift ? 'Night Shift' : 'Day Shift'}</span></div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-sm">No shift assignment yet.</p>
          )}
        </div>
      )}

      {tab === 'templates' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Shift Templates</h2>
            {isAdmin && <button onClick={() => setTab('templates')} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" /> New Template</button>}
          </div>
          {isAdmin && (
            <form onSubmit={handleCreateTemplate} className="grid md:grid-cols-4 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input value={templateForm.name} onChange={(e) => setTemplateForm((s) => ({ ...s, name: e.target.value }))} required placeholder="Template name" className="input" />
              <input type="time" value={templateForm.startTime} onChange={(e) => setTemplateForm((s) => ({ ...s, startTime: e.target.value }))} required className="input" />
              <input type="time" value={templateForm.endTime} onChange={(e) => setTemplateForm((s) => ({ ...s, endTime: e.target.value }))} required className="input" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy dark:text-white">
                  <input type="checkbox" checked={templateForm.isNightShift} onChange={(e) => setTemplateForm((s) => ({ ...s, isNightShift: e.target.checked }))} className="rounded" />
                  Night Shift
                </label>
                <button type="submit" className="btn-primary text-xs ml-auto"><Plus size={14} className="inline mr-1" />Create</button>
              </div>
            </form>
          )}
          {shifts.templates.length === 0 ? (
            <p className="text-muted text-sm">No templates yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {shifts.templates.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="font-bold text-navy dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-muted mt-2">{t.startTime?.slice(0, 5)} - {t.endTime?.slice(0, 5)}</div>
                  <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold ${t.isNightShift ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>{t.isNightShift ? 'Night' : 'Day'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'swaps' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Shift Swaps</h2>
              <p className="text-muted text-sm mt-1">Request or respond to shift swaps.</p>
            </div>
            <button onClick={() => setShowSwapForm(!showSwapForm)} className="btn-primary text-xs"><RefreshCw size={14} className="inline mr-1" />{showSwapForm ? 'Cancel' : 'Request Swap'}</button>
          </div>
          {showSwapForm && (
            <form onSubmit={handleRequestSwap} className="grid md:grid-cols-3 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <select value={swapForm.targetEmployeeId} onChange={(e) => setSwapForm((s) => ({ ...s, targetEmployeeId: e.target.value }))} required className="input">
                <option value="">Select employee...</option>
                {data.employees.filter((e) => String(e.id) !== String(currentUser?.employeeId)).map((e) => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
              <input type="date" value={swapForm.swapDate} onChange={(e) => setSwapForm((s) => ({ ...s, swapDate: e.target.value }))} required className="input" />
              <div className="flex gap-2">
                <input value={swapForm.reason} onChange={(e) => setSwapForm((s) => ({ ...s, reason: e.target.value }))} placeholder="Reason" className="input flex-1" />
                <button type="submit" className="btn-primary text-xs"><RefreshCw size={14} /> Request</button>
              </div>
            </form>
          )}
          <div className="space-y-4">
            {incomingSwaps.length > 0 && (
              <div>
                <h3 className="font-bold text-navy dark:text-white text-sm mb-2">Incoming Swap Requests</h3>
                {incomingSwaps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] mb-2">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{s.requesterName} wants to swap {new Date(s.swapDate).toLocaleDateString()}</div>
                      {s.reason && <div className="text-xs text-muted">Reason: {s.reason}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(s.id, 'approve')} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Accept</button>
                      <button onClick={() => handleRespond(s.id, 'reject')} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {myOutgoingSwaps.length > 0 && (
              <div>
                <h3 className="font-bold text-navy dark:text-white text-sm mb-2">My Swap Requests</h3>
                {myOutgoingSwaps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] mb-2">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{new Date(s.swapDate).toLocaleDateString()} → {s.targetEmployeeName}</div>
                      {s.reason && <div className="text-xs text-muted">Reason: {s.reason}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : s.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
            {incomingSwaps.length === 0 && myOutgoingSwaps.length === 0 && <p className="text-muted text-sm">No swap requests.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
