import { useEffect, useState } from 'react'
import useStore from '../store'
import { getCandidates, getOnboardingChecklist, approveOnboarding, oneClickOnboard, completeStep, bulkOnboard, getAssets, assignAssetsToCandidate, getEmployeeAssets } from '../api'

export default function HrOnboardingDashboard() {
  const { setMessage, data } = useStore()
  const [candidates, setCandidates] = useState([])
  const [checklist, setChecklist] = useState([])
  const [tab, setTab] = useState('pending')
  const [bulkForm, setBulkForm] = useState([{ fullName: '', email: '', department: '', joinDate: '' }])
  const [availableAssets, setAvailableAssets] = useState([])
  const [assetPickerFor, setAssetPickerFor] = useState(null)
  const [selectedAssets, setSelectedAssets] = useState({})
  const [candidateAssets, setCandidateAssets] = useState({})
  const [assetBusy, setAssetBusy] = useState(false)

  useEffect(() => {
    getCandidates().then(setCandidates).catch(() => {})
    getOnboardingChecklist().then(setChecklist).catch(() => {})
    getAssets().then((list) => setAvailableAssets(list.filter((a) => a.status === 'Available'))).catch(() => {})
  }, [])

  const refresh = () => getCandidates().then(setCandidates)

  const loadCandidateAssets = async (employeeId) => {
    try {
      const list = await getEmployeeAssets(employeeId)
      setCandidateAssets((prev) => ({ ...prev, [employeeId]: list }))
    } catch { /* ignore */ }
  }

  useEffect(() => {
    candidates.forEach((c) => loadCandidateAssets(c.employeeId))
  }, [candidates])

  const handleAssignAssets = async (employeeId) => {
    const ids = selectedAssets[employeeId] || []
    if (!ids.length) return
    setAssetBusy(true)
    try {
      const res = await assignAssetsToCandidate(employeeId, ids)
      setMessage({ type: 'success', text: res.message })
      setAssetPickerFor(null)
      setSelectedAssets({ ...selectedAssets, [employeeId]: [] })
      getAssets().then((list) => setAvailableAssets(list.filter((a) => a.status === 'Available'))).catch(() => {})
      loadCandidateAssets(employeeId)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign assets.' })
    } finally {
      setAssetBusy(false)
    }
  }

  const filtered = candidates.filter((c) =>
    tab === 'pending' ? c.status === 'Pending' :
    tab === 'active' ? c.status === 'InProgress' :
    c.status === 'Completed'
  )

  const handleApprove = async (id) => {
    await approveOnboarding(id); refresh(); setMessage({ type: 'success', text: 'Onboarding approved.' })
  }

  const handleOneClick = async (id) => {
    await oneClickOnboard(id); refresh(); setMessage({ type: 'success', text: 'One-click onboard complete.' })
  }

  const handleBulk = async () => {
    const valid = bulkForm.filter((f) => f.fullName && f.email)
    if (!valid.length) return
    const res = await bulkOnboard(valid)
    setMessage({ type: 'success', text: res.message })
    setBulkForm([{ fullName: '', email: '', department: '', joinDate: '' }])
    refresh()
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Onboarding dashboard</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Review candidate forms, approve onboarding, and complete setup steps.</p>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5 flex items-center gap-3 border-b border-navy/10">
          {['pending', 'active', 'completed'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70'}`}>
              {t === 'pending' ? 'Pending review' : t === 'active' ? 'In progress' : 'Completed'}
            </button>
          ))}
        </div>
        <div className="p-5 space-y-3">
          {filtered.length === 0 && <p className="text-xs text-navy/50 dark:text-white/50 text-center py-8">No candidates in this stage.</p>}
          {filtered.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-navy dark:text-white">{c.employeeName} <span className="text-xs font-normal text-navy/50 dark:text-white/50 ml-2">{c.employeeCode}</span></div>
                <div className="text-xs text-navy/50 dark:text-white/50 mt-1">Steps: {c.completedSteps}/{c.totalSteps}</div>
                {(candidateAssets[c.employeeId]?.filter((a) => a.status === 'Assigned')?.length || 0) > 0 && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    Assets: {candidateAssets[c.employeeId].filter((a) => a.status === 'Assigned').map((a) => a.assetName).join(', ')}
                  </div>
                )}
                {assetPickerFor === c.employeeId && (
                  <div className="mt-2 p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="text-xs font-bold text-navy dark:text-white mb-2">Assign assets</div>
                    {availableAssets.length === 0 ? (
                      <p className="text-xs text-navy/50 dark:text-white/50">No available assets. Create assets in Asset Management first.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {availableAssets.map((a) => (
                          <label key={a.id} className="flex items-center gap-1.5 text-xs text-navy/70 dark:text-white/70 cursor-pointer px-2 py-1 rounded-lg border border-navy/10 dark:border-white/10">
                            <input type="checkbox" checked={(selectedAssets[c.employeeId] || []).includes(a.id)} onChange={() => {
                              const cur = selectedAssets[c.employeeId] || []
                              setSelectedAssets({ ...selectedAssets, [c.employeeId]: cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id] })
                            }} className="accent-gold-1" />
                            {a.name} {a.assetTag && <span className="text-navy/40 dark:text-white/40">({a.assetTag})</span>}
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => handleAssignAssets(c.employeeId)} disabled={assetBusy || !(selectedAssets[c.employeeId] || []).length} className="px-3 py-1.5 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl disabled:opacity-40">
                        Assign selected
                      </button>
                      <button onClick={() => { setAssetPickerFor(null); setSelectedAssets({ ...selectedAssets, [c.employeeId]: [] }) }} className="px-3 py-1.5 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs rounded-xl">Cancel</button>
                    </div>
                  </div>
                )}
                {c.steps.length > 0 && c.status === 'InProgress' && (
                  <div className="mt-2 space-y-1">
                    {c.steps.filter((s) => s.status === 'Pending').slice(0, 3).map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-100">
                        <span className="text-navy/70 dark:text-white/70">{s.itemName}</span>
                        <button onClick={async () => { await completeStep(s.id, null); refresh() }} className="text-gold-2 font-bold hover:underline">Mark done</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.status === 'Pending' && <button onClick={() => handleApprove(c.employeeId)} className="px-4 py-1.5 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Approve</button>}
                <button onClick={() => { setAssetPickerFor(assetPickerFor === c.employeeId ? null : c.employeeId) }} className="px-4 py-1.5 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs rounded-xl">Assign assets</button>
                <button onClick={() => handleOneClick(c.employeeId)} className="px-4 py-1.5 bg-navy dark:bg-navy-dark text-white font-bold text-xs rounded-xl">1-click onboard</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-lg text-navy dark:text-white">Bulk onboard</h2>
          <p className="text-muted dark:text-white/60 text-xs mt-1">Enter multiple candidates at once for batch onboarding.</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {bulkForm.map((f, i) => (
            <div key={i} className="grid md:grid-cols-4 gap-3">
              <input placeholder="Full name" value={f.fullName} onChange={(e) => { const c = [...bulkForm]; c[i].fullName = e.target.value; setBulkForm(c) }} className="input" />
              <input placeholder="Email" value={f.email} onChange={(e) => { const c = [...bulkForm]; c[i].email = e.target.value; setBulkForm(c) }} className="input" />
              <input placeholder="Department" value={f.department} onChange={(e) => { const c = [...bulkForm]; c[i].department = e.target.value; setBulkForm(c) }} className="input" />
              <input type="date" value={f.joinDate} onChange={(e) => { const c = [...bulkForm]; c[i].joinDate = e.target.value; setBulkForm(c) }} className="input" />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button onClick={() => setBulkForm([...bulkForm, { fullName: '', email: '', department: '', joinDate: '' }])} className="px-4 py-2 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs rounded-xl">+ Add row</button>
            <button onClick={handleBulk} className="px-5 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Bulk onboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}
