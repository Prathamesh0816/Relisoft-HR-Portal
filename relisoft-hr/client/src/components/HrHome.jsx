import { useEffect } from 'react'
import useStore from '../store'
import { getReviewerRequests, checkAllBalances, downloadLeaveReport } from '../api'
import { Bell, CheckCheck } from 'lucide-react'

function ActionCard({ title, description, detail, onClick }) {
  return (
    <button onClick={onClick} className="card-surface p-5 text-left min-h-[140px] flex flex-col items-start hover:translate-y-[-2px]">
      <h3 className="font-heading font-bold text-navy dark:text-white">{title}</h3>
      <p className="text-muted text-sm mt-2 leading-relaxed">{description}</p>
      {detail && <span className="mt-auto text-xs font-bold text-navy/50 dark:text-white/50 pt-3">{detail}</span>}
    </button>
  )
}

export default function HrHome() {
  const { data, reviewer, setReviewerId, setAppraisalData, appraisalData, setReviewerData, currentUser, setMessage, notifications, fetchNotifications } = useStore()

  useEffect(() => {
    fetchNotifications()
  }, [])

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

  useEffect(() => {
    if (currentUser && (currentUser.role === 'HRL2' || currentUser.role === 'HR')) {
      setReviewerId(String(currentUser.employeeId))
    }
  }, [currentUser])

  useEffect(() => {
    checkAllBalances().then((res) => {
      setAppraisalData({ employees: res, loading: false, filtered: res })
    }).catch(() => {})
  }, [])

  const pendingCount = reviewer.requests.length
  const empCount = data.employees.length
  const teamCount = data.projects.reduce((sum, p) => sum + p.teams.length, 0)
  const lowBalance = appraisalData.employees.filter((e) => e.remaining <= 2).length

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">For the rest of the employees</h2>
          <p className="text-muted text-sm mt-1">Begin with company-controlled onboarding, leave review, and workforce records.</p>
        </div>
        <div className="px-5 pb-5">
          <div className="grid md:grid-cols-2 gap-3">
            <ActionCard title="New employee onboarding" description="Complete HR-side part 1 with official fields, project assignment, and team allocation." detail={`${empCount} employee records live`} onClick={() => useStore.getState().setActiveView('register')} />
            <ActionCard title="Employee leaves review" description="Review requests routed to HR and keep the approval queue moving." detail={`${pendingCount} pending right now`} onClick={() => useStore.getState().setActiveView('review')} />
            <ActionCard title="Projects and teams" description="Maintain the structure that decides primary-team approvers." detail={`${teamCount} teams configured`} onClick={() => useStore.getState().setActiveView('projects')} />
            <ActionCard title="HR control panel" description="Allow or pause half-day leave for employees." detail={data.hrPolicy?.allowHalfDayLeave ? 'Half day enabled' : 'Half day disabled'} onClick={() => useStore.getState().setActiveView('hrControl')} />
            <ActionCard title="Leave balances" description="Upload Excel sheets for existing employees and keep balances current." detail="Supports bulk HR uploads" onClick={() => useStore.getState().setActiveView('balances')} />
          </div>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Me as an employee</h2>
          <p className="text-muted text-sm mt-1">HR team members still have their own leave and self-onboarding responsibilities.</p>
        </div>
        <div className="px-5 pb-5">
          <div className="grid md:grid-cols-3 gap-3">
            <ActionCard title="My leave requests" description="Raise your own leave request." onClick={() => useStore.getState().setActiveView('apply')} />
            <ActionCard title="My onboarding details" description="Fill part 2 details like PAN, Aadhaar, experience proof." onClick={() => useStore.getState().setActiveView('onboarding')} />
            <ActionCard title="Employee directory" description="Check current structure, team ownership, and approver mapping." onClick={() => useStore.getState().setActiveView('directory')} />
          </div>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Recent Notifications</h2>
              <p className="text-muted text-sm mt-1">Stay updated on latest events</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center relative">
                <Bell size={16} className="text-navy-dark" />
                {notifications.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}</span>
                )}
              </div>
              {notifications.unreadCount > 0 && (
                <button onClick={async () => { try { await (await import('../api')).markAllNotificationsRead(); fetchNotifications() } catch {} }} className="p-1.5 rounded-lg text-muted hover:text-navy dark:hover:text-white"><CheckCheck size={16} /></button>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          {notifications.list.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">No notifications yet.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.list.slice(0, 10).map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${n.isRead ? 'border-navy/5 dark:border-white/5' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy/5 dark:bg-white/10 text-muted">{n.category || 'General'}</span>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-gold-1 shrink-0" />}
                    </div>
                    <div className={`text-sm font-bold truncate mt-0.5 ${n.isRead ? 'text-navy/60 dark:text-white/60' : 'text-navy dark:text-white'}`}>{n.title}</div>
                    {n.message && <div className="text-xs text-muted truncate mt-0.5">{n.message}</div>}
                    <div className="text-[10px] text-muted mt-1">{new Date(n.createdOn).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Appraisal season & reporting</h2>
          <p className="text-muted text-sm mt-1">Review leave patterns before appraisal and export reports.</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-navy dark:text-white">Low leave balance alert</div>
              <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">{lowBalance} employees have 2 or fewer leave days remaining</div>
            </div>
            <button onClick={() => setAppraisalData({ filtered: appraisalData.employees.filter((e) => e.remaining <= 2) })} className="px-5 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
              View details
            </button>
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-navy dark:text-white">Download leave report</div>
              <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">Export complete leave balance report for all employees</div>
            </div>
            <button onClick={async () => { await downloadLeaveReport(); setMessage({ type: 'success', text: 'Leave report downloaded.' }) }} className="px-5 py-2 bg-navy dark:bg-navy-dark text-white font-bold text-xs rounded-xl">
              Export
            </button>
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-navy dark:text-white">Leave calendar</div>
              <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">Month-wise view of all leave activity</div>
            </div>
            <button onClick={() => useStore.getState().setActiveView('calendar')} className="px-5 py-2 border border-navy/10 dark:border-white/10 text-navy dark:text-white font-bold text-xs rounded-xl">
              Open
            </button>
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-navy dark:text-white">Organization pyramid</div>
              <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">Headcount breakdown by role hierarchy</div>
            </div>
            <button onClick={() => useStore.getState().setActiveView('orgchart')} className="px-5 py-2 border border-navy/10 dark:border-white/10 text-navy dark:text-white font-bold text-xs rounded-xl">
              Open
            </button>
          </div>
          {appraisalData.filtered.length > 0 && (
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="font-heading font-bold text-navy dark:text-white text-sm">Filtered: employees with low balance</div>
                <button onClick={() => setAppraisalData({ filtered: [] })} className="text-xs font-bold text-navy/50 dark:text-white/50">Clear</button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {appraisalData.filtered.map((e) => (
                  <div key={`${e.id}-${e.leaveType}`} className="text-xs px-3 py-2 rounded-lg bg-white dark:bg-[var(--bg-secondary)] border border-navy/5 dark:border-white/5 flex items-center justify-between">
                    <span className="font-bold text-navy dark:text-white">{e.fullName} ({e.employeeCode})</span>
                    <span className="text-navy/50 dark:text-white/50">{e.leaveType}: {e.remaining} remaining</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
