import { useEffect, useState } from 'react'
import useStore from '../store'
import { getCandidates, getOnboardingChecklist, approveOnboarding, oneClickOnboard, completeStep, bulkOnboard } from '../api'

export default function HrOnboardingDashboard() {
  const { setMessage, data } = useStore()
  const [candidates, setCandidates] = useState([])
  const [checklist, setChecklist] = useState([])
  const [tab, setTab] = useState('pending')
  const [bulkForm, setBulkForm] = useState([{ fullName: '', email: '', department: '', joinDate: '' }])

  useEffect(() => {
    getCandidates().then(setCandidates).catch(() => {})
    getOnboardingChecklist().then(setChecklist).catch(() => {})
  }, [])

  const refresh = () => getCandidates().then(setCandidates)

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
