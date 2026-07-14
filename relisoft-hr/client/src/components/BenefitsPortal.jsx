import { useEffect, useState } from 'react'
import useStore from '../store'
import { getBenefitPlans, createBenefitPlan, updateBenefitPlan, getMyBenefitEnrollments, enrollInBenefitPlan, cancelBenefitEnrollment, getAllBenefitEnrollments } from '../api'
import { Shield, Plus, CheckCircle, X, Edit3, Users, Briefcase } from 'lucide-react'

export default function BenefitsPortal() {
  const { benefits, setBenefits, setMessage, currentUser } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('plans')
  const [planForm, setPlanForm] = useState({ name: '', category: '', employeeCost: '', employerCost: '', description: '' })
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState(null)

  useEffect(() => {
    Promise.all([getBenefitPlans(), getMyBenefitEnrollments()]).then(([p, e]) =>
      setBenefits({ plans: p.plans || [], myEnrollments: e.enrollments || [], loading: false })
    )
    if (isHr) getAllBenefitEnrollments().then((r) => setBenefits({ allEnrollments: r.enrollments || [] }))
  }, [])

  const refreshAll = async () => {
    const [p, e] = await Promise.all([getBenefitPlans(), getMyBenefitEnrollments()])
    setBenefits({ plans: p.plans || [], myEnrollments: e.enrollments || [] })
    if (isHr) { const a = await getAllBenefitEnrollments(); setBenefits({ allEnrollments: a.enrollments || [] }) }
  }

  const handleSavePlan = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...planForm, employeeCost: Number(planForm.employeeCost), employerCost: Number(planForm.employerCost) }
      if (editingPlanId) {
        await updateBenefitPlan(editingPlanId, payload)
        setMessage({ type: 'success', text: 'Plan updated.' })
      } else {
        await createBenefitPlan(payload)
        setMessage({ type: 'success', text: 'Plan created.' })
      }
      setPlanForm({ name: '', category: '', employeeCost: '', employerCost: '', description: '' })
      setEditingPlanId(null)
      setShowPlanForm(false)
      const p = await getBenefitPlans()
      setBenefits({ plans: p.plans || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleEnroll = async (planId) => {
    try { await enrollInBenefitPlan(planId); setMessage({ type: 'success', text: 'Enrolled!' }); refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleCancel = async (id) => {
    try { await cancelBenefitEnrollment(id); setMessage({ type: 'success', text: 'Enrollment cancelled.' }); refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const editPlan = (plan) => {
    setPlanForm({ name: plan.name, category: plan.category, employeeCost: String(plan.employeeCost), employerCost: String(plan.employerCost), description: plan.description || '' })
    setEditingPlanId(plan.id)
    setShowPlanForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('plans')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'plans' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Plans</button>
            <button onClick={() => setTab('enrollments')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'enrollments' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Enrollments</button>
            {isHr && <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'all' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>All Enrollments</button>}
          </div>
        </div>
      </div>

      {tab === 'plans' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Benefit Plans</h2>
              <p className="text-muted text-sm mt-1">Browse available benefit plans and enroll.</p>
            </div>
            {isHr && <button onClick={() => { setShowPlanForm(!showPlanForm); if (!showPlanForm) { setPlanForm({ name: '', category: '', employeeCost: '', employerCost: '', description: '' }); setEditingPlanId(null) } }} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />{showPlanForm ? 'Cancel' : 'Create Plan'}</button>}
          </div>
          {showPlanForm && (
            <form onSubmit={handleSavePlan} className="grid md:grid-cols-5 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input value={planForm.name} onChange={(e) => setPlanForm((s) => ({ ...s, name: e.target.value }))} required placeholder="Plan name" className="input" />
              <input value={planForm.category} onChange={(e) => setPlanForm((s) => ({ ...s, category: e.target.value }))} required placeholder="Category" className="input" />
              <input type="number" min={0} value={planForm.employeeCost} onChange={(e) => setPlanForm((s) => ({ ...s, employeeCost: e.target.value }))} required placeholder="Employee cost" className="input" />
              <input type="number" min={0} value={planForm.employerCost} onChange={(e) => setPlanForm((s) => ({ ...s, employerCost: e.target.value }))} required placeholder="Employer cost" className="input" />
              <button type="submit" className="btn-primary text-xs">{editingPlanId ? <Edit3 size={14} className="inline mr-1" /> : <Plus size={14} className="inline mr-1" />}{editingPlanId ? 'Update' : 'Create'}</button>
              <input value={planForm.description} onChange={(e) => setPlanForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="input col-span-full" />
            </form>
          )}
          {benefits.plans.length === 0 ? (
            <p className="text-muted text-sm">No plans available.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.plans.map((p) => (
                <div key={p.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center mb-3">
                    <Shield size={22} className="text-navy-dark" />
                  </div>
                  <h3 className="font-bold text-navy dark:text-white text-sm">{p.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold inline-block mt-1 w-fit">{p.category}</span>
                  <div className="text-xs text-muted mt-2">
                    <div>Employee: ${Number(p.employeeCost).toFixed(2)}/mo</div>
                    <div>Employer: ${Number(p.employerCost).toFixed(2)}/mo</div>
                  </div>
                  {p.description && <div className="text-xs text-muted mt-2">{p.description}</div>}
                  <div className="flex gap-2 mt-auto pt-3">
                    <button onClick={() => handleEnroll(p.id)} className="flex-1 btn-primary text-xs py-2">Enroll</button>
                    {isHr && <button onClick={() => editPlan(p)} className="px-3 py-2 rounded-xl border border-navy/10 text-muted font-bold text-xs hover:bg-navy/5"><Edit3 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'enrollments' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Enrollments</h2>
          <p className="text-muted text-sm mb-4">View your benefit plan enrollments.</p>
          {benefits.myEnrollments.length === 0 ? (
            <p className="text-muted text-sm">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {benefits.myEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{e.planName}</div>
                    <div className="text-xs text-muted mt-1">Enrolled: {new Date(e.createdOn).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{e.status}</span>
                    {e.status === 'Active' && <button onClick={() => handleCancel(e.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Cancel</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">All Enrollments</h2>
          <p className="text-muted text-sm mb-4">Full list of benefit enrollments.</p>
          {benefits.allEnrollments.length === 0 ? (
            <p className="text-muted text-sm">No enrollments found.</p>
          ) : (
            <div className="space-y-3">
              {benefits.allEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{e.employeeName} · {e.planName}</div>
                    <div className="text-xs text-muted mt-1">Enrolled: {new Date(e.createdOn).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{e.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
