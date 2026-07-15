import { useState, useEffect } from 'react'
import useStore from '../store'
import { getDashboardStats, getAttendance } from '../api'
import { Users, CalendarCheck, Ticket, Clock, Briefcase, Bell } from 'lucide-react'

export default function EmployeeDashboard() {
  const { currentUser, dashboard, setDashboard, attendance, setAttendance, notifications, fetchNotifications } = useStore()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {})
    getAttendance(currentUser?.id).then((r) => {
      const today = r.find(a => {
        const d = new Date(a.date).toDateString()
        return d === new Date().toDateString()
      })
      setAttendance({ records: r, today, loading: false })
    }).catch(() => {})
    fetchNotifications()
  }, [])

  const statCards = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Tickets', value: stats?.activeTickets || 0, icon: Ticket, color: 'from-orange-500 to-orange-600' },
    { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: CalendarCheck, color: 'from-purple-500 to-purple-600' },
    { label: "Today's Attendance", value: stats?.todayAttendances || 0, icon: Clock, color: 'from-green-500 to-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-surface p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <card.icon size={22} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-navy dark:text-white">{card.value}</div>
              <div className="text-xs font-semibold text-muted dark:text-white/60">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Apply Leave', view: 'apply', icon: CalendarCheck },
              { label: 'My Tickets', view: 'tickets', icon: Ticket },
              { label: 'Directory', view: 'directory', icon: Users },
              { label: 'My Onboarding', view: 'onboarding', icon: Briefcase },
            ].map((action) => (
              <button
                key={action.view}
                onClick={() => useStore.getState().setActiveView(action.view)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 hover:bg-gold-1/10 transition-all"
              >
                <action.icon size={18} className="text-gold-1" />
                <span className="text-sm font-bold text-navy dark:text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">
            <Gift size={18} className="inline mr-2 text-gold-1" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sage dark:bg-white/5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold">
                {stats?.totalEmployees || 0}
              </div>
              <div>
                <div className="text-sm font-bold text-navy dark:text-white">Total Employees</div>
                <div className="text-xs text-muted dark:text-white/60">Across {stats?.departmentCounts?.length || 0} departments</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sage dark:bg-white/5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                {stats?.activeTickets || 0}
              </div>
              <div>
                <div className="text-sm font-bold text-navy dark:text-white">Active Tickets</div>
                <div className="text-xs text-muted dark:text-white/60">{stats?.pendingLeaves || 0} pending leaves</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">
          <Bell size={18} className="inline mr-2 text-gold-1" />
          Recent Notifications
          {notifications.unreadCount > 0 && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{notifications.unreadCount} new</span>
          )}
        </h3>
        {notifications.list.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">No notifications yet.</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.list.slice(0, 8).map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${n.isRead ? 'border-navy/5 dark:border-white/5' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'}`}>
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

      {stats?.departmentCounts && (
        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">Department Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stats.departmentCounts.map((dept) => (
              <div key={dept.department} className="px-4 py-3 rounded-xl bg-sage dark:bg-white/5">
                <div className="text-sm font-bold text-navy dark:text-white">{dept.department}</div>
                <div className="text-xs text-muted dark:text-white/60">{dept.count} employee{dept.count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
