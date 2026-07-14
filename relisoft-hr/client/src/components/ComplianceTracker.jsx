import { useEffect, useState } from 'react'
import useStore from '../store'
import { getComplianceRequirements, createComplianceRequirement, updateComplianceRequirement, getComplianceRecords, createComplianceRecord, getComplianceDashboard } from '../api'
import { Shield, Plus, CheckCircle, AlertTriangle, Calendar, FileText, BarChart3 } from 'lucide-react'

export default function ComplianceTracker() {
  const { compliance, setCompliance, setMessage, currentUser } = useStore()
  const isAdmin = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('dashboard')
  const [reqForm, setReqForm] = useState({ title: '', description: '', dueDate: '', category: '' })
  const [showReqForm, setShowReqForm] = useState(false)

  useEffect(() => {
    Promise.all([getComplianceRequirements(), getComplianceRecords(), getComplianceDashboard()]).then(([r, rec, d]) =>
      setCompliance({ requirements: r.requirements || [], records: rec.records || [], dashboard: d, loading: false })
    )
  }, [])

  const refreshAll = async () => {
    const [r, rec, d] = await Promise.all([getComplianceRequirements(), getComplianceRecords(), getComplianceDashboard()])
    setCompliance({ requirements: r.requirements || [], records: rec.records || [], dashboard: d })
  }

  const handleCreateRequirement = async (e) => {
    e.preventDefault()
    try {
      const res = await createComplianceRequirement(reqForm)
      setMessage({ type: 'success', text: res.message || 'Requirement created.' })
      setReqForm({ title: '', description: '', dueDate: '', category: '' })
      setShowReqForm(false)
      const r = await getComplianceRequirements()
      setCompliance({ requirements: r.requirements || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleMarkComplete = async (id) => {
    try {
      await createComplianceRecord({ requirementId: id, employeeId: currentUser?.employeeId, status: 'Completed' })
      setMessage({ type: 'success', text: 'Record marked complete.' })
      refreshAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const dash = compliance.dashboard || {}

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'dashboard' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setTab('requirements')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'requirements' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Requirements</button>
            <button onClick={() => setTab('records')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'records' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Records</button>
          </div>
        </div>
      </div>

      {tab === 'dashboard' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Compliance Dashboard</h2>
          <p className="text-muted text-sm mb-4">Overview of compliance status.</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <div className="text-3xl font-bold text-navy dark:text-white">{dash.totalRequirements || 0}</div>
              <div className="text-xs text-muted mt-1 font-bold">Total</div>
            </div>
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-center">
              <div className="text-3xl font-bold text-emerald-700">{dash.completedRecords || 0}</div>
              <div className="text-xs text-emerald-600 mt-1 font-bold">Completed</div>
            </div>
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/30 text-center">
              <div className="text-3xl font-bold text-amber-700">{dash.pendingRecords || 0}</div>
              <div className="text-xs text-amber-600 mt-1 font-bold">Pending</div>
            </div>
            <div className="p-5 rounded-xl border border-red-200 bg-red-50/30 text-center">
              <div className="text-3xl font-bold text-red-700">{dash.overdueRecords || 0}</div>
              <div className="text-xs text-red-600 mt-1 font-bold">Overdue</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'requirements' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Compliance Requirements</h2>
              <p className="text-muted text-sm mt-1">Manage compliance requirements and due dates.</p>
            </div>
            {isAdmin && <button onClick={() => setShowReqForm(!showReqForm)} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />{showReqForm ? 'Cancel' : 'Create Requirement'}</button>}
          </div>
          {showReqForm && (
            <form onSubmit={handleCreateRequirement} className="grid md:grid-cols-4 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input value={reqForm.title} onChange={(e) => setReqForm((s) => ({ ...s, title: e.target.value }))} required placeholder="Title" className="input" />
              <input value={reqForm.category} onChange={(e) => setReqForm((s) => ({ ...s, category: e.target.value }))} required placeholder="Category" className="input" />
              <input type="date" value={reqForm.dueDate} onChange={(e) => setReqForm((s) => ({ ...s, dueDate: e.target.value }))} required className="input" />
              <button type="submit" className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />Create</button>
              <textarea value={reqForm.description} onChange={(e) => setReqForm((s) => ({ ...s, description: e.target.value }))} rows={2} placeholder="Description" className="input col-span-full" />
            </form>
          )}
          {compliance.requirements.length === 0 ? (
            <p className="text-muted text-sm">No requirements yet.</p>
          ) : (
            <div className="space-y-3">
              {compliance.requirements.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{r.title}</div>
                      <div className="text-xs text-muted mt-1">{r.category} · Due: {new Date(r.dueDate).toLocaleDateString()}</div>
                      {r.description && <div className="text-xs text-muted mt-1">{r.description}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${new Date(r.dueDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                      {new Date(r.dueDate) < new Date() ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'records' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Compliance Records</h2>
          <p className="text-muted text-sm mb-4">Track your compliance status for each requirement.</p>
          {compliance.records.length === 0 ? (
            <p className="text-muted text-sm">No records yet.</p>
          ) : (
            <div className="space-y-3">
              {compliance.records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{r.requirementTitle}</div>
                    <div className="text-xs text-muted mt-1">{r.employeeName} · {new Date(r.createdOn).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span>
                    {r.status !== 'Completed' && (
                      <button onClick={() => handleMarkComplete(r.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Mark Complete</button>
                    )}
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
