import { useEffect, useState } from 'react'
import useStore from '../store'
import { getOffboardings, oneClickOffboard, completeOffboarding, bulkOffboard } from '../api'

export default function OffboardingDashboard() {
  const { setMessage, data } = useStore()
  const [offboardings, setOffboardings] = useState([])
  const [tab, setTab] = useState('active')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [bulkIds, setBulkIds] = useState([])

  useEffect(() => { refresh() }, [])

  const refresh = () => getOffboardings().then(setOffboardings)

  const filtered = offboardings.filter((o) =>
    tab === 'active' ? o.status !== 'Completed' : o.status === 'Completed'
  )

  const handleOffboard = async (id) => {
    await oneClickOffboard(id, { resignationDate: new Date().toISOString() })
    refresh(); setMessage({ type: 'success', text: 'Offboarding initiated.' })
  }

  const handleComplete = async (id) => {
    await completeOffboarding(id); refresh(); setMessage({ type: 'success', text: 'Offboarding completed.' })
  }

  const handleBulkOffboard = async () => {
    const ids = bulkIds.filter(Boolean)
    if (!ids.length) return
    const requests = ids.map((id) => ({ employeeId: Number(id), resignationDate: new Date().toISOString() }))
    await bulkOffboard(requests); setBulkIds([]); refresh(); setMessage({ type: 'success', text: `${ids.length} employees offboarded.` })
  }

  const employeeOptions = data.employees.filter((e) => e.status === 'Active' || e.status === 'Onboarding')

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Offboarding dashboard</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Manage employee offboarding including asset handover, ID deactivation, and gate pass return.</p>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5 flex items-center gap-3 border-b border-navy/10">
          {['active', 'completed'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70'}`}>
              {t === 'active' ? 'Active offboardings' : 'Completed'}
            </button>
          ))}
        </div>
        <div className="p-5 space-y-3">
          {filtered.length === 0 && <p className="text-xs text-navy/50 dark:text-white/50 text-center py-8">No offboardings in this stage.</p>}
          {filtered.map((o) => (
            <div key={o.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-start justify-between gap-4">
              <div>
                <div className="font-heading font-bold text-navy dark:text-white">{o.employeeName} <span className="text-xs font-normal text-navy/50 dark:text-white/50 ml-2">{o.employeeCode}</span></div>
                <div className="text-xs text-navy/50 dark:text-white/50 mt-1">Status: {o.status}</div>
                <div className="text-xs text-navy/50 dark:text-white/50">Resignation: {new Date(o.resignationDate).toLocaleDateString()}</div>
                {o.remarks && <div className="text-xs text-navy/50 dark:text-white/50 mt-1">Remarks: {o.remarks}</div>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {o.assetsReturnedOn && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-bold">Assets returned</span>}
                  {o.idDeactivatedOn && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-bold">ID deactivated</span>}
                  {o.emailDeactivatedOn && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-bold">Email deactivated</span>}
                  {o.gatePassReturnedOn && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-bold">Gate pass returned</span>}
                </div>
              </div>
              {o.status === 'InProgress' && (
                <button onClick={() => handleComplete(o.id)} className="px-4 py-1.5 bg-navy dark:bg-navy-dark text-white font-bold text-xs rounded-xl">Complete</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-lg text-navy dark:text-white">Initiate offboarding</h2>
          <p className="text-muted dark:text-white/60 text-xs mt-1">Start offboarding for a single employee.</p>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3">
            <select value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} className="input max-w-xs">
              <option value="">Select employee...</option>
              {employeeOptions.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
              ))}
            </select>
            <button onClick={() => { if (employeeSearch) handleOffboard(Number(employeeSearch)); setEmployeeSearch('') }} className="px-5 py-2 bg-red-500 text-white font-bold text-xs rounded-xl">Start offboarding</button>
          </div>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-lg text-navy dark:text-white">Bulk offboard</h2>
          <p className="text-muted dark:text-white/60 text-xs mt-1">Select multiple employees for batch offboarding.</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="grid md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-navy/10 dark:border-white/10">
            {employeeOptions.map((e) => (
              <label key={e.id} className="flex items-center gap-2 text-xs text-navy/70 dark:text-white/70 cursor-pointer">
                <input type="checkbox" checked={bulkIds.includes(String(e.id))} onChange={() => setBulkIds((s) => s.includes(String(e.id)) ? s.filter((x) => x !== String(e.id)) : [...s, String(e.id)])} className="accent-gold-1" />
                {e.fullName}
              </label>
            ))}
          </div>
          <button onClick={handleBulkOffboard} className="px-5 py-2 bg-red-500 text-white font-bold text-xs rounded-xl">Bulk offboard selected ({bulkIds.length})</button>
        </div>
      </div>
    </div>
  )
}
