import { useEffect, useState } from 'react'
import useStore from '../store'
import { getReviewerRequests, makeDecision, loadWorkspace, uploadMedicalCertificate, getDelegates, addDelegate, removeDelegate } from '../api'

function statusClass(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700'
  if (s === 'rejected' || s === 'cancelled') return 'bg-red-50 dark:bg-red-900/30 text-red-700'
  return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700'
}

export default function ReviewerInbox() {
  const { data, reviewer, currentUser, setReviewerId, setReviewerData, setData, setMessage } = useStore()
  const [decisionInFlight, setDecisionInFlight] = useState(null)
  const [delegates, setDelegates] = useState([])
  const [delegateForm, setDelegateForm] = useState({ delegateId: '', submitting: false })
  const [showDelegates, setShowDelegates] = useState(false)
  const employee = data.employees.find((e) => String(e.id) === String(currentUser?.employeeId))

  useEffect(() => {
    if (currentUser && ['HRL2', 'HR', 'OrganizationHead', 'Manager', 'ManagerL2', 'TeamLead'].includes(currentUser.role)) {
      setReviewerId(String(currentUser.employeeId))
    }
    if (currentUser && !['HRL2', 'HR', 'OrganizationHead', 'Manager', 'ManagerL2', 'TeamLead'].includes(currentUser.role)) {
      getDelegates(currentUser.employeeId).then((d) => {
        const list = Array.isArray(d) ? d : d?.delegates || []
        if (list.length > 0) setReviewerId(String(currentUser.employeeId))
      }).catch(() => {})
    }
    if (currentUser?.employeeId) {
      getDelegates(currentUser.employeeId).then((d) => setDelegates(Array.isArray(d) ? d : d?.delegates || [])).catch(() => {})
    }
  }, [currentUser])

  useEffect(() => {
    if (reviewer.reviewerId) {
      getReviewerRequests(reviewer.reviewerId).then((res) => {
        setReviewerData({
          reviewerName: res.reviewer?.fullName || '',
          requests: res.requests || [],
          recentDecisions: res.recentDecisions || [],
          loading: false
        })
      })
    }
  }, [reviewer.reviewerId])

  const handleDecision = async (requestId, action) => {
    if (decisionInFlight) return
    setDecisionInFlight(requestId)
    try {
      await makeDecision({ leaveApplicationId: requestId, approverId: Number(reviewer.reviewerId), action })
      setMessage({ type: 'success', text: action === 'approve' ? 'Leave approved.' : 'Leave rejected.' })
      const res = await getReviewerRequests(reviewer.reviewerId)
      setReviewerData({ requests: res.requests || [], recentDecisions: res.recentDecisions || [] })
      setData(await loadWorkspace())
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    } finally {
      setDecisionInFlight(null)
    }
  }

  const handleAddDelegate = async (e) => {
    e.preventDefault()
    if (delegateForm.submitting || !delegateForm.delegateId) return
    setDelegateForm((f) => ({ ...f, submitting: true }))
    try {
      await addDelegate(currentUser?.employeeId, { delegateId: Number(delegateForm.delegateId), projectId: null })
      setMessage({ type: 'success', text: 'Delegate added.' })
      const d = await getDelegates(currentUser?.employeeId)
      setDelegates(Array.isArray(d) ? d : d?.delegates || [])
      setDelegateForm({ delegateId: '', submitting: false })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
      setDelegateForm((f) => ({ ...f, submitting: false }))
    }
  }

  const handleRemoveDelegate = async (id) => {
    if (!window.confirm('Remove this delegate?')) return
    try {
      await removeDelegate(id)
      setMessage({ type: 'success', text: 'Delegate removed.' })
      const d = await getDelegates(currentUser?.employeeId)
      setDelegates(Array.isArray(d) ? d : d?.delegates || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Reviewer inbox</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">See what your team has sent for approval and respond from here.</p>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Approver</div>
              <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{employee?.fullName || 'Signed-in approver'}</h3>
              <div className="flex gap-2 mt-2">
                {employee && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{data.roles.find((r) => r.id === employee.roleId)?.label || employee.role}</span>}
                {employee?.primaryTeam && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{employee.primaryTeam.name}</span>}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Pending requests</div>
              <h3 className="font-heading font-bold text-2xl text-navy dark:text-white mt-1">{reviewer.loading ? '...' : String(reviewer.requests.length)}</h3>
              <div className="text-xs text-navy/50 dark:text-white/50 mt-1">{reviewer.reviewerName || 'No approver profile loaded'}</div>
            </div>
          </div>
          <hr className="border-navy/10 dark:border-white/10" />
          <div className="space-y-3">
            {reviewer.requests.length === 0 ? (
              <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
                {reviewer.loading ? 'Loading pending requests...' : 'No pending leave requests are assigned to this reviewer right now.'}
              </div>
            ) : reviewer.requests.map((req) => (
              <div key={req.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-heading font-bold text-navy dark:text-white">{req.employeeName}</h3>
                    <div className="text-xs text-navy/50 dark:text-white/50">{req.employeeCode} - {data.roles.find((r) => r.name === req.employeeRole)?.label || req.employeeRole}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{req.leaveTypeName}</span>
                    {req.primaryTeamName && <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 text-navy/70 dark:text-white/70 text-xs font-bold">{req.primaryTeamName}</span>}
                    <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 text-navy/70 dark:text-white/70 text-xs font-bold">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['From', req.fromDate], ['To', req.toDate], ['Applied', req.appliedOn], ['Reason', req.reason || 'No note']].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30/50 dark:bg-amber-900/30 border border-navy/5 dark:border-white/5">
                      <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">{label}</span>
                      <strong className="block text-sm text-navy dark:text-white mt-1">{label === 'Reason' ? value : (value ? new Date(value).toLocaleDateString() : 'N/A')}</strong>
                    </div>
                  ))}
                </div>
                {req.isMedicalLeave && !req.medicalCertificatePath && (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/30">
                    <span className="text-xs font-bold text-red-700">Medical certificate required (leave &gt; 3 days). Employee must upload before approval.</span>
                  </div>
                )}
                {decisionInFlight === req.id && (
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 overflow-hidden relative">
                      <div className="absolute inset-0 w-2/4 rounded-full bg-gradient-to-r from-gold-1 to-teal-400 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-navy/50 dark:text-white/50">Saving decision and sending email...</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => handleDecision(req.id, 'approve')} disabled={Boolean(decisionInFlight) || (req.isMedicalLeave && !req.medicalCertificatePath)} className="gold-button px-5 py-2.5 rounded-xl font-bold text-xs">
                    {decisionInFlight === req.id ? 'Sending...' : (req.isMedicalLeave && !req.medicalCertificatePath ? 'Upload required' : 'Approve')}
                  </button>
                  <button onClick={() => handleDecision(req.id, 'reject')} disabled={Boolean(decisionInFlight)} className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100">
                    {decisionInFlight === req.id ? 'Sending...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <hr className="border-navy/10 dark:border-white/10" />
          <div>
            <h3 className="font-heading font-bold text-lg text-navy dark:text-white">Recent decisions</h3>
            <p className="text-muted dark:text-white/60 text-xs mt-1">Processed requests move here after action.</p>
            <div className="space-y-3 mt-4">
              {reviewer.recentDecisions.length === 0 ? (
                <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
                  {reviewer.loading ? 'Loading recent decisions...' : 'No processed requests for this reviewer yet.'}
                </div>
              ) : reviewer.recentDecisions.map((req) => (
                <div key={req.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50 dark:bg-amber-900/30/20 dark:bg-amber-900/30 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-heading font-bold text-navy dark:text-white">{req.employeeName}</h3>
                      <div className="text-xs text-navy/50 dark:text-white/50">{req.employeeCode} - {data.roles.find((r) => r.name === req.employeeRole)?.label || req.employeeRole}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(req.status)}`}>{req.status}</span>
                      <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 text-navy/70 dark:text-white/70 text-xs font-bold">{req.leaveTypeName}</span>
                      <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 text-navy/70 dark:text-white/70 text-xs font-bold">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[['From', req.fromDate], ['To', req.toDate], ['Applied', req.appliedOn], [req.status === 'Cancelled' ? 'Cancelled' : 'Actioned', req.actionedOn || req.approvedOn || req.rejectedOn]].map(([label, value]) => (
                      <div key={label} className="p-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-navy/5 dark:border-white/5">
                        <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">{label}</span>
                        <strong className="block text-sm text-navy dark:text-white mt-1">{value ? new Date(value).toLocaleDateString() : 'Not yet'}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-navy/70 dark:text-white/70">{req.reason || 'No note'}</p>
                  {req.approvalReason && <p className="text-sm text-navy/50 dark:text-white/50 italic">{req.approvalReason}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Approval delegates</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Delegate your leave approval authority to other employees when you are unavailable.</p>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <button type="button" onClick={() => setShowDelegates(!showDelegates)} className="gold-button px-5 py-2.5 rounded-xl font-bold text-xs">
            {showDelegates ? 'Close' : 'Add delegate'}
          </button>
          {showDelegates && (
            <form onSubmit={handleAddDelegate} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Delegate</label>
                  <select value={delegateForm.delegateId} disabled={delegateForm.submitting} onChange={(e) => setDelegateForm((f) => ({ ...f, delegateId: e.target.value }))} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    <option value="">Select employee</option>
                    {data.employees.filter((e) => String(e.id) !== String(currentUser?.employeeId)).map((e) => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={delegateForm.submitting || !delegateForm.delegateId} className="gold-button px-5 py-2.5 rounded-xl font-bold text-xs">
                    {delegateForm.submitting ? 'Adding...' : 'Add delegate'}
                  </button>
                </div>
              </div>
            </form>
          )}
          {delegates.length === 0 ? (
            <p className="text-sm text-navy/50 dark:text-white/50">No delegates configured.</p>
          ) : (
            <div className="space-y-2">
              {delegates.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-navy dark:text-white">{d.delegateName}</span>
                    {d.projectName && <span className="px-2 py-0.5 rounded bg-navy/5 text-[10px] font-bold text-navy/50">Project: {d.projectName}</span>}
                    {d.isGeneral && <span className="px-2 py-0.5 rounded bg-amber-50 text-[10px] font-bold text-amber-700">General (all leaves)</span>}
                  </div>
                  <button onClick={() => handleRemoveDelegate(d.id)} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 text-[10px] font-bold hover:bg-red-100">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
