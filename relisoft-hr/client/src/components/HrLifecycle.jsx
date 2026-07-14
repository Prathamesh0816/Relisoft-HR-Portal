import { useEffect, useState } from 'react'
import useStore from '../store'
import {
  getProbations, startProbation, extendProbation, confirmProbation,
  getAppraisalCycles, createAppraisalCycle, closeAppraisalCycle,
  getAppraisals, initAppraisal, submitSelfAppraisal, submitManagerReview,
  convertInternToPermanent
} from '../api'

export default function HrLifecycle() {
  const { setMessage, data, currentUser } = useStore()
  const [tab, setTab] = useState('probation')
  const [probations, setProbations] = useState([])
  const [cycles, setCycles] = useState([])
  const [appraisals, setAppraisals] = useState([])
  const [activeCycleId, setActiveCycleId] = useState('')

  const [probForm, setProbForm] = useState({ employeeId: '', startDate: '', probationMonths: 6 })
  const [extForm, setExtForm] = useState({ employeeId: '', extraMonths: 3, reason: '' })
  const [cycleForm, setCycleForm] = useState({ name: '', startDate: '', endDate: '' })
  const [convertForm, setConvertForm] = useState({ employeeId: '', newRoleId: '', newDesignation: '', newEmploymentType: 'Full-time' })
  const [selfForm, setSelfForm] = useState({ appraisalId: '', selfRating: '', selfComments: '', goals: [] })

  useEffect(() => { refresh() }, [])

  const refresh = async () => {
    try { setProbations(await getProbations()) } catch {}
    try { setCycles(await getAppraisalCycles()) } catch {}
    try { setAppraisals(await getAppraisals()) } catch {}
  }

  const handleStartProbation = async () => {
    if (!probForm.employeeId || !probForm.startDate) return
    await startProbation(probForm); setMessage({ type: 'success', text: 'Probation started.' })
    setProbForm({ employeeId: '', startDate: '', probationMonths: 6 }); refresh()
  }

  const handleExtendProbation = async () => {
    if (!extForm.employeeId) return
    await extendProbation(extForm); setMessage({ type: 'success', text: 'Probation extended.' })
    setExtForm({ employeeId: '', extraMonths: 3, reason: '' }); refresh()
  }

  const handleConfirm = async (id) => {
    await confirmProbation({ employeeId: id }); setMessage({ type: 'success', text: 'Probation confirmed.' }); refresh()
  }

  const handleCreateCycle = async () => {
    if (!cycleForm.name) return
    await createAppraisalCycle(cycleForm); setMessage({ type: 'success', text: 'Cycle created.' })
    setCycleForm({ name: '', startDate: '', endDate: '' }); refresh()
  }

  const handleInitAppraisal = async (empId) => {
    if (!activeCycleId) return
    await initAppraisal(empId, Number(activeCycleId), currentUser?.employeeId)
    setMessage({ type: 'success', text: 'Appraisal initiated.' }); refresh()
  }

  const handleSelfSubmit = async () => {
    if (!selfForm.appraisalId) return
    await submitSelfAppraisal(Number(selfForm.appraisalId), {
      selfRating: Number(selfForm.selfRating), selfComments: selfForm.selfComments,
      goals: selfForm.goals.filter((g) => g.goal)
    })
    setMessage({ type: 'success', text: 'Self appraisal submitted.' })
    setSelfForm({ appraisalId: '', selfRating: '', selfComments: '', goals: [] }); refresh()
  }

  const handleManagerSubmit = async (id, action) => {
    await submitManagerReview(id, { managerRating: 3, managerComments: '', status: action })
    setMessage({ type: 'success', text: action === 'Completed' ? 'Appraisal completed.' : 'Marked under review.' })
    refresh()
  }

  const handleConvert = async () => {
    if (!convertForm.employeeId) return
    await convertInternToPermanent({ ...convertForm, newRoleId: Number(convertForm.newRoleId) })
    setMessage({ type: 'success', text: 'Intern converted to permanent.' })
    setConvertForm({ employeeId: '', newRoleId: '', newDesignation: '', newEmploymentType: 'Full-time' })
    refresh()
  }

  const activeEmployees = data.employees.filter((e) => e.status === 'Active' || e.status === 'Onboarding')
  const internEmployees = data.employees.filter((e) => e.employmentType === 'Intern' || e.employmentType === 'Probation')

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Probation & appraisal</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Manage probation cycles, performance appraisals, and intern-to-permanent conversions.</p>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5 flex items-center gap-3 border-b border-navy/10">
          {['probation', 'appraisal', 'convert'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70'}`}>
              {t === 'probation' ? 'Probation' : t === 'appraisal' ? 'Appraisal' : 'Intern convert'}
            </button>
          ))}
        </div>

        {tab === 'probation' && (
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <select value={probForm.employeeId} onChange={(e) => setProbForm((s) => ({ ...s, employeeId: e.target.value }))} className="input">
                <option value="">Select employee...</option>
                {activeEmployees.map((e) => (<option key={e.id} value={e.id}>{e.fullName}</option>))}
              </select>
              <input type="date" value={probForm.startDate} onChange={(e) => setProbForm((s) => ({ ...s, startDate: e.target.value }))} className="input" placeholder="Start date" />
              <input type="number" value={probForm.probationMonths} onChange={(e) => setProbForm((s) => ({ ...s, probationMonths: Number(e.target.value) }))} className="input" placeholder="Duration (months)" />
              <button onClick={handleStartProbation} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Start probation</button>
            </div>
            <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <select value={extForm.employeeId} onChange={(e) => setExtForm((s) => ({ ...s, employeeId: e.target.value }))} className="input">
                <option value="">Select employee...</option>
                {probations.filter((p) => p.status === 'Probation').map((p) => (<option key={p.id} value={p.employeeId}>{p.employeeName}</option>))}
              </select>
              <input type="number" value={extForm.extraMonths} onChange={(e) => setExtForm((s) => ({ ...s, extraMonths: Number(e.target.value) }))} className="input" placeholder="Extra months" />
              <input value={extForm.reason} onChange={(e) => setExtForm((s) => ({ ...s, reason: e.target.value }))} className="input" placeholder="Reason" />
              <button onClick={handleExtendProbation} className="px-4 py-2 border border-amber-300 text-amber-700 font-bold text-xs rounded-xl">Extend</button>
            </div>
            <div className="space-y-2">
              {probations.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-navy dark:text-white text-sm">{p.employeeName}</span>
                    <span className="text-xs text-navy/50 dark:text-white/50 ml-3">{p.status}</span>
                    <span className="text-xs text-navy/50 dark:text-white/50 ml-3">End: {new Date(p.currentEndDate || p.originalEndDate).toLocaleDateString()}</span>
                    {p.extensionCount > 0 && <span className="text-xs text-amber-600 ml-3">Extended {p.extensionCount}x</span>}
                  </div>
                  {(p.status === 'Probation' || p.status === 'Extended') && (
                    <button onClick={() => handleConfirm(p.employeeId)} className="px-4 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-xl">Confirm</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'appraisal' && (
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input placeholder="Cycle name" value={cycleForm.name} onChange={(e) => setCycleForm((s) => ({ ...s, name: e.target.value }))} className="input" />
              <input type="date" value={cycleForm.startDate} onChange={(e) => setCycleForm((s) => ({ ...s, startDate: e.target.value }))} className="input" />
              <input type="date" value={cycleForm.endDate} onChange={(e) => setCycleForm((s) => ({ ...s, endDate: e.target.value }))} className="input" />
              <button onClick={handleCreateCycle} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Create cycle</button>
            </div>
            <div className="flex items-center gap-3">
              <select value={activeCycleId} onChange={(e) => setActiveCycleId(e.target.value)} className="input max-w-xs">
                <option value="">Select active cycle...</option>
                {cycles.filter((c) => c.status === 'Active').map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <select onChange={(e) => handleInitAppraisal(Number(e.target.value))} className="input max-w-xs">
                <option value="">Initiate for employee...</option>
                {data.employees.map((e) => (<option key={e.id} value={e.id}>{e.fullName}</option>))}
              </select>
              {cycles.filter((c) => c.status === 'Active').map((c) => (
                <button key={c.id} onClick={() => closeAppraisalCycle(c.id).then(refresh)} className="px-4 py-2 border border-red-200 text-red-600 font-bold text-xs rounded-xl">Close cycle</button>
              ))}
            </div>
            <div className="space-y-2">
              {appraisals.filter((a) => !activeCycleId || a.cycleId === Number(activeCycleId)).map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-navy dark:text-white text-sm">{a.employeeName}</span>
                    <span className="text-xs text-navy/50 dark:text-white/50 ml-3">{a.cycleName}</span>
                    <span className={`ml-3 text-[10px] px-2 py-0.5 rounded font-bold ${
                      a.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
                      a.status === 'Submitted' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700' :
                      a.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700'
                    }`}>{a.status}</span>
                    {a.finalRating && <span className="ml-3 text-xs font-bold text-navy dark:text-white">Rating: {a.finalRating}/5</span>}
                  </div>
                  {a.status === 'Draft' && currentUser && String(currentUser.employeeId) === String(a.employeeId) && (
                    <button onClick={() => setSelfForm((s) => ({ ...s, appraisalId: String(a.id) }))} className="px-4 py-1.5 bg-navy dark:bg-navy-dark text-white font-bold text-xs rounded-xl">Self review</button>
                  )}
                  {a.status === 'Submitted' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleManagerSubmit(a.id, 'UnderReview')} className="px-3 py-1.5 border border-navy/10 dark:border-white/10 text-navy dark:text-white font-bold text-xs rounded-xl">Review</button>
                      <button onClick={() => handleManagerSubmit(a.id, 'Completed')} className="px-3 py-1.5 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Complete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selfForm.appraisalId && (
              <div className="p-4 rounded-xl border border-gold-1 bg-amber-50/30 space-y-3">
                <div className="font-heading font-bold text-navy dark:text-white">Self appraisal</div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 block mb-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" value={selfForm.selfRating} onChange={(e) => setSelfForm((s) => ({ ...s, selfRating: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 block mb-1">Comments</label>
                    <input value={selfForm.selfComments} onChange={(e) => setSelfForm((s) => ({ ...s, selfComments: e.target.value }))} className="input" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Goals</div>
                  {selfForm.goals.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input value={g.goal} onChange={(e) => { const c = [...selfForm.goals]; c[i].goal = e.target.value; setSelfForm((s) => ({ ...s, goals: c })) }} className="input flex-1" placeholder="Goal" />
                      <input type="date" value={g.targetDate || ''} onChange={(e) => { const c = [...selfForm.goals]; c[i].targetDate = e.target.value; setSelfForm((s) => ({ ...s, goals: c })) }} className="input w-40" />
                    </div>
                  ))}
                  <button onClick={() => setSelfForm((s) => ({ ...s, goals: [...s.goals, { goal: '', targetDate: '' }] }))} className="text-xs font-bold text-gold-2 mt-1">+ Add goal</button>
                </div>
                <button onClick={handleSelfSubmit} className="px-5 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Submit self appraisal</button>
              </div>
            )}
          </div>
        )}

        {tab === 'convert' && (
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-5 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <select value={convertForm.employeeId} onChange={(e) => setConvertForm((s) => ({ ...s, employeeId: e.target.value }))} className="input">
                <option value="">Select employee...</option>
                {internEmployees.map((e) => (<option key={e.id} value={e.id}>{e.fullName} ({e.employmentType})</option>))}
              </select>
              <select value={convertForm.newRoleId} onChange={(e) => setConvertForm((s) => ({ ...s, newRoleId: e.target.value }))} className="input">
                <option value="">New role...</option>
                {data.roles.map((r) => (<option key={r.id} value={r.id}>{r.label || r.name}</option>))}
              </select>
              <input value={convertForm.newDesignation} onChange={(e) => setConvertForm((s) => ({ ...s, newDesignation: e.target.value }))} className="input" placeholder="New designation" />
              <select value={convertForm.newEmploymentType} onChange={(e) => setConvertForm((s) => ({ ...s, newEmploymentType: e.target.value }))} className="input">
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
              </select>
              <button onClick={handleConvert} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Convert</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
